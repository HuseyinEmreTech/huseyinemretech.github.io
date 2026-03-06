# Araba Yıkama Tahmin Projesi - Makine Öğrenmesi

İskenderun'daki **20 yıllık hava durumu** verisiyle **regresyon** kullanarak yarınki yağış miktarını tahmin eden proje.  
Karar: *Bugün arabamı yıkamalı mıyım?* Yarın yağmur varsa yıkama.

## Proje Yapısı

```
araba-yikama-tahmin/
├── data/
│   ├── raw/           # Open-Meteo'den çekilen ham veri
│   └── processed/     # ML için işlenmiş veri
├── models/            # Eğitilmiş model (.pkl)
├── notebooks/
│   └── araba_yikama_tahmin.ipynb
├── src/
│   ├── data_fetch.py  # Veri çekme (Open-Meteo API)
│   ├── preprocess.py  # Özellik mühendisliği
│   └── train.py       # Regresyon modeli eğitimi
├── requirements.txt
└── README.md
```

## Kurulum

```bash
cd araba-yikama-tahmin
pip install -r requirements.txt
```

## Kullanım

### 1. Veri Çekme (ilk çalıştırmada)
```bash
python src/data_fetch.py
```

### 2. Model Eğitimi
```bash
python src/train.py
```

### 3. Jupyter Notebook
```bash
jupyter notebook notebooks/araba_yikama_tahmin.ipynb
```

## Karar Kuralı

| Tahmin (mm) | Öneri |
|-------------|-------|
| Yarın > 0.1 mm | Yıkama – Yarın yağmur bekleniyor |
| 2. gün > 0.1 mm | Dikkatli – 1 gün temiz kalır |
| 3 gün yağmur yok | Yıkala – En az 2 gün temiz kalır |

## Veri Kaynağı

- **Open-Meteo Historical Weather API** (ücretsiz)
- İskenderun: 36.59°K, 36.17°D
- 2004–2024 (20 yıl)
