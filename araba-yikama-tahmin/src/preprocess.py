"""
Özellik mühendisliği ve hedef değişken oluşturma.
Regresyon: Yarınki yağış miktarını (mm) tahmin et.
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
RAW_PATH = DATA_DIR / "raw" / "iskenderun_hava_ham.csv"
PROCESSED_PATH = DATA_DIR / "processed" / "iskenderun_ml_ready.csv"

# Yağmur eşiği (mm) - karar kuralı için (0.5 = hafif damla bile sayılmaz)
YAGMUR_ESIK = 0.5


def load_raw() -> pd.DataFrame:
    """Ham veriyi yükle."""
    df = pd.read_csv(RAW_PATH)
    df["time"] = pd.to_datetime(df["time"])
    return df


def add_target(df: pd.DataFrame) -> pd.DataFrame:
    """Hedef: Yarınki yağış miktarı (regresyon)."""
    df = df.sort_values("time").reset_index(drop=True)
    df["yagmur_yarin"] = df["precipitation_sum"].shift(-1)
    df["yagmur_2_gun"] = df["precipitation_sum"].shift(-2)
    df["yagmur_3_gun"] = df["precipitation_sum"].shift(-3)
    return df.dropna(subset=["yagmur_yarin"])


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """Özellikler: mevsim, lag, hareketli ortalama, nem vb."""
    df = df.copy()
    df["gun"] = df["time"].dt.day
    df["ay"] = df["time"].dt.month
    df["yil"] = df["time"].dt.year
    df["mevsim"] = (df["ay"] % 12 + 3) // 3  # 1=İlkbahar, 2=Yaz, 3=Sonbahar, 4=Kış
    df["hafta_ici"] = (df["time"].dt.dayofweek < 5).astype(int)

    # weather_code: yağış ile ilişkili (61-67 yağmur, 80-82 sağanak)
    if "weather_code" in df.columns:
        df["weather_rain_like"] = df["weather_code"].isin([61, 63, 65, 66, 67, 80, 81, 82]).astype(int)
    else:
        df["weather_rain_like"] = 0

    # Nem (varsa)
    if "relative_humidity_2m_mean" not in df.columns:
        df["relative_humidity_2m_mean"] = np.nan

    # Lag değişkenleri
    df["yagmur_dun"] = df["precipitation_sum"].shift(1)
    df["yagmur_2_gun_once"] = df["precipitation_sum"].shift(2)
    df["yagmur_7_gun_once"] = df["precipitation_sum"].shift(7)

    # Hareketli ortalamalar
    df["yagmur_7_gun_ort"] = df["precipitation_sum"].rolling(7, min_periods=1).mean()
    df["sicaklik_7_gun_ort"] = df["temperature_2m_max"].rolling(7, min_periods=1).mean()

    # Eksik değerleri doldur
    df = df.fillna(0)
    return df


def build_ml_data() -> pd.DataFrame:
    """ML için hazır veri seti oluştur."""
    df = load_raw()
    df = add_target(df)
    df = add_features(df)
    return df


def get_feature_columns(df: pd.DataFrame | None = None) -> list[str]:
    """Modelde kullanılacak özellik sütunları. df verilirse sadece mevcut sütunlar döner."""
    all_cols = [
        "gun", "ay", "yil", "mevsim", "hafta_ici",
        "temperature_2m_max", "temperature_2m_min", "wind_speed_10m_max",
        "precipitation_sum", "yagmur_dun", "yagmur_2_gun_once", "yagmur_7_gun_once",
        "yagmur_7_gun_ort", "sicaklik_7_gun_ort", "weather_rain_like",
        "relative_humidity_2m_mean",
    ]
    if df is not None:
        return [c for c in all_cols if c in df.columns]
    return all_cols


def get_recommendation(pred_yarin: float, pred_2_gun: float = None, pred_3_gun: float = None) -> str:
    """
    Regresyon tahminine göre araba yıkama önerisi.
    pred: mm cinsinden yağış tahmini
    """
    if pred_yarin > YAGMUR_ESIK:
        return "Yıkama – Yarın yağmur bekleniyor."
    if pred_2_gun is not None and pred_2_gun > YAGMUR_ESIK:
        return "Dikkatli ol – 2 gün sonra yağmur (1 gün temiz kalır)."
    if pred_3_gun is not None and pred_3_gun > YAGMUR_ESIK:
        return "Yıka – En az 2 gün temiz kalır."
    return "Yıka – Önümüzdeki günler yağmur beklenmiyor."


if __name__ == "__main__":
    Path(DATA_DIR / "processed").mkdir(parents=True, exist_ok=True)
    df = build_ml_data()
    df.to_csv(PROCESSED_PATH, index=False)
    print(f"İşlendi: {PROCESSED_PATH} ({len(df)} satır)")
