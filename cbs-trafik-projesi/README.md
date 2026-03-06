# CBS Projesi - Trafik Kazası & Karayolu Haritaları

Coğrafi Bilgi Sistemleri dersi kapsamında R ile Türkiye il bazında trafik kazası haritası oluşturma projesi.

## Veriler

| Veri | Kaynak | Dosya | Durum |
|------|--------|-------|-------|
| Türkiye il sınırları | GADM 4.1 | `data/raw/turkiye_iller_gadm.gpkg` | ✅ İndirildi |
| Trafik kazası (il bazında) | TÜİK 2024 / Örnek | `data/raw/trafik_kazasi_il_2024.csv` | ✅ Örnek veri |
| Karayolu ağı (opsiyonel) | Geofabrik OSM | ~1.3 GB | Manuel indirme |

## Klasör Yapısı

```
cbs-trafik-projesi/
├── data/
│   ├── raw/          # Ham veriler
│   └── processed/    # İşlenmiş veriler
├── scripts/
│   ├── download_data.R          # R ile veri indirme (geodata paketi)
│   ├── create_sample_traffic_data.py  # Örnek trafik verisi oluşturma
│   └── harita_olustur.R         # Choropleth harita
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
