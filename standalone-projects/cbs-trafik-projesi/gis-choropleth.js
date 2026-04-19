/**
 * Küresel yol güvenliği atlası.
 * Veri: World Bank / WHO yol trafik ölüm oranı + dünya ülke GeoJSON.
 */
;(function () {
  const script = document.querySelector('script[src*="gis-choropleth"]')
  const ROOT = script ? script.src.replace(/gis-choropleth\.js.*$/, '') : '/standalone-projects/cbs-trafik-projesi/'

  const DATA_SERIES = ROOT + 'data/processed/world_road_safety.json'
  const DATA_COUNTRIES = ROOT + 'data/processed/world_countries_110m.geojson'
  const GLOBE_SCRIPT = 'https://cdn.jsdelivr.net/npm/globe.gl@2.32.1/dist/globe.gl.min.js'
  const GLOBE_TEXTURE = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
  const GLOBE_BUMP = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'

  const WORLD_CENTER = [20, 0]
  const WORLD_ZOOM = 2.2
  const GLOBE_VIEW = { lat: 20, lng: 10, altitude: 2.2 }

  let map
  let layerGroup
  let geoJsonLayer = null
  let seriesData = null
  let countriesGeoJson = null
  let currentYear = 2019
  let fillOpacity = 0.82
  let globeInstance = null
  let globeBundlePromise = null
  let viewMode = '2d'
  let mapFullscreen = false
  let selectedIso3 = null

  function colorRamp(t) {
    const x = Math.max(0, Math.min(1, t))
    const a = [15, 23, 42]
    const b = [251, 113, 133]
    const c = [252, 211, 77]
    if (x < 0.55) return lerpColor(a, b, x / 0.55)
    return lerpColor(b, c, (x - 0.55) / 0.45)
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

  function valueFor(iso3, year) {
    const y = seriesData && seriesData.byYear ? seriesData.byYear[String(year)] : null
    if (!y) return null
    return typeof y[iso3] === 'number' ? y[iso3] : null
  }

  function computeYearStats(year) {
    const y = seriesData && seriesData.byYear ? seriesData.byYear[String(year)] : null
    if (!y) return { avg: null, rankByIso: new Map(), n: 0 }
    const entries = Object.keys(y)
      .map(function (iso3) {
        return [iso3, y[iso3]]
      })
      .filter(function (e) {
        return typeof e[1] === 'number'
      })
    const n = entries.length
    if (!n) return { avg: null, rankByIso: new Map(), n: 0 }
    let sum = 0
    entries.forEach(function (e) {
      sum += e[1]
    })
    const avg = sum / n
    entries.sort(function (a, b) {
      return b[1] - a[1]
    })
    const rankByIso = new Map()
    let r = 1
    entries.forEach(function (e, i) {
      if (i > 0 && e[1] !== entries[i - 1][1]) r = i + 1
      rankByIso.set(e[0], r)
    })
    return { avg, rankByIso, n }
  }

  function extentForYear(year) {
    const y = seriesData && seriesData.byYear ? seriesData.byYear[String(year)] : null
    if (!y) return { lo: 0, hi: 0 }
    let lo = Infinity
    let hi = -Infinity
    Object.keys(y).forEach(function (iso3) {
      const v = y[iso3]
      if (typeof v !== 'number') return
      if (v < lo) lo = v
      if (v > hi) hi = v
    })
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { lo: 0, hi: 0 }
    return { lo, hi }
  }

  function displayNameFor(feature) {
    const iso3 = feature && feature.properties ? feature.properties.iso3 : null
    if (!iso3) return 'Bilinmiyor'
    return (
      (seriesData && seriesData.countryNames && seriesData.countryNames[iso3]) ||
      feature.properties.name ||
      iso3
    )
  }

  function styleForCountry(feature) {
    const iso3 = feature && feature.properties ? feature.properties.iso3 : null
    const value = iso3 ? valueFor(iso3, currentYear) : null
    if (value == null) {
      return {
        fillColor: 'rgba(148,163,184,0.18)',
        fillOpacity: 0.25,
        color: 'rgba(255,255,255,0.12)',
        weight: 0.6,
        lineJoin: 'round',
      }
    }
    const { lo, hi } = extentForYear(currentYear)
    const span = hi - lo || 1
    const t = (value - lo) / span
    const tt = Math.pow(Math.max(0, Math.min(1, t)), 0.85)
    const col = colorRamp(tt)
    return {
      fillColor: rgb(col),
      fillOpacity: fillOpacity,
      color: 'rgba(255,255,255,0.32)',
      weight: 0.55 + tt * 1.95,
      lineJoin: 'round',
    }
  }

  function popupHtmlForFeature(feature) {
    const iso3 = feature && feature.properties ? feature.properties.iso3 : null
    const name = displayNameFor(feature)
    const value = iso3 ? valueFor(iso3, currentYear) : null
    return (
      '<div style="font-family:Inter,system-ui,sans-serif;min-width:160px">' +
      '<strong style="font-size:15px">' +
      name +
      '</strong><br><span style="opacity:.75">' +
      (iso3 || '---') +
      ' · ' +
      currentYear +
      '</span><hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:8px 0">' +
      '<span style="color:#a5b4fc">Olum / 100k: </span><strong>' +
      (value == null ? 'Veri yok' : value.toFixed(1).replace('.', ',')) +
      '</strong></div>'
    )
  }

  function renderMapPolygons() {
    if (!layerGroup || !countriesGeoJson) return
    if (!geoJsonLayer) {
      geoJsonLayer = L.geoJSON(countriesGeoJson, {
        style: function (feature) {
          return styleForCountry(feature)
        },
        onEachFeature: function (feature, layer) {
          layer.on('mouseover', function () {
            layer.setStyle({ weight: 2.7, color: '#22d3ee' })
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront()
          })
          layer.on('mouseout', function () {
            layer.setStyle(styleForCountry(feature))
          })
          layer.bindPopup(popupHtmlForFeature(feature))
          layer.on('click', function () {
            const iso = feature && feature.properties ? feature.properties.iso3 : null
            selectedIso3 = iso || null
            updateSelectionPanel()
          })
        },
      }).addTo(layerGroup)
    } else {
      geoJsonLayer.eachLayer(function (layer) {
        layer.setStyle(styleForCountry(layer.feature))
        layer.setPopupContent(popupHtmlForFeature(layer.feature))
      })
    }
  }

  function buildGlobePolygons() {
    if (!countriesGeoJson || !seriesData) return []
    const { lo, hi } = extentForYear(currentYear)
    const span = hi - lo || 1
    return countriesGeoJson.features.map(function (feature) {
      const iso3 = feature.properties.iso3
      const name = displayNameFor(feature)
      const value = valueFor(iso3, currentYear)
      if (value == null) {
        return {
          geometry: feature.geometry,
          iso3,
          name,
          valueText: 'Veri yok',
          year: currentYear,
          alt: 0.0012,
          cap: 'rgba(148,163,184,0.16)',
          side: 'rgb(48,56,69)',
        }
      }
      const t = (value - lo) / span
      const tt = Math.pow(Math.max(0, Math.min(1, t)), 0.85)
      const colArr = colorRamp(tt)
      return {
        geometry: feature.geometry,
        iso3,
        name,
        valueText: value.toFixed(1).replace('.', ','),
        year: currentYear,
        alt: 0.003 + tt * 0.095,
        cap: 'rgba(' + colArr[0] + ',' + colArr[1] + ',' + colArr[2] + ',' + fillOpacity + ')',
        side:
          'rgb(' +
          Math.round(colArr[0] * 0.45) +
          ',' +
          Math.round(colArr[1] * 0.45) +
          ',' +
          Math.round(colArr[2] * 0.5) +
          ')',
      }
    })
  }

  function syncGlobePolygons() {
    if (!globeInstance || viewMode !== '3d') return
    globeInstance.polygonsData(buildGlobePolygons())
  }

  function sizeGlobeToMount() {
    if (!globeInstance) return
    const mount = document.getElementById('gis-globe-mount')
    if (!mount) return
    let w = mount.clientWidth
    let h = mount.clientHeight
    if (w < 2 || h < 2) {
      const parent = mount.parentElement
      w = parent ? parent.clientWidth : 960
      h = parent ? parent.clientHeight : 520
    }
    globeInstance.width(w).height(h)
  }

  function loadGlobeBundle() {
    if (typeof Globe !== 'undefined') return Promise.resolve()
    if (globeBundlePromise) return globeBundlePromise
    globeBundlePromise = new Promise(function (resolve, reject) {
      const s = document.createElement('script')
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
                return 'rgba(255,255,255,0.18)'
              })
              .polygonLabel(function (d) {
                return (
                  '<div style="font-family:Inter,system-ui,sans-serif;padding:6px 10px;line-height:1.45">' +
                  '<strong style="font-size:14px">' +
                  d.name +
                  '</strong><br><span style="opacity:.75">' +
                  d.iso3 +
                  ' · ' +
                  d.year +
                  '</span><hr style="border:none;border-top:1px solid rgba(255,255,255,.15);margin:6px 0">' +
                  '<span style="color:#a5b4fc">Ölüm / 100k: </span><strong>' +
                  d.valueText +
                  '</strong></div>'
                )
              })
              .polygonsData(buildGlobePolygons())
            if (typeof globeInstance.onPolygonClick === 'function') {
              globeInstance.onPolygonClick(function (d) {
                if (d && d.iso3) {
                  selectedIso3 = d.iso3
                  updateSelectionPanel()
                }
              })
            }
            sizeGlobeToMount()
            globeInstance.pointOfView(GLOBE_VIEW, 0)
            if (typeof done === 'function') done()
          })
        })
      })
      .catch(function (err) {
        console.error(err)
        const errorBox = document.getElementById('gis-map-error')
        if (errorBox) {
          errorBox.style.display = 'block'
          errorBox.textContent =
            '3D küre yüklenemedi (ağ veya tarayıcı engeli). 2D harita kullanılmaya devam edebilir.'
        }
        if (typeof done === 'function') done()
      })
  }

  function updateLegend(lo, hi) {
    const gradient = document.getElementById('gis-legend-gradient')
    if (!gradient) return
    const steps = 24
    let css = 'linear-gradient(90deg'
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      css += ', ' + rgb(colorRamp(Math.pow(t, 0.85)))
    }
    css += ')'
    gradient.style.background = css
    const loEl = document.getElementById('gis-legend-lo')
    const hiEl = document.getElementById('gis-legend-hi')
    if (loEl) loEl.textContent = lo.toFixed(1).replace('.', ',')
    if (hiEl) hiEl.textContent = hi.toFixed(1).replace('.', ',')
  }

  function updateSelectionPanel() {
    const countryEl = document.getElementById('gis-sel-country')
    const valueEl = document.getElementById('gis-sel-value')
    const avgEl = document.getElementById('gis-sel-avg')
    const rankEl = document.getElementById('gis-sel-rank')
    const clearBtn = document.getElementById('gis-sel-clear')
    const hintEl = document.getElementById('gis-sel-hint')
    if (!countryEl || !seriesData) return
    const fmt = function (x) {
      return x.toFixed(1).replace('.', ',')
    }
    const stats = computeYearStats(currentYear)
    if (avgEl) {
      avgEl.textContent = stats.avg == null ? '—' : fmt(stats.avg)
    }
    if (!selectedIso3) {
      countryEl.textContent = 'Haritadan seçin'
      if (valueEl) valueEl.textContent = '—'
      if (rankEl) rankEl.textContent = '—'
      if (clearBtn) clearBtn.hidden = true
      if (hintEl) hintEl.hidden = false
      return
    }
    if (hintEl) hintEl.hidden = true
    if (clearBtn) clearBtn.hidden = false
    const name =
      (seriesData.countryNames && seriesData.countryNames[selectedIso3]) || selectedIso3
    const v = valueFor(selectedIso3, currentYear)
    countryEl.textContent = name + ' (' + selectedIso3 + ')'
    if (valueEl) valueEl.textContent = v == null ? 'Veri yok' : fmt(v)
    if (rankEl) {
      if (v == null) {
        rankEl.textContent = '—'
      } else {
        const rank = stats.rankByIso.get(selectedIso3)
        rankEl.textContent =
          rank != null && stats.n ? rank + ' / ' + stats.n + ' ülke' : '—'
      }
    }
  }

  function updateTopCountries() {
    const list = document.getElementById('gis-top-countries')
    if (!list || !seriesData) return
    const yearData = seriesData.byYear[String(currentYear)] || {}
    const top = Object.entries(yearData)
      .filter(function (entry) {
        return typeof entry[1] === 'number'
      })
      .sort(function (a, b) {
        return b[1] - a[1]
      })
      .slice(0, 5)

    list.innerHTML = top
      .map(function (entry) {
        const iso3 = entry[0]
        const value = entry[1]
        const name = seriesData.countryNames[iso3] || iso3
        return '<li><strong>' + name + '</strong> <span>(' + iso3 + ')</span> · ' + value.toFixed(1).replace('.', ',') + '</li>'
      })
      .join('')
  }

  function updateHud(lo, hi) {
    const title = document.getElementById('gis-map-title')
    if (title) title.textContent = currentYear + ' — Ülke bazlı yol trafik ölüm oranı'
    const stat = document.getElementById('gis-stat-range')
    if (stat) {
      const coverage =
        seriesData && seriesData.coverageByYear ? seriesData.coverageByYear[String(currentYear)] || 0 : 0
      stat.textContent =
        'Min ' +
        lo.toFixed(1).replace('.', ',') +
        ' — Max ' +
        hi.toFixed(1).replace('.', ',') +
        ' · Kapsam ' +
        coverage +
        ' ülke'
    }
  }

  function renderAll() {
    if (!seriesData || !countriesGeoJson) return
    renderMapPolygons()
    const { lo, hi } = extentForYear(currentYear)
    updateLegend(lo, hi)
    updateHud(lo, hi)
    updateSelectionPanel()
    updateTopCountries()
    syncGlobePolygons()
  }

  function initMap() {
    const el = document.getElementById('gis-leaflet-map')
    if (!el || typeof L === 'undefined') return
    map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
      worldCopyJump: true,
    }).setView(WORLD_CENTER, WORLD_ZOOM)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM &copy; <a href="https://carto.com/attributions">CARTO</a>',
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
      initGlobeIfNeeded(function () {
        sizeGlobeToMount()
        syncGlobePolygons()
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
      if (map) requestAnimationFrame(function () { map.invalidateSize() })
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
        if (map) map.invalidateSize()
        sizeGlobeToMount()
      })
    })
  }

  function wireViewTabs() {
    const t2 = document.getElementById('gis-view-2d')
    const t3 = document.getElementById('gis-view-3d')
    if (t2) t2.addEventListener('click', function () { setViewMode('2d') })
    if (t3) t3.addEventListener('click', function () { setViewMode('3d') })
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
      if (ev.key === 'Escape' && mapFullscreen) applyMapFullscreen(false)
    })
  }

  function wireControls() {
    const yearSel = document.getElementById('gis-year')
    const opacityRange = document.getElementById('gis-opacity')
    const opacityVal = document.getElementById('gis-opacity-val')
    const resetBtn = document.getElementById('gis-reset-view')

    if (yearSel) {
      yearSel.addEventListener('change', function () {
        const year = parseInt(this.value, 10)
        if (!Number.isFinite(year)) return
        currentYear = year
        renderAll()
      })
    }
    if (opacityRange) {
      opacityRange.addEventListener('input', function () {
        fillOpacity = parseInt(this.value, 10) / 100
        if (opacityVal) opacityVal.textContent = this.value + '%'
        renderAll()
      })
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        selectedIso3 = null
        updateSelectionPanel()
        if (viewMode === '3d' && globeInstance) {
          globeInstance.pointOfView(GLOBE_VIEW, 900)
        } else if (map) {
          map.setView(WORLD_CENTER, WORLD_ZOOM)
        }
      })
    }
    const clearSel = document.getElementById('gis-sel-clear')
    if (clearSel) {
      clearSel.addEventListener('click', function () {
        selectedIso3 = null
        updateSelectionPanel()
      })
    }
  }

  function populateYearSelect() {
    const yearSel = document.getElementById('gis-year')
    if (!yearSel || !seriesData || !seriesData.years) return
    yearSel.innerHTML = ''
    seriesData.years
      .slice()
      .sort(function (a, b) { return b - a })
      .forEach(function (year, index) {
        const option = document.createElement('option')
        option.value = String(year)
        option.textContent = String(year)
        if (index === 0) option.selected = true
        yearSel.appendChild(option)
      })
    currentYear = parseInt(yearSel.value, 10)
  }

  function boot() {
    initMap()
    wireControls()
    wireViewTabs()
    wireFullscreenButton()
    updateFullscreenButton()

    Promise.all([
      fetch(DATA_SERIES).then(function (r) { return r.json() }),
      fetch(DATA_COUNTRIES).then(function (r) { return r.json() }),
    ])
      .then(function (results) {
        seriesData = results[0]
        countriesGeoJson = results[1]
        populateYearSelect()
        renderAll()
      })
      .catch(function (err) {
        console.error(err)
        const errorBox = document.getElementById('gis-map-error')
        if (errorBox) {
          errorBox.style.display = 'block'
          errorBox.textContent =
            'Harita verisi veya ülke sınırları yüklenemedi. Sayfayı sunucu üzerinden açtığınızdan emin olun.'
        }
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
