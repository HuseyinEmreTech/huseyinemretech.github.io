/* Makine Öğrenmesi - Araba Yıkama Tahmin harita ve form mantığı */
(function () {
    const map = L.map('map').setView([36.5872, 36.1733], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    L.marker([36.5872, 36.1733]).addTo(map).bindPopup('<b>İskenderun</b><br>36.59°K, 36.17°D').openPopup();

    let predictions = {};
    fetch('araba-yikama-tahmin/predictions.json').then(r => r.json()).then(d => { predictions = d; }).catch(() => {});

    const ayAdlari = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    function sonrakiGun(mmdd, n) {
        const d = new Date(mmdd + '-2024');
        d.setDate(d.getDate() + n);
        return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
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
        document.getElementById('sonucOzet').textContent = 'Geçmiş 20 yıla göre seçtiğiniz gün ve sonrası için 10 günlük hava raporu (' + stat.n_years + ' yıl verisi).';

        const raporDiv = document.getElementById('rapor10Gun');
        const tumGunler = [];
        const prevStat = predictions[oncekiGun(mmdd)];
        if (prevStat) {
            const yag = prevStat.avg_precip > 0.5 || prevStat.rain_pct >= 0.5;
            tumGunler.push({ tarih: mmdd, avg_precip: prevStat.avg_precip, rain_pct: prevStat.rain_pct, durum: yag ? 'Yıkama' : 'Yıkala' });
        }
        let ileri = stat.ileri_10_gun;
        if (!ileri || ileri.length === 0) {
            for (let i = 0; i < 9; i++) {
                const key = sonrakiGun(mmdd, i);
                const s = predictions[key];
                if (!s) break;
                const yag = s.avg_precip > 0.5 || s.rain_pct >= 0.5;
                tumGunler.push({ tarih: sonrakiGun(mmdd, i + 1) || key, avg_precip: s.avg_precip, rain_pct: s.rain_pct, durum: yag ? 'Yıkama' : 'Yıkala' });
            }
        } else {
            for (let i = 0; i < 9 && i < ileri.length; i++) tumGunler.push(ileri[i]);
        }
        raporDiv.innerHTML = '';
        tumGunler.forEach(g => {
            const [gm, gd] = g.tarih.split('-');
            const gStr = parseInt(gd) + ' ' + ayAdlari[parseInt(gm) - 1];
            const isY = g.durum === 'Yıkala';
            const yuzde = Math.round((g.rain_pct || 0) * 100);
            const satir = document.createElement('div');
            satir.className = 'rapor-satir';
            satir.innerHTML = '<span class="tarih">' + gStr + '</span><span class="detay">' + g.avg_precip + ' mm yağış · <strong>%' + yuzde + ' yağmur ihtimali</strong></span><span class="durum result-badge ' + (isY ? 'yika' : 'yikama') + '">' + g.durum + '</span>';
            raporDiv.appendChild(satir);
        });

        const ilkYagmurIdx = tumGunler.findIndex(g => g.durum === 'Yıkama');
        const t = ilkYagmurIdx < 0 ? 10 : ilkYagmurIdx;
        const isYika = ilkYagmurIdx !== 0;
        oneri.innerHTML = '<span class="result-badge ' + (isYika ? 'yika' : 'yikama') + '">' + (isYika ? 'Yıkala' : 'Yıkama') + '</span>';
        if (ilkYagmurIdx === 0) oneri.innerHTML += ' Seçtiğiniz gün yağmur ihtimali yüksek, yıkamak mantıklı değil.';
        else if (ilkYagmurIdx < 0) oneri.innerHTML += ' Seçtiğiniz gün ve sonraki 10 gün içinde yağmur beklemiyoruz, arabanız en az 10 gün temiz kalabilir.';
        else if (ilkYagmurIdx === 1) oneri.innerHTML += ' 1 gün sonra yağmur var, arabanız yaklaşık 1 gün temiz kalabilir.';
        else oneri.innerHTML += ' ' + ilkYagmurIdx + ' gün sonra yağmur var, arabanız yaklaşık ' + t + ' gün temiz kalabilir.';
        sonuc.style.display = 'block';
    });
})();
