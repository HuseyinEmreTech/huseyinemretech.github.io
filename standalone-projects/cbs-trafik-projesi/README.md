# CBS Projesi — Yol Güvenliği ve Trafik Haritaları

**Coğrafi Bilgi Sistemleri** dersi kapsamında hazırlanan bu proje iki tamamlayıcı bileşenden oluşmaktadır:

1. **Küresel ölçek:** Ülke düzeyinde yol trafik mortalitesini gösteren etkileşimli web haritası
2. **Ulusal ölçek:** Türkiye'nin il idari birimleri bazında trafik kazası yoğunluğunu görselleştiren tematik harita

---

## Veri ve Katman Envanteri

| Katman / Veri Seti | Geometri Türü | KRS | Kaynak | Dosya |
|--------------------|---------------|-----|--------|-------|
| Dünya ülke sınırları (1:110m) | Poligon (kapalı çokgen) | WGS 84 (EPSG:4326) | Natural Earth | `data/processed/world_countries_110m.geojson` |
| Yol güvenliği zaman serisi | Öznitelik tablosu (atopografik) | — | Dünya Bankası API (`SH.STA.TRAF.P5`) | `data/processed/world_road_safety.json` |
| Türkiye il sınırları | Poligon | WGS 84 (EPSG:4326) | GADM 4.1 | `data/raw/turkiye_iller_gadm.gpkg` |
| İl bazlı trafik kazası | Öznitelik tablosu | — | TÜİK (örnek) | `data/raw/trafik_kazasi_il_2024.csv` |
| İl merkez noktaları | Nokta | WGS 84 (EPSG:4326) | Photon geocoder + el düzeltme | `data/processed/il_centroids.json` |
| Çok yıllı trafik serisi | Öznitelik tablosu | — | Sentetik ölçekleme (2015–2023) + TÜİK 2024 | `data/processed/trafik_multiyear.json` |
| Karayolu ağı (opsiyonel) | Çizgi (poliline) | WGS 84 (EPSG:4326) | OpenStreetMap / Geofabrik | Manuel indirme (~1.3 GB) |

---

## Projeksiyon ve Koordinat Referans Sistemi

Tüm vektör katmanları **WGS 84 (EPSG:4326)** coğrafi koordinat referans sisteminde saklanmaktadır. Web görselleştirme katmanında (Leaflet / globe.gl) herhangi bir ek projeksiyon dönüşümü uygulanmamaktadır; Leaflet varsayılan olarak **Web Mercator (EPSG:3857)** kullanır, ancak GeoJSON girdi EPSG:4326 formatında sağlanmaktadır.

Türkiye il haritaları için R / ggplot2 ortamında projeksiyon dönüşümü yapılmamıştır; statik PNG çıktıları coğrafi koordinatlarla (`coord_sf`) üretilmektedir.

---

## Sınıflandırma Yöntemi

Koroplet haritalarda öznitelik değerleri **doğal sınıflar (Jenks — Natural Breaks)** yöntemiyle sınıflandırılmıştır. Bu yöntem, veri dağılımındaki doğal kopuklukları temel alarak sınıf içi varyansı en küçük, sınıflar arası varyansı en büyük yapacak şekilde eşik değerleri belirler; trafik mortalitesi gibi sağa çarpık dağılımlar için uygundur.

---

## 1. Küresel Yol Güvenliği Web Atlası

**Yayın adresi:** `/gis-project.html` (kaynak: `public/gis-project.html`)

### Amaç ve Kapsam

Ülkelerin yol trafik kaynaklı ölüm riskini **100.000 kişi başına normalize edilmiş oran** ile karşılaştıran iki görselleştirme sunulmaktadır:

- **2D koroplet haritası** — Leaflet 1.9.4, poligon katmanı üzerine nitel renk skalası
- **3D küresel görselleştirme** — globe.gl 2.32.1, aynı veriyi ekstrüde yüzey olarak temsil eder

### Gösterge Tanımı

