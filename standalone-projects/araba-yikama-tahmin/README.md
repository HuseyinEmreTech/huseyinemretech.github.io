# Araba Yıkama Tahmin Projesi

---

## Başlangıç – Herkes İçin

### Ne yapar?

Bu proje **yarın yağmur olup olmayacağını** tahmin eder ve sana şunu söyler: **Bugün arabamı yıkamalı mıyım?**

İskenderun'daki 20 yıllık hava verisini kullanarak makine öğrenmesi ile yarınki yağış miktarını tahmin ediyor.

### Nasıl kullanırım?

- **Web arayüzü** varsa: Takvimden bir tarih seç, o gün için öneriyi gör.
- **Yıka** → Arabayı yıkayabilirsin, yağmur beklenmiyor.
- **Yıkama** → Yıkama, yarın yağmur bekleniyor.

### Karar tablosu

| Durum | Öneri |
|-------|-------|
| Yarın yağmur bekleniyor | Yıkama |
| 2 gün sonra yağmur | Dikkatli ol – 1 gün temiz kalır |
| Önümüzdeki günler yağmur yok | Yıka |

---

## Teknik Detaylar – Geliştiriciler İçin

### Proje yapısı

```
standalone-projects/araba-yikama-tahmin/
├── data/
│   ├── raw/           # Open-Meteo'den çekilen ham veri
│   └── processed/     # ML için işlenmiş veri
├── models/            # Eğitilmiş model (.pkl)
├── notebooks/
│   └── araba_yikama_tahmin.ipynb
├── src/
│   ├── data_fetch.py  # Veri çekme (Open-Meteo API)
│   ├── preprocess.py  # Özellik mühendisliği
│   ├── train.py       # Regresyon modeli eğitimi
│   └── generate_calendar_stats.py
├── requirements.txt
└── README.md
```

### Kurulum

```bash
cd standalone-projects/araba-yikama-tahmin
pip install -r requirements.txt
```

### Kullanım

**Tüm akışı çalıştır:**
```bash
python run_all.py
```

**Adım adım:**
```bash
# 1. Veri çekme (ilk çalıştırmada ~1-2 dk)
python src/data_fetch.py

# 2. Model eğitimi
python src/train.py

# 3. Jupyter Notebook
jupyter notebook notebooks/araba_yikama_tahmin.ipynb
```

### Model ve karar kuralı

- **Regresyon:** Yarınki yağış miktarı (mm) tahmin edilir.
- **Modeller:** Ridge, Random Forest, XGBoost – en iyi F1 skoru seçilir.
- **Eşik:** 0.5 mm (hafif damlalar yok sayılır).
- **Karar:** Tahmin > 0.5 mm → Yıkama, aksi halde → Yıka.

| Tahmin (mm) | Öneri |
|-------------|-------|
| Yarın > 0.5 mm | Yıkama – Yarın yağmur bekleniyor |
| 2. gün > 0.5 mm | Dikkatli – 1 gün temiz kalır |
| 3 gün yağmur yok | Yıka – En az 2 gün temiz kalır |

### Veri kaynağı

- **Open-Meteo Historical Weather API** (ücretsiz)
- İskenderun: 36.59°K, 36.17°D
- 2004–2024 (20 yıl)
