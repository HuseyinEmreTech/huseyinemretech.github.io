"""
İskenderun hava durumu verisini Open-Meteo Archive API'den çeker.
20 yıllık veri (2004-2024) - Makine Öğrenmesi Dersi Projesi
"""

import os
import time
import requests
import pandas as pd
from pathlib import Path

# İskenderun koordinatları (Hatay)
LAT = 36.59
LON = 36.17
TIMEZONE = "Europe/Istanbul"
BASE_URL = "https://archive-api.open-meteo.com/v1/archive"

# Veri klasörü
DATA_DIR = Path(__file__).parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"


def fetch_year(start_date: str, end_date: str) -> pd.DataFrame | None:
    """Belirli bir tarih aralığı için hava verisi çeker."""
    params = {
        "latitude": LAT,
        "longitude": LON,
        "start_date": start_date,
        "end_date": end_date,
        "timezone": TIMEZONE,
        "daily": [
            "precipitation_sum",
            "rain_sum",
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "wind_speed_10m_max",
        ],
    }
    try:
        r = requests.get(BASE_URL, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        df = pd.DataFrame(data["daily"])
        df["time"] = pd.to_datetime(df["time"])
        return df
    except Exception as e:
        print(f"Hata ({start_date} - {end_date}): {e}")
        return None


def fetch_all(years: int = 20) -> pd.DataFrame:
    """
    20 yıllık veriyi yıllık parçalarda çeker (API limitleri için).
    """
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    all_dfs = []
    current_year = pd.Timestamp.now().year

    for i in range(years):
        year = current_year - years + i
        start = f"{year}-01-01"
        end = f"{year}-12-31"
        print(f"Çekiliyor: {start} - {end}")
        df = fetch_year(start, end)
        if df is not None and not df.empty:
            all_dfs.append(df)
        time.sleep(0.5)  # Rate limit

    if not all_dfs:
        raise ValueError("Veri çekilemedi.")

    combined = pd.concat(all_dfs, ignore_index=True)
    combined = combined.drop_duplicates(subset=["time"]).sort_values("time").reset_index(drop=True)
    out_path = RAW_DIR / "iskenderun_hava_ham.csv"
    combined.to_csv(out_path, index=False)
    print(f"Kaydedildi: {out_path} ({len(combined)} satır)")
    return combined


if __name__ == "__main__":
    fetch_all(20)