| Alan | Değer |
|------|-------|
| Gösterge kodu | `SH.STA.TRAF.P5` |
| Kaynak | Dünya Bankası Açık Veri (WHO GHO kaynaklı tanım) |
| Birim | Ölüm / 100.000 nüfus |
| Kapsam | 2000–2019 (20 yıllık kesit; daha güncel yıllar için API'den yenileme gerekir) |
| Ülke sayısı | 165–166 (yıla bağlı; ISO 3166-1 alpha-3 ile eşleştirme) |

### Vektör Veri Kaynağı

`world_countries_110m.geojson` — Natural Earth 1:110m ölçekli idari sınır katmanı. **173 poligon nesne** içermektedir; mekânsal birleştirme (spatial join) anahtarı `properties.iso3` özniteliğidir.

### Mekânsal Bileşenler

| Bileşen | Dosya |
|---------|-------|
| Harita mantığı (katman yükleme, sınıflandırma, stil) | `gis-choropleth.js` |
| Vektör sınır katmanı (GeoJSON, EPSG:4326) | `data/processed/world_countries_110m.geojson` |
| Normalize edilmiş mortalite zaman serisi | `data/processed/world_road_safety.json` |

---

## 2. Türkiye İl Düzeyi Trafik Kazası Analizi

İl idari poligonlarına tablo verisi **öznitelik birleştirme (attribute join)** ile eklenerek tematik koroplet çıktısı üretilmiştir. Bu katman `/gis-project.html` web atlasına dahil edilmemiştir; bağımsız bir CBS analiz bileşeni olarak çalışmaktadır.

### Veri Kaynakları ve Durum

| Veri Seti | Geometri / Yapı | Kaynak | Dosya | Durum |
|-----------|-----------------|--------|-------|-------|
| Türkiye il idari sınırları | Poligon, WGS 84 | GADM 4.1 | `data/raw/turkiye_iller_gadm.gpkg` | İndirildi |
| Trafik kazası istatistikleri (il bazlı, 2024) | Öznitelik tablosu | TÜİK / örnek | `data/raw/trafik_kazasi_il_2024.csv` | Örnek veri — gerçek TÜİK tablosuyla değiştirilebilir |
| İl merkez noktaları | Nokta, WGS 84 | Photon geocoder + el düzeltme | `data/processed/il_centroids.json` | Mevcut; ileriki nokta yoğunluk haritaları için |
| Çok yıllı trafik serisi | Öznitelik tablosu | Sentetik + TÜİK 2024 | `data/processed/trafik_multiyear.json` | 2024 gerçek; 2015–2023 temsili ölçekleme |
| Karayolu ağı | Çizgi, WGS 84 | OpenStreetMap / Geofabrik | — | Opsiyonel (~1.3 GB) |

### Analiz Akışı

```
TÜİK tablosu (CSV)  ──┐
                       ├─→ Öznitelik Birleştirme (sf::left_join) ──→ Koroplet PNG
GADM il poligonu  ────┘                                               (ggplot2 + coord_sf)
```

### Klasör Yapısı

```
standalone-projects/cbs-trafik-projesi/
├── data/
│   ├── raw/                    # Ham vektör ve tablo verisi
│   └── processed/              # Üretilmiş GeoJSON, JSON ve raster çıktılar
├── scripts/
│   ├── download_data.R         # Veri indirme betiği
│   ├── create_sample_traffic_data.py
│   ├── create_sample_traffic_data.R
│   └── harita_olustur.R        # Mekânsal birleştirme + ggplot2 koroplet üretimi
├── gis-choropleth.js
└── README.md
```

### Tekrarlanabilirlik (Reproducibility)

1. **Tablo verisini güncelleme:** `data/raw/trafik_kazasi_il_2024.csv` dosyasını [TÜİK](https://data.tuik.gov.tr) kaynaklı resmi tabloyla değiştirin. Beklenen sütunlar: `il`, `olum_2024`, `yarali_2024`, `kaza_olumlu_yaralanmali`
2. **Tematik harita üretme:** R paketleri `sf`, `ggplot2`, `dplyr`, `readr` kurulu olmalı → `source("scripts/harita_olustur.R")` (çalışma dizini proje kökü olmalı)
3. **Karayolu yoğunluğu (opsiyonel):** [Geofabrik Turkey](https://download.geofabrik.de/europe/turkey-latest-free.gpkg.zip)

### Çıktılar

| Dosya | İçerik |
|-------|--------|
| `data/processed/harita_olum_2024.png` | İl bazlı trafik ölüm sayısı koroplet haritası |
| `data/processed/harita_yarali_2024.png` | İl bazlı trafik yaralı sayısı koroplet haritası |

Bu raster çıktılar `harita_olustur.R` ile üretilir ve doğrudan görüntülenebilir; web atlası `/gis-project.html` bu katmanları yüklemez.
