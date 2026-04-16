#!/usr/bin/env python3
"""
Projenin tamamını çalıştır: Veri çek → Ön işle → Eğit
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "src"))

def main():
    raw_path = Path(__file__).parent / "data" / "raw" / "iskenderun_hava_ham.csv"
    if not raw_path.exists():
        print("1/4 Veri çekiliyor...")
        from data_fetch import fetch_all
        fetch_all(20)
    else:
        print("1/4 Ham veri mevcut, atlanıyor.")

    print("2/4 Ön işleme...")
    from preprocess import build_ml_data, DATA_DIR, PROCESSED_PATH
    (DATA_DIR / "processed").mkdir(parents=True, exist_ok=True)
    df = build_ml_data()
    df.to_csv(PROCESSED_PATH, index=False)

    print("3/4 Model eğitimi...")
    from train import load_data, train_model, save_model
    X, y, _ = load_data()
    model, scaler = train_model(X, y)
    save_model(model, scaler)

    print("4/4 Takvim istatistikleri (2026-2027 demo)...")
    from generate_calendar_stats import main as gen_cal
    gen_cal()

    print("\nTamamlandı!")


if __name__ == "__main__":
    main()
