/* Araba Yıkama Tahmin - Harita ve form mantığı */
(function () {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    // CARTO şablonunda {r} retina soneki Leaflet tarafından çözülmez; URL bozulup gri karo oluşur.
    const map = L.map(mapEl, { scrollWheelZoom: true }).setView([36.5872, 36.1733], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
    }).addTo(map);
    L.marker([36.5872, 36.1733])
        .addTo(map)
        .bindPopup('<b>İskenderun</b><br>Veri merkezi (36.59°K, 36.17°D)')
        .openPopup();

    function refitMap() {
        map.invalidateSize();
    }
    requestAnimationFrame(refitMap);
    window.addEventListener('load', refitMap);
    window.addEventListener('resize', refitMap);

    let predictions = {};
    fetch('predictions.json')
        .then(r => r.json())
        .then(data => { predictions = data; })
        .catch(() => console.warn('predictions.json yüklenemedi'));

    const ayAdlari = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    function sonrakiGun(mmdd, n) {
        const d = new Date(mmdd + '-2024');
        d.setDate(d.getDate() + n);
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const g = String(d.getDate()).padStart(2, '0');
        return m + '-' + g;
    }
    function oncekiGun(mmdd) { return sonrakiGun(mmdd, -1); }

    document.getElementById('tahminBtn').addEventListener('click', () => {
        const val = document.getElementById('tarihSec').value;
        if (!val) return;
        const [y, m, d] = val.split('-');
        const mmdd = m + '-' + d;
        const stat = predictions[mmdd];
        const sonuc = document.getElementById('tahminSonuc');
        const baslik = document.getElementById('sonucBaslik');
        const oneri = document.getElementById('sonucOneri');

        if (!stat) {
            baslik.textContent = 'Veri bulunamadı';
            document.getElementById('sonucOzet').textContent = 'Bu tarih için yeterli geçmiş veri yok.';
            document.getElementById('rapor10Gun').innerHTML = '';
            oneri.innerHTML = '';
            sonuc.style.display = 'block';
            return;
        }

        const gunStr = parseInt(d);
        const ayStr = ayAdlari[parseInt(m) - 1];
        baslik.textContent = gunStr + ' ' + ayStr + ' ' + y + ' için';
        const ozet = document.getElementById('sonucOzet');
        ozet.textContent = 'Geçmiş 20 yıla göre seçtiğiniz gün ve sonrası için 10 günlük hava raporu (' + stat.n_years + ' yıl verisi).';

        const raporDiv = document.getElementById('rapor10Gun');
        const tumGunler = [];
        const prevStat = predictions[oncekiGun(mmdd)];
        if (prevStat) {
            const yag = prevStat.avg_precip > 0.5 || prevStat.rain_pct >= 0.5;
            tumGunler.push({ tarih: mmdd, avg_precip: prevStat.avg_precip, rain_pct: prevStat.rain_pct, durum: yag ? 'Yıkama' : 'Yıka' });
        }
        let ileri = stat.ileri_10_gun;
        if (!ileri || ileri.length === 0) {
            for (let i = 0; i < 9; i++) {
                const key = sonrakiGun(mmdd, i);
                const s = predictions[key];
                if (!s) break;
                const yag = s.avg_precip > 0.5 || s.rain_pct >= 0.5;
                tumGunler.push({ tarih: sonrakiGun(mmdd, i + 1) || key, avg_precip: s.avg_precip, rain_pct: s.rain_pct, durum: yag ? 'Yıkama' : 'Yıka' });
            }
        } else {
            for (let i = 0; i < 9 && i < ileri.length; i++) tumGunler.push(ileri[i]);
        }
        raporDiv.innerHTML = '';
        tumGunler.forEach(function (g) {
            const [gm, gd] = g.tarih.split('-');
            const gStr = parseInt(gd) + ' ' + ayAdlari[parseInt(gm) - 1];
            const isY = g.durum === 'Yıka';
            const yuzde = Math.round((g.rain_pct || 0) * 100);
            const satir = document.createElement('div');
            satir.className = 'rapor-satir';
            satir.innerHTML = '<span class="tarih">' + gStr + '</span><span class="detay">' + g.avg_precip + ' mm yağış · <strong>%' + yuzde + ' yağmur ihtimali</strong></span><span class="durum result-badge ' + (isY ? 'yika' : 'yikama') + '">' + (isY ? 'Yıka' : 'Yıkama') + '</span>';
            raporDiv.appendChild(satir);
        });

        const ilkYagmurIdx = tumGunler.findIndex(g => g.durum === 'Yıkama');
        const t = ilkYagmurIdx < 0 ? 10 : ilkYagmurIdx;
        const isYika = ilkYagmurIdx !== 0;
        oneri.innerHTML = '<span class="result-badge ' + (isYika ? 'yika' : 'yikama') + '">' + (isYika ? 'Yıka' : 'Yıkama') + '</span>';
        if (ilkYagmurIdx === 0) {
            oneri.innerHTML += ' Seçtiğiniz gün yağmur ihtimali yüksek, yıkamak mantıklı değil.';
        } else if (ilkYagmurIdx < 0) {
            oneri.innerHTML += ' Seçtiğiniz gün ve sonraki 10 gün içinde yağmur beklemiyoruz, arabanız en az 10 gün temiz kalabilir.';
        } else if (ilkYagmurIdx === 1) {
            oneri.innerHTML += ' 1 gün sonra yağmur var, arabanız yaklaşık 1 gün temiz kalabilir.';
        } else {
            oneri.innerHTML += ' ' + ilkYagmurIdx + ' gün sonra yağmur var, arabanız yaklaşık ' + t + ' gün temiz kalabilir.';
        }
        sonuc.style.display = 'block';
    });
})();
