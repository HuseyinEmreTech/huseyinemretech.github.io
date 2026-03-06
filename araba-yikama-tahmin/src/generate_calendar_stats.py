"""
Geçmiş 20 yıl verisine göre her (ay, gün) için ertesi gün istatistikleri.
2026-2027 takvim seçici için predictions.json üretir.
Önümüzdeki 10 güne bakarak "kaç gün temiz kalabilir" tahmini ekler.
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import pandas as pd

from preprocess import build_ml_data, YAGMUR_ESIK

OUT_PATH = Path(__file__).parent.parent / "predictions.json"
ILERI_GUN = 10


def sonraki_gun(ay_gun: str, gun_say: int) -> str | None:
    try:
        dt = datetime.strptime(ay_gun + "-2024", "%m-%d-%Y")
        dt += timedelta(days=gun_say)
        return dt.strftime("%m-%d")
    except Exception:
        return None


def main():
    df = build_ml_data()
    df["ay_gun"] = df["time"].dt.strftime("%m-%d")
    stats = {}

    for (ay_gun, grp) in df.groupby("ay_gun"):
        yarins = grp["yagmur_yarin"]
        avg = float(yarins.mean())
        rain_count = (yarins > YAGMUR_ESIK).sum()
        rain_pct = float(rain_count / len(yarins)) if len(yarins) > 0 else 0
        oneri = "Yıkama" if (avg > YAGMUR_ESIK or rain_pct >= 0.5) else "Yıkala"
        stats[ay_gun] = {
            "avg_precip": round(avg, 2),
            "rain_pct": round(rain_pct, 2),
            "n_years": len(grp),
            "oneri": oneri,
        }

    for ay_gun in list(stats.keys()):
        temiz = 0
        ileri_gunler = []
        for i in range(ILERI_GUN):
            key = sonraki_gun(ay_gun, i)
            if key is None or key not in stats:
                break
            s = stats[key]
            yagmurlu = s["avg_precip"] > YAGMUR_ESIK or s["rain_pct"] >= 0.5
            gun_tarih = sonraki_gun(ay_gun, i + 1) or key  # Tahmin edilen gün (key+1)
            ileri_gunler.append({
                "tarih": gun_tarih,
                "avg_precip": s["avg_precip"],
                "rain_pct": s["rain_pct"],
                "durum": "Yıkama" if yagmurlu else "Yıkala",
            })
            if yagmurlu:
                break
            temiz += 1
        stats[ay_gun]["temiz_gun_sayisi"] = min(temiz, ILERI_GUN)
        stats[ay_gun]["ileri_10_gun"] = ileri_gunler

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"Kaydedildi: {OUT_PATH} ({len(stats)} gün, temiz_gun_sayisi eklendi)")


if __name__ == "__main__":
    main()
