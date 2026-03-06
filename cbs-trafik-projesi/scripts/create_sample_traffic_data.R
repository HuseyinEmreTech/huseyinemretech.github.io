# =============================================================================
# Örnek Trafik Kazası Verisi (TÜİK 2024 yapısına uygun)
# TÜİK bülteninden manuel doldurulabilir - bu örnek dağılım ile çalışır
# =============================================================================

library(readr)

# Türkiye 81 il (GADM NAME_1 ile uyumlu)
iller <- c("Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan",
           "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis",
           "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce",
           "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane",
           "Hakkari", "Hatay", "Iğdır", "Isparta", "Istanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman",
           "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli",
           "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir",
           "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop",
           "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova",
           "Yozgat", "Zonguldak")

# TÜİK 2024 toplam: 6352 ölüm, 385117 yaralı
# İl bazında yaklaşık dağılım (nüfus ve trafik yoğunluğuna göre tahmini)
# Kaynak: TÜİK 2024 - Ankara en çok ölüm (325), İstanbul en çok yaralı (41414)
# Ardahan en az ölüm (4), Bayburt en az yaralı (331)
set.seed(42)
nufus_agirlik <- runif(81, 0.3, 2)  # Basit ağırlık
nufus_agirlik[match("Istanbul", iller)] <- 3.5
nufus_agirlik[match("Ankara", iller)] <- 2.8
nufus_agirlik[match("İzmir", iller)] <- 2.2
nufus_agirlik[match("Bursa", iller)] <- 1.8
nufus_agirlik[match("Antalya", iller)] <- 1.7
nufus_agirlik[match("Ardahan", iller)] <- 0.2
nufus_agirlik[match("Bayburt", iller)] <- 0.2
nufus_agirlik[match("Tunceli", iller)] <- 0.25

p <- nufus_agirlik / sum(nufus_agirlik)
olum   <- pmax(4, round(6352 * p * runif(81, 0.8, 1.2)))
yarali <- pmax(331, round(385117 * p * runif(81, 0.8, 1.2)))

# Ankara ve İstanbul'u TÜİK verisiyle uyumlu yap
olum[match("Ankara", iller)]   <- 325
yarali[match("Istanbul", iller)] <- 41414
olum[match("Ardahan", iller)]  <- 4
yarali[match("Bayburt", iller)] <- 331

df <- data.frame(
  il = iller,
  olum_2024 = olum,
  yarali_2024 = yarali,
  kaza_olumlu_yaralanmali = round(olum + yarali * 0.15)  # Tahmini
)

base_dir <- if (dir.exists("data")) getwd() else file.path(getwd(), "..")
raw_dir  <- file.path(base_dir, "data", "raw")
if (!dir.exists(raw_dir)) dir.create(raw_dir, recursive = TRUE)

out_path <- file.path(raw_dir, "trafik_kazasi_il_2024.csv")
write_csv(df, out_path)
message("Kaydedildi: ", out_path)
message("NOT: Gerçek veri için TÜİK data.tuik.gov.tr adresinden il bazlı tabloyu indirip bu CSV'yi güncelleyin.")
