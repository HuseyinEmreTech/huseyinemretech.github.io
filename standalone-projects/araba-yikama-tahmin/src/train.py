"""
Regresyon modeli eğitimi - Yarınki yağış miktarı tahmini.
Makine Öğrenmesi Dersi - Araba Yıkama Tahmin Projesi
"""

import pickle
import sys
import pandas as pd
import numpy as np
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, f1_score
from sklearn.preprocessing import StandardScaler

from preprocess import build_ml_data, get_feature_columns, get_recommendation, YAGMUR_ESIK

# XGBoost opsiyonel
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

DATA_DIR = Path(__file__).parent.parent / "data"
PROCESSED_PATH = DATA_DIR / "processed" / "iskenderun_ml_ready.csv"
MODEL_DIR = Path(__file__).parent.parent / "models"


def load_data() -> tuple:
    """İşlenmiş veriyi yükle."""
    if PROCESSED_PATH.exists():
        df = pd.read_csv(PROCESSED_PATH)
        df["time"] = pd.to_datetime(df["time"])
    else:
        df = build_ml_data()
        DATA_DIR.joinpath("processed").mkdir(parents=True, exist_ok=True)
        df.to_csv(PROCESSED_PATH, index=False)

    features = get_feature_columns(df)
    X = df[features]
    y = df["yagmur_yarin"]
    return X, y, df


def sample_weights(y: pd.Series) -> np.ndarray:
    """Yıka günlerine (düşük yağış) daha fazla ağırlık ver."""
    w = np.ones(len(y))
    yika_mask = y <= YAGMUR_ESIK
    w[yika_mask] = 2.0  # Yıka günleri nadir tahmin ediliyordu, ağırlık artır
    return w


def eval_model(y_true, y_pred, name: str = ""):
    """Regresyon ve karar kuralı metriklerini yazdır."""
    y_true_bin = (y_true > YAGMUR_ESIK).astype(int)
    y_pred_bin = (y_pred > YAGMUR_ESIK).astype(int)
    f1_yika = f1_score(y_true_bin, y_pred_bin, pos_label=0, zero_division=0)
    from sklearn.metrics import accuracy_score, classification_report
    acc = accuracy_score(y_true_bin, y_pred_bin)
    if name:
        print(f"\n--- {name} ---")
    print(f"  RMSE: {np.sqrt(mean_squared_error(y_true, y_pred)):.4f} | R²: {r2_score(y_true, y_pred):.4f}")
    print(f"  Karar Accuracy: {acc:.4f} | F1 (Yıka): {f1_yika:.4f}")
    return f1_yika


def train_model(X: pd.DataFrame, y: pd.Series) -> tuple:
    """
    Sample weight, çoklu model ve GridSearch ile en iyi modeli seçer.
    """
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    sw_train = sample_weights(y_train)

    models = {}
    # 1. Ridge
    ridge = Ridge(alpha=1.0, random_state=42)
    ridge.fit(X_train_s, y_train, sample_weight=sw_train)
    models["Ridge"] = (ridge, ridge.predict(X_test_s))

    # 2. RandomForest + GridSearch
    rf_grid = GridSearchCV(
        RandomForestRegressor(random_state=42),
        param_grid={
            "n_estimators": [80, 120],
            "max_depth": [8, 12, 15],
            "min_samples_leaf": [3, 5, 10],
        },
        cv=3,
        scoring="neg_mean_squared_error",
        n_jobs=-1,
    )
    rf_grid.fit(X_train_s, y_train, sample_weight=sw_train)
    rf_best = rf_grid.best_estimator_
    models["RandomForest"] = (rf_best, rf_best.predict(X_test_s))

    # 3. XGBoost (varsa)
    if HAS_XGB:
        xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
        xgb_model.fit(X_train_s, y_train, sample_weight=sw_train)
        models["XGBoost"] = (xgb_model, xgb_model.predict(X_test_s))

    # En iyi: F1 (Yıka) en yüksek
    best_name, best_score = None, -1
    for name, (_, y_pred) in models.items():
        score = eval_model(y_test.values, y_pred, name)
        if score > best_score:
            best_score = score
            best_name = name

    model = models[best_name][0]
    y_pred_test = models[best_name][1]

    print("\n" + "=" * 50)
    print(f"SEÇİLEN MODEL: {best_name}")
    print("=" * 50)
    eval_model(y_test.values, y_pred_test, "")
    print("\nKarar Kuralı (Yıka/Yıkama) Detayı:")
    from sklearn.metrics import classification_report
    y_test_bin = (y_test > YAGMUR_ESIK).astype(int)
    y_pred_bin = (y_pred_test > YAGMUR_ESIK).astype(int)
    print(classification_report(y_test_bin, y_pred_bin, target_names=["Yıka", "Yıkama"]))

    # Eşiği kaydet
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODEL_DIR / "yagmur_esik.txt", "w") as f:
        f.write(str(YAGMUR_ESIK))

    return model, scaler


def save_model(model, scaler):
    """Model ve scaler'ı kaydet."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODEL_DIR / "model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open(MODEL_DIR / "scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    print(f"\nModel kaydedildi: {MODEL_DIR}")


if __name__ == "__main__":
    X, y, df = load_data()
    model, scaler = train_model(X, y)
    save_model(model, scaler)
