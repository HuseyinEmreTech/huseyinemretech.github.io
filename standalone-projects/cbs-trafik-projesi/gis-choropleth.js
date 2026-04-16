/**
 * CBS trafik — çok yıllı, menülü choropleth (dairesel yoğunluk).
 * Veri: trafik_multiyear.json + il_centroids.json (aynı klasör data/processed).
 */
;(function () {
  const script = document.querySelector('script[src*="gis-choropleth"]')
  const ROOT = script ? script.src.replace(/gis-choropleth\.js.*$/, '') : '/standalone-projects/cbs-trafik-projesi/'

  const DATA_MULTI = ROOT + 'data/processed/trafik_multiyear.json'
  const DATA_IL_GEO = ROOT + 'data/processed/turkiye_iller_gadm41.json'

  /** Magma benzeri renk (düşük → yüksek) */
  function colorRamp(t) {
    const x = Math.max(0, Math.min(1, t))
    const a = [15, 23, 42]
    const b = [251, 113, 133]
    const c = [252, 211, 77]
    let lo, hi
    if (x < 0.55) {
      lo = a
      hi = b
      return lerpColor(lo, hi, x / 0.55)
    }
    lo = b
    hi = c
    return lerpColor(lo, hi, (x - 0.55) / 0.45)
  }

  function lerpColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ]
  }

  function rgb(arr) {
    return 'rgb(' + arr[0] + ',' + arr[1] + ',' + arr[2] + ')'
  }

  let map
  let layerGroup
  let multiData
  let rawIlGeoJson = null
  let geoJsonLayer = null
  let currentYear = 2024
  let currentMetric = 'olum'
  let fillOpacity = 0.82

  let globeInstance = null
  let globeBundlePromise = null
  let viewMode = '2d'
  let mapFullscreen = false

  const GLOBE_SCRIPT = 'https://cdn.jsdelivr.net/npm/globe.gl@2.32.1/dist/globe.gl.min.js'
  const GLOBE_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
  const GLOBE_BUMP = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'

  function valueFor(il, year, metric) {
    const y = multiData.byYear[String(year)]
    if (!y || !y[il]) return 0
    return metric === 'olum' ? y[il].olum : y[il].yarali
  }

  function extentForYear(year, metric) {
    const y = multiData.byYear[String(year)]
    let lo = Infinity
    let hi = -Infinity
    for (const il of Object.keys(y)) {
      const v = metric === 'olum' ? y[il].olum : y[il].yarali
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    return { lo, hi }
  }

  /** TÜİK / GADM il adlarını tek anahtarda birleştirir (İstanbul ↔ Istanbul vb.) */
  function normalizeForMatch(s) {
    return String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  }

  function augmentIlKeys() {
    if (!rawIlGeoJson || !rawIlGeoJson.features || !multiData || !multiData.byYear) return
    const y0 = multiData.years && multiData.years.length ? String(multiData.years[multiData.years.length - 1]) : '2024'
    const yk = Object.keys(multiData.byYear[y0] || {})
    const idx = {}
    yk.forEach(function (k) {
      idx[normalizeForMatch(k)] = k
    })
    rawIlGeoJson.features.forEach(function (f) {
      f.properties = f.properties || {}
      const name = f.properties.name
      f.properties.ilKey = name ? idx[normalizeForMatch(name)] || null : null
    })
  }

  function leafletGeoFeatureCollection() {
    if (!rawIlGeoJson) return { type: 'FeatureCollection', features: [] }
    return {
      type: 'FeatureCollection',
      features: rawIlGeoJson.features.filter(function (f) {
        return f.properties && f.properties.ilKey
      }),
    }
  }

  function styleForIl(il) {
    if (!multiData || !il) {
      return { fillOpacity: 0, weight: 0 }
    }
    const v = valueFor(il, currentYear, currentMetric)
    const ex = extentForYear(currentYear, currentMetric)
    const lo = ex.lo
    const hi = ex.hi
    const span = hi - lo || 1
    const t = (v - lo) / span
    const tt = Math.pow(Math.max(0, Math.min(1, t)), 0.85)
    const col = colorRamp(tt)
    const strokeW = 0.55 + tt * 2.35
    return {
      fillColor: rgb(col),
      fillOpacity: fillOpacity,
      color: 'rgba(255,255,255,0.42)',
      weight: strokeW,
      lineJoin: 'round',
    }
  }

  function popupHtmlForIl(il) {
    if (!il || !multiData) return ''
    const v = valueFor(il, currentYear, currentMetric)
    const label = currentMetric === 'olum' ? 'Ölüm' : 'Yaralı'
    return (
      '<div style="font-family:Inter,system-ui,sans-serif;min-width:140px">' +
      '<strong style="font-size:15px">' +
      il +
      '</strong><br><span style="opacity:.75">' +
      currentYear +
      '</span><hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:8px 0">' +
      '<span style="color:#a5b4fc">' +
      label +
      ': </span><strong>' +
      v.toLocaleString('tr-TR') +
      '</strong></div>'
    )
  }

  function renderMarkers() {
    if (!layerGroup || !multiData) return

    if (rawIlGeoJson) {
      if (!geoJsonLayer) {
        const fc = leafletGeoFeatureCollection()
        geoJsonLayer = L.geoJSON(fc, {
          style: function (feature) {
            return styleForIl(feature.properties.ilKey)
          },
          onEachFeature: function (feature, lyr) {
            const il = feature.properties.ilKey
            lyr.on('mouseover', function () {
              lyr.setStyle({ weight: 3.2, color: '#22d3ee' })
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                lyr.bringToFront()
              }
            })
            lyr.on('mouseout', function () {
              lyr.setStyle(styleForIl(il))
            })
            lyr.bindPopup(popupHtmlForIl(il))
          },
        }).addTo(layerGroup)
      } else {
        geoJsonLayer.eachLayer(function (lyr) {
          const il = lyr.feature.properties.ilKey
          lyr.setStyle(styleForIl(il))
          lyr.setPopupContent(popupHtmlForIl(il))
        })
      }
    }

    const ex = extentForYear(currentYear, currentMetric)
    updateLegend(ex.lo, ex.hi)
    updateHud(ex.lo, ex.hi)
    syncGlobePolygons()
  }

  function loadGlobeBundle() {
    if (typeof Globe !== 'undefined') return Promise.resolve()
    if (globeBundlePromise) return globeBundlePromise
    globeBundlePromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script')
      s.src = GLOBE_SCRIPT
      s.async = true
      s.onload = function () {
        resolve()
      }
      s.onerror = function () {
        globeBundlePromise = null
        reject(new Error('globe.gl yüklenemedi'))
      }
      document.head.appendChild(s)
    })
    return globeBundlePromise
  }

  function buildGlobePolygons() {
    if (!multiData || !rawIlGeoJson || !rawIlGeoJson.features) return []
    const ex = extentForYear(currentYear, currentMetric)
    const lo = ex.lo
    const hi = ex.hi
    const span = hi - lo || 1
    const list = []
    rawIlGeoJson.features.forEach(function (f) {
      const il = f.properties && f.properties.ilKey
      if (!il || !f.geometry) return
      const v = valueFor(il, currentYear, currentMetric)
      const t = (v - lo) / span
      const tt = Math.pow(Math.max(0, Math.min(1, t)), 0.85)
      const colArr = colorRamp(tt)
      const lab = currentMetric === 'olum' ? 'Ölüm' : 'Yaralı'
      const cap =
        'rgba(' + colArr[0] + ',' + colArr[1] + ',' + colArr[2] + ',' + fillOpacity + ')'
      const side =
        'rgb(' +
        Math.round(colArr[0] * 0.45) +
        ',' +
        Math.round(colArr[1] * 0.45) +
        ',' +
        Math.round(colArr[2] * 0.5) +
        ')'
      list.push({
        geometry: f.geometry,
        il: il,
        v: v,
        lab: lab,
        y: currentYear,
        alt: 0.0035 + tt * 0.055,
        cap: cap,
        side: side,
      })
    })
    return list
  }

  function syncGlobePolygons() {
    if (!globeInstance || viewMode !== '3d') return
    try {
      globeInstance.polygonsData(buildGlobePolygons())
    } catch (e) {
      console.error(e)
    }
  }

  function sizeGlobeToMount() {
    if (!globeInstance) return
    const mount = document.getElementById('gis-globe-mount')
    if (!mount) return
    let w = mount.clientWidth
    let h = mount.clientHeight
    if (w < 2 || h < 2) {
      const p = mount.parentElement
      w = p ? p.clientWidth : 640
      h = p ? p.clientHeight : 520
    }
    globeInstance.width(w).height(h)
  }

  function initGlobeIfNeeded(done) {
    const mount = document.getElementById('gis-globe-mount')
    if (!mount || globeInstance) {
      if (typeof done === 'function') done()
      return
    }
    loadGlobeBundle()
      .then(function () {
        if (typeof Globe !== 'function') throw new Error('Globe')
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (globeInstance) {
              if (typeof done === 'function') done()
              return
            }
            /** globe.gl UMD: Globe()(DOM) — new Globe(DOM) çalışmaz */
            const globeFn = Globe()
            if (typeof globeFn !== 'function') throw new Error('Globe()')
            globeInstance = globeFn(mount)
              .globeImageUrl(GLOBE_TEXTURE)
              .bumpImageUrl(GLOBE_BUMP)
              .backgroundColor('#010103')
              .showGraticules(false)
              .showAtmosphere(true)
              .atmosphereColor('rgba(99,102,241,0.4)')
              .atmosphereAltitude(0.18)
              .polygonsTransitionDuration(650)
              .polygonGeoJsonGeometry('geometry')
              .polygonAltitude('alt')
              .polygonCapColor('cap')
              .polygonSideColor('side')
              .polygonStrokeColor(function () {
                return 'rgba(255,255,255,0.2)'
              })
              .polygonLabel(function (d) {
                return (
                  '<div style="font-family:Inter,system-ui,sans-serif;padding:6px 10px;line-height:1.45">' +
                  '<strong style="font-size:14px">' +
                  d.il +
                  '</strong><br><span style="opacity:.75">' +
                  d.y +
                  '</span><hr style="border:none;border-top:1px solid rgba(255,255,255,.15);margin:6px 0">' +
                  '<span style="color:#a5b4fc">' +
                  d.lab +
                  ': </span><strong>' +
                  d.v.toLocaleString('tr-TR') +
                  '</strong></div>'
                )
              })
              .polygonsData(buildGlobePolygons())
            sizeGlobeToMount()
            globeInstance.pointOfView({ lat: 39.2, lng: 35.5, altitude: 1.95 }, 0)
            if (typeof done === 'function') done()
          })
        })
      })
      .catch(function (e) {
        console.error(e)
        const err = document.getElementById('gis-map-error')
        if (err) {
          err.style.display = 'block'
          err.textContent =
            '3D küre yüklenemedi (ağ veya tarayıcı engeli). 2D harita kullanılmaya devam edebilir.'
        }
        if (typeof done === 'function') done()
      })
  }

  function setViewMode(mode) {
    const s2 = document.getElementById('gis-surface-2d')
    const s3 = document.getElementById('gis-surface-3d')
    const t2 = document.getElementById('gis-view-2d')
    const t3 = document.getElementById('gis-view-3d')
    if (mode === '3d') {
      viewMode = '3d'
      if (s3) s3.removeAttribute('hidden')
      if (s2) s2.setAttribute('hidden', '')
      if (t2) {
        t2.classList.remove('is-active')
        t2.setAttribute('aria-selected', 'false')
      }
      if (t3) {
        t3.classList.add('is-active')
        t3.setAttribute('aria-selected', 'true')
      }
      if (map) {
        requestAnimationFrame(function () {
          map.invalidateSize()
        })
      }
      initGlobeIfNeeded(function () {
        sizeGlobeToMount()
        syncGlobePolygons()
        if (mapFullscreen) {
          window.setTimeout(function () {
            sizeGlobeToMount()
          }, 80)
        }
      })
    } else {
      viewMode = '2d'
      if (mapFullscreen) applyMapFullscreen(false)
      if (s3) s3.setAttribute('hidden', '')
      if (s2) s2.removeAttribute('hidden')
      if (t2) {
        t2.classList.add('is-active')
        t2.setAttribute('aria-selected', 'true')
      }
      if (t3) {
        t3.classList.remove('is-active')
        t3.setAttribute('aria-selected', 'false')
      }
      if (map) {
        requestAnimationFrame(function () {
          map.invalidateSize()
        })
      }
    }
    updateFullscreenButton()
  }

  function updateFullscreenButton() {
    const btn = document.getElementById('gis-fullscreen-btn')
    if (!btn) return
    if (mapFullscreen) {
      btn.disabled = false
      btn.removeAttribute('aria-disabled')
      btn.textContent = 'Tam ekrandan çık'
      btn.title = 'Tam ekrandan çık (Esc)'
      return
    }
    btn.textContent = 'Tam sayfa'
    if (viewMode === '3d') {
      btn.disabled = false
      btn.removeAttribute('aria-disabled')
      btn.title = 'Küre ve menüleri tam ekran göster'
    } else {
      btn.disabled = true
      btn.setAttribute('aria-disabled', 'true')
      btn.title = 'Önce 3D küre sekmesini seçin'
    }
  }

  function applyMapFullscreen(on) {
    const root = document.getElementById('gis-map-root')
    if (!root) return
    mapFullscreen = !!on
    if (mapFullscreen) {
      root.classList.add('gis-map-shell--max')
      document.body.classList.add('cw-page--gis-fullscreen')
      document.body.style.overflow = 'hidden'
    } else {
      root.classList.remove('gis-map-shell--max')
      document.body.classList.remove('cw-page--gis-fullscreen')
      document.body.style.overflow = ''
    }
    updateFullscreenButton()
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sizeGlobeToMount()
        if (map) map.invalidateSize()
        window.setTimeout(function () {
          sizeGlobeToMount()
          if (map) map.invalidateSize()
        }, 120)
      })
    })
  }

  function wireFullscreenButton() {
    const btn = document.getElementById('gis-fullscreen-btn')
    if (!btn) return
    btn.addEventListener('click', function () {
      if (mapFullscreen) {
        applyMapFullscreen(false)
      } else {
        if (viewMode !== '3d') setViewMode('3d')
        applyMapFullscreen(true)
      }
    })
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && mapFullscreen) {
        applyMapFullscreen(false)
      }
    })
  }

  function wireViewTabs() {
    const t2 = document.getElementById('gis-view-2d')
    const t3 = document.getElementById('gis-view-3d')
    if (t2) {
      t2.addEventListener('click', function () {
        setViewMode('2d')
      })
    }
    if (t3) {
      t3.addEventListener('click', function () {
        setViewMode('3d')
      })
    }
  }

  function updateLegend(lo, hi) {
    const el = document.getElementById('gis-legend-gradient')
    if (!el) return
    const steps = 24
    let grad = 'linear-gradient(90deg'
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      grad += ', ' + rgb(colorRamp(Math.pow(t, 0.85)))
    }
    grad += ')'
    el.style.background = grad
    const loEl = document.getElementById('gis-legend-lo')
    const hiEl = document.getElementById('gis-legend-hi')
    if (loEl) loEl.textContent = Math.round(lo).toLocaleString('tr-TR')
    if (hiEl) hiEl.textContent = Math.round(hi).toLocaleString('tr-TR')
  }

  function updateHud(lo, hi) {
    const title = document.getElementById('gis-map-title')
    if (title) {
      title.textContent =
        currentYear +
        ' — İl bazında trafik ' +
        (currentMetric === 'olum' ? 'ölüm' : 'yaralı') +
        ' yoğunluğu'
    }
    const stat = document.getElementById('gis-stat-range')
    if (stat) {
      stat.textContent =
        'Min ' +
        Math.round(lo).toLocaleString('tr-TR') +
        ' — Max ' +
        Math.round(hi).toLocaleString('tr-TR')
    }
  }

  function initMap() {
    const el = document.getElementById('gis-leaflet-map')
    if (!el || typeof L === 'undefined') return

    map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView([39.2, 35.5], 6.2)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution:
        '&copy; OSM &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map)

    layerGroup = L.layerGroup().addTo(map)

    requestAnimationFrame(function () {
      map.invalidateSize()
    })
    window.addEventListener('resize', function () {
      map.invalidateSize()
      sizeGlobeToMount()
    })
  }

  function wireControls() {
    const yearSel = document.getElementById('gis-year')
    const opacityRange = document.getElementById('gis-opacity')
    const opacityVal = document.getElementById('gis-opacity-val')
    const resetBtn = document.getElementById('gis-reset-view')

    function applyYearFromSelect(sel) {
      const y = parseInt(sel.value, 10)
      if (!Number.isFinite(y) || !multiData || !multiData.byYear[String(y)]) return
      currentYear = y
      renderMarkers()
      if (map) {
        requestAnimationFrame(function () {
          map.invalidateSize()
        })
      }
    }

    if (yearSel) {
      yearSel.addEventListener('change', function () {
        applyYearFromSelect(this)
      })
      yearSel.addEventListener('input', function () {
        applyYearFromSelect(this)
      })
    }
    document.querySelectorAll('input[name="gis-metric"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (this.checked) {
          currentMetric = this.value
          renderMarkers()
        }
      })
    })
    if (opacityRange) {
      opacityRange.addEventListener('input', function () {
        fillOpacity = parseInt(this.value, 10) / 100
        if (opacityVal) opacityVal.textContent = this.value + '%'
        renderMarkers()
      })
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (viewMode === '3d' && globeInstance) {
          globeInstance.pointOfView({ lat: 39.2, lng: 35.5, altitude: 1.95 }, 900)
        } else if (map) {
          map.setView([39.2, 35.5], 6.2)
        }
      })
    }
  }

  function boot() {
    initMap()
    wireControls()
    wireViewTabs()
    wireFullscreenButton()
    updateFullscreenButton()

    Promise.all([fetch(DATA_MULTI).then((r) => r.json()), fetch(DATA_IL_GEO).then((r) => r.json())])
      .then(function (results) {
        multiData = results[0]
        rawIlGeoJson = results[1]
        augmentIlKeys()
        const yearSel = document.getElementById('gis-year')
        if (yearSel && multiData.years) {
          yearSel.innerHTML = ''
          multiData.years.forEach(function (y) {
            const o = document.createElement('option')
            o.value = String(y)
            o.textContent = String(y)
            if (y === 2024) o.selected = true
            yearSel.appendChild(o)
          })
          const parsed = parseInt(yearSel.value, 10)
          currentYear = Number.isFinite(parsed) ? parsed : 2024
        }
        const mChecked = document.querySelector('input[name="gis-metric"]:checked')
        if (mChecked) currentMetric = mChecked.value
        renderMarkers()
      })
      .catch(function (e) {
        console.error(e)
        const err = document.getElementById('gis-map-error')
        if (err) {
          err.style.display = 'block'
          err.textContent =
            'Harita verisi veya il sınırları (GeoJSON) yüklenemedi. Sayfayı sunucu üzerinden açtığınızdan emin olun (yerel dosya yolu CORS kısıtlayabilir).'
        }
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
