/* Makine Öğrenmesi - Araba Yıkama Tahmin harita ve form mantığı */
(function () {
    const map = L.map('map').setView([36.5872, 36.1733], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    L.marker([36.5872, 36.1733]).addTo(map).bindPopup('<b>İskenderun</b><br>36.59°K, 36.17°D').openPopup();

    let predictions = {};
    fetch('araba-yikama-tahmin/predictions.json').then(r => r.json()).then(d => { predictions = d; }).catch(() => {});

    const ayAdlari = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    /* Detaylı skor sistemi: yağış (mm) ve yağmur olasılığına göre 0-100 puan */
    function gunlukYikalaSkoru(avg_precip, rain_pct) {
        const precip_ceza = Math.min(avg_precip * 6, 50);
        const pct_ceza = Math.min((rain_pct || 0) * 50, 50);
        return Math.round(Math.max(0, Math.min(100, 100 - precip_ceza - pct_ceza)));
    }
    function genelYikalaSkoru(secilenGunStat, tumGunler, ilkYagmurIdx) {
        const ilkGun = tumGunler[0];
        const ilkGunSkoru = ilkGun ? gunlukYikalaSkoru(ilkGun.avg_precip, ilkGun.rain_pct) : 50;
        const temizGun = ilkYagmurIdx < 0 ? 10 : ilkYagmurIdx;
        const temizBonus = (temizGun / 10) * 40;
        return Math.round(Math.max(0, Math.min(100, ilkGunSkoru * 0.6 + temizBonus)));
    }
    function skorSeviyesi(skor) {
        if (skor >= 80) return { ad: 'Çok Uygun', risk: 'Düşük', class: 'skor-cok-uygun' };
        if (skor >= 60) return { ad: 'Uygun', risk: 'Düşük', class: 'skor-uygun' };
        if (skor >= 40) return { ad: 'Belirsiz', risk: 'Orta', class: 'skor-belirsiz' };
        if (skor >= 20) return { ad: 'Riskli', risk: 'Yüksek', class: 'skor-riskli' };
        return { ad: 'Yıkama', risk: 'Çok Yüksek', class: 'skor-yikama' };
    }

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
            const sp = document.getElementById('skorPaneli');
            if (sp) sp.style.display = 'none';
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
            tumGunler.push({
                tarih: mmdd, avg_precip: prevStat.avg_precip, rain_pct: prevStat.rain_pct,
                su_birikme_riski: prevStat.su_birikme_riski,
                durum: yag ? 'Yıkama' : 'Yıka'
            });
        }
        let ileri = stat.ileri_10_gun;
        if (!ileri || ileri.length === 0) {
            for (let i = 0; i < 9; i++) {
                const key = sonrakiGun(mmdd, i);
                const s = predictions[key];
                if (!s) break;
                const yag = s.avg_precip > 0.5 || s.rain_pct >= 0.5;
                tumGunler.push({
                    tarih: sonrakiGun(mmdd, i + 1) || key, avg_precip: s.avg_precip, rain_pct: s.rain_pct,
                    su_birikme_riski: s.su_birikme_riski,
                    durum: yag ? 'Yıkama' : 'Yıka'
                });
            }
        } else {
            for (let i = 0; i < 9 && i < ileri.length; i++) tumGunler.push(ileri[i]);
        }
        const ilkYagmurIdx = tumGunler.findIndex(g => g.durum === 'Yıkama');
        const t = ilkYagmurIdx < 0 ? 10 : ilkYagmurIdx;
        const isYika = ilkYagmurIdx !== 0;

        /* Genel Yıkama Uygunluğu Skoru + Su birikme riski */
        const genelSkor = genelYikalaSkoru(stat, tumGunler, ilkYagmurIdx);
        const seviye = skorSeviyesi(genelSkor);
        const suBirikme = tumGunler[0] && tumGunler[0].su_birikme_riski != null
            ? Math.round(tumGunler[0].su_birikme_riski * 100) : null;
        const skorPanel = document.getElementById('skorPaneli');
        if (skorPanel) {
            let suHtml = '';
            if (suBirikme != null) {
                const suClass = suBirikme >= 50 ? 'su-yuksek' : suBirikme >= 25 ? 'su-orta' : 'su-dusuk';
                suHtml = '<div class="skor-su-birikme ' + suClass + '"><i class="fas fa-tint"></i> Yerde su birikme riski: %' + suBirikme + '</div>';
            }
            skorPanel.innerHTML = '<div class="skor-ust"><div><span class="skor-deger">' + genelSkor + '</span><span class="skor-label">/100 Yıkama Uygunluğu</span></div><span class="skor-seviye ' + seviye.class + '">' + seviye.ad + '</span></div>' +
                '<div class="skor-bar"><div class="skor-dolum" style="width:' + genelSkor + '%"></div></div>' +
                '<div class="skor-risk"><i class="fas fa-shield-alt"></i> Risk: ' + seviye.risk + '</div>' + suHtml;
            skorPanel.style.display = 'block';
        }

        raporDiv.innerHTML = '';
        tumGunler.forEach(g => {
            const [gm, gd] = g.tarih.split('-');
            const gStr = parseInt(gd) + ' ' + ayAdlari[parseInt(gm) - 1];
            const isY = g.durum === 'Yıka';
            const yuzde = Math.round((g.rain_pct || 0) * 100);
            const gunSkor = gunlukYikalaSkoru(g.avg_precip, g.rain_pct);
            const suPct = g.su_birikme_riski != null ? Math.round(g.su_birikme_riski * 100) : null;
            const suTooltip = suPct != null ? ' Yerde su birikme: %' + suPct : '';
            const satir = document.createElement('div');
            satir.className = 'rapor-satir rapor-satir-skorlu';
            satir.innerHTML = '<span class="tarih">' + gStr + '</span>' +
                '<span class="detay">' + g.avg_precip + ' mm · %' + yuzde + ' yağmur' +
                (suPct != null ? ' · su birikme %' + suPct : '') + '</span>' +
                '<div class="gun-skoru" title="Günlük yıkama uygunluğu: ' + gunSkor + '/100' + suTooltip + '"><div class="gun-skoru-dolum" style="width:' + gunSkor + '%"></div></div>' +
                '<span class="durum result-badge ' + (isY ? 'yika' : 'yikama') + '">' + (isY ? 'Yıka' : 'Yıkama') + '</span>';
            raporDiv.appendChild(satir);
        });

        oneri.innerHTML = '<span class="result-badge ' + (isYika ? 'yika' : 'yikama') + '">' + (isYika ? 'Yıka' : 'Yıkama') + '</span>';
        if (ilkYagmurIdx === 0) oneri.innerHTML += ' Seçtiğiniz gün yağmur ihtimali yüksek, yıkamak mantıklı değil.';
        else if (ilkYagmurIdx < 0) oneri.innerHTML += ' Seçtiğiniz gün ve sonraki 10 gün içinde yağmur beklemiyoruz, arabanız en az 10 gün temiz kalabilir.';
        else if (ilkYagmurIdx === 1) oneri.innerHTML += ' 1 gün sonra yağmur var, arabanız yaklaşık 1 gün temiz kalabilir.';
        else oneri.innerHTML += ' ' + ilkYagmurIdx + ' gün sonra yağmur var, arabanız yaklaşık ' + t + ' gün temiz kalabilir.';
        sonuc.style.display = 'block';
    });
})();
