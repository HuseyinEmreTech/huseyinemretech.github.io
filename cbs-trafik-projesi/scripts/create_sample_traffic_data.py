#!/usr/bin/env python3
"""Örnek Trafik Kazası Verisi - TÜİK 2024 yapısına uygun"""

import csv
import random

# Türkiye 81 il (GADM NAME_1 ile uyumlu)
iller = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan",
    "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis",
    "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce",
    "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane",
    "Hakkari", "Hatay", "Iğdır", "Isparta", "Istanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman",
    "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli",
    "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop",
    "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova",
    "Yozgat", "Zonguldak"
]

# TÜİK 2024: 6352 ölüm, 385117 yaralı
random.seed(42)
weights = [random.uniform(0.3, 2) for _ in iller]
for i, il in enumerate(iller):
    if il == "Istanbul": weights[i] = 3.5
    elif il == "Ankara": weights[i] = 2.8
    elif il == "İzmir": weights[i] = 2.2
    elif il == "Bursa": weights[i] = 1.8
    elif il == "Antalya": weights[i] = 1.7
    elif il in ("Ardahan", "Bayburt"): weights[i] = 0.2
    elif il == "Tunceli": weights[i] = 0.25

total_w = sum(weights)
p = [w / total_w for w in weights]
olum = [max(4, round(6352 * pi * random.uniform(0.8, 1.2))) for pi in p]
yarali = [max(331, round(385117 * pi * random.uniform(0.8, 1.2))) for pi in p]

# TÜİK gerçek değerler
olum[iller.index("Ankara")] = 325
yarali[iller.index("Istanbul")] = 41414
olum[iller.index("Ardahan")] = 4
yarali[iller.index("Bayburt")] = 331

import os
raw_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")
os.makedirs(raw_dir, exist_ok=True)
out_path = os.path.join(raw_dir, "trafik_kazasi_il_2024.csv")

with open(out_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["il", "olum_2024", "yarali_2024", "kaza_olumlu_yaralanmali"])
    for i, il in enumerate(iller):
        w.writerow([il, olum[i], yarali[i], round(olum[i] + yarali[i] * 0.15)])

print(f"Kaydedildi: {out_path}")
print("NOT: Gerçek veri için TÜİK data.tuik.gov.tr adresinden il bazlı tabloyu indirip güncelleyin.")
