# CBS projesi — yol güvenliği ve trafik haritaları

**Coğrafi Bilgi Sistemleri** dersi kapsamında bu klasörde iki birbirini tamamlayan çalışma bulunur.

---

## Depodaki güncel durum (bu repoda commit’li sürüm)

Aşağıdaki maddeler, **şu anki dosya içerikleriyle** birebir uyumludur; hoca incelemesinde referans alınabilir.

| Konu | Gerçek durum |
|------|----------------|
| Küresel atlas sayfası | `public/gis-project.html` → yayında `/gis-project.html` |
| Küresel gösterge | Dünya Bankası `SH.STA.TRAF.P5` (meta: WHO GHO kaynaklı tanım) |
| Küresel yıl aralığı | `world_road_safety.json` içinde **2000–2019** (20 yıl) |
| Ülke poligonu sayısı | `world_countries_110m.geojson` → **173** feature, eşleştirme alanı **`properties.iso3`** |
| Yıllık değer kapsamı | JSON’daki `coverageByYear`: çoğu yılda **165** ülke; **2016** için **166** (PSE vb. yıla bağlı) |
| Türkiye ham örnek | `trafik_kazasi_il_2024.csv` — **örnek** tablo (2024 sütunları) |
| Türkiye çok yıllı JSON | `trafik_multiyear.json` — **2015–2024**; dosya içi not: 2024 ölüm/yaralı CSV ile aynı, 2015–2023 **gösterim için ölçeklenmiş demo** (resmi karşılaştırma için TÜİK tabloları gerekir) |
| Web kütüphaneleri (CDN) | Leaflet **1.9.4**, globe.gl **2.32.1** (`gis-project.html` / `gis-choropleth.js` ile uyumlu) |
| **İl bazlı Türkiye haritası (web)** | **Yok** | `/gis-project.html` yalnızca `world_road_safety.json` + `world_countries_110m.geojson` yükler; Türkiye il GeoJSON/CSV/PNG bu sayfaya bağlı değildir |

### Hocaya net özet: webde ne, repoda ne?

| Sunum kanalı | İçerik |
|--------------|--------|
| **Tarayıcıda açılan** `/gis-project.html` | Sadece **dünya ülkesi** choropleth + 3D küre (`gis-choropleth.js` → `world_*` dosyaları). |
| **Repoda (CBS klasörü)** | Türkiye **il** sınırı (`gpkg`), örnek CSV, R ile üretilen **statik PNG** haritalar, isteğe bağlı `trafik_multiyear.json` / `il_centroids.json` — bunlar **ders materyali / tekrarlanabilir pipeline**; şu an **hiçbiri vitrin HTML’ine gömülü veya JS ile çekilmiyor**. |

İl dağılımını göstermek için: `scripts/harita_olustur.R` çalıştırıp `data/processed/harita_olum_2024.png` ve `harita_yarali_2024.png` dosyalarını slaytta veya README üzerinden göstermek (veya ileride ayrı bir `il` Leaflet sayfası yazmak).

---

## 1. Küresel yol güvenliği web atlası (sitede vitrin)

- **Yayın adresi:** `/gis-project.html` (kaynak: repoda `public/gis-project.html`)
- **Amaç:** Ülkelerin yol trafik kaynaklı ölüm riskini **100.000 kişi başına** oranla karşılaştırmak; aynı veriyi **2D choropleth** (Leaflet) ve **3D küre** (globe.gl) ile göstermek.
- **Gösterge:** Dünya Bankası `SH.STA.TRAF.P5` (WHO GHO kaynaklı açıklama; API üzerinden seri).
- **Önemli dosyalar**

| Bileşen | Dosya |
|--------|--------|
| Etkileşimli harita | `gis-choropleth.js` |
| Ülke sınırları (173 poligon, `iso3` özelliği) | `data/processed/world_countries_110m.geojson` |
| Zaman serisi (bu repoda sabitlenmiş kesit) | `data/processed/world_road_safety.json` |

- **Veri güncelliği:** `world_road_safety.json` şu an **2000–2019** son yılı içerir; daha yeni yıllar için World Bank API’den göstergeyi çekip JSON’u yenilemeniz gerekir.

---

## 2. Türkiye il düzeyi trafik kazası (R / ggplot2 — web vitrininde yok)

İl sınırları ve tablo ile **Türkiye choropleth** çıktıları **R ile statik PNG** olarak üretilir; canlı sitedeki `/gis-project.html` bu katmanı **göstermez** (yukarıdaki tablo).

### Veriler

| Veri | Kaynak | Dosya | Durum |
|------|--------|-------|-------|
| Türkiye il sınırları | GADM 4.1 | `data/raw/turkiye_iller_gadm.gpkg` | İndirildi |
| Trafik kazası (il bazında) | TÜİK / örnek | `data/raw/trafik_kazasi_il_2024.csv` | Örnek veri |
| İl merkezleri (WGS84) | Photon / el düzeltme | `data/processed/il_centroids.json` | Repoda var; **şu an sitede kullanılmıyor** (gelecekte il noktası haritası için) |
| Çok yıllı tablo (demo) | Betik / JSON meta açıklaması | `data/processed/trafik_multiyear.json` | **2015–2024**; web atlasında kullanılmıyor; iç notta sentetik ölçekleme belirtiliyor |
| Karayolu ağı (opsiyonel) | Geofabrik OSM | — | Manuel indirme (~1.3 GB) |

### Klasör yapısı (özet)

```
standalone-projects/cbs-trafik-projesi/
├── data/
│   ├── raw/
│   └── processed/          # world_*.json/geojson + TR harita çıktıları
├── scripts/
│   ├── download_data.R
│   ├── create_sample_traffic_data.py
│   ├── create_sample_traffic_data.R
│   └── harita_olustur.R    # ggplot2 ile il choropleth PNG
├── gis-choropleth.js
└── README.md
```

### Kullanım (Türkiye tarafı)

1. **Trafik verisini güncelleme:** Gerçek TÜİK verisi için `data/raw/trafik_kazasi_il_2024.csv` dosyasını [TÜİK](https://data.tuik.gov.tr) tablosuyla değiştirin. Sütunlar: `il`, `olum_2024`, `yarali_2024`, `kaza_olumlu_yaralanmali`
2. **R ile harita:** `sf`, `ggplot2`, `dplyr`, `readr` — `source("scripts/harita_olustur.R")` (çalışma dizini proje klasörü olmalı).
3. **Karayolu yoğunluğu (opsiyonel):** [Geofabrik Turkey](https://download.geofabrik.de/europe/turkey-latest-free.gpkg.zip)

### Çıktı örnekleri (il bazlı görüntü burada)

`data/processed/harita_olum_2024.png`, `harita_yarali_2024.png` — `harita_olustur.R` ile üretilir. Bu dosyalar GitHub’da veya klonlanmış repoda doğrudan açılar; **`gis-project.html` içinde `<img>` veya harita katmanı olarak yer almazlar** — sunumda il haritası gösterecekseniz bu PNG’leri veya R oturumunu kullanın.
