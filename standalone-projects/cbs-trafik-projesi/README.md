# CBS Projesi - Trafik Kazası & Karayolu Haritaları

Coğrafi Bilgi Sistemleri dersi kapsamında R ile Türkiye il bazında trafik kazası haritası oluşturma projesi.

## Veriler

| Veri | Kaynak | Dosya | Durum |
|------|--------|-------|-------|
| Türkiye il sınırları | GADM 4.1 | `data/raw/turkiye_iller_gadm.gpkg` | ✅ İndirildi |
| Trafik kazası (il bazında) | TÜİK 2024 / Örnek | `data/raw/trafik_kazasi_il_2024.csv` | ✅ Örnek veri |
| Çok yıllı web haritası | CSV türetilmiş | `data/processed/trafik_multiyear.json` | 2015–2024 gösterim |
| İl merkezleri (WGS84) | Photon / el düzeltme | `data/processed/il_centroids.json` | Leaflet daireleri |
| Karayolu ağı (opsiyonel) | Geofabrik OSM | ~1.3 GB | Manuel indirme |

## Klasör Yapısı

```
standalone-projects/cbs-trafik-projesi/
├── data/
│   ├── raw/          # Ham veriler
│   └── processed/    # İşlenmiş veriler
├── scripts/
│   ├── download_data.R          # R ile veri indirme (geodata paketi)
│   ├── create_sample_traffic_data.py  # Örnek trafik verisi oluşturma
│   └── harita_olustur.R         # Choropleth harita
├── gis-choropleth.js            # /gis-project.html Leaflet arayüzü
└── README.md
```

## Kullanım

### 1. Trafik verisini güncelleme
Gerçek TÜİK verisi için `data/raw/trafik_kazasi_il_2024.csv` dosyasını data.tuik.gov.tr'den indirilen tabloyla güncelleyin. Sütunlar: `il`, `olum_2024`, `yarali_2024`, `kaza_olumlu_yaralanmali`

### 2. R ile harita oluşturma
```r
# Gerekli paketler: sf, ggplot2, dplyr, readr
source("scripts/harita_olustur.R")
```

### 3. Karayolu yoğunluğu (opsiyonel)
Geofabrik'ten indirin:
```
https://download.geofabrik.de/europe/turkey-latest-free.gpkg.zip
```
