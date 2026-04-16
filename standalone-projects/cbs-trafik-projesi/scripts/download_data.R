# =============================================================================
# CBS Projesi - Trafik Kazası & Karayolu Yoğunluğu Haritası
# Veri indirme scripti
# =============================================================================

# Gerekli paketler (yüklü değilse yükle)
required <- c("sf", "ggplot2", "dplyr", "geodata", "readr")
for (pkg in required) {
  if (!require(pkg, character.only = TRUE, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org/")
    library(pkg, character.only = TRUE)
  }
}

# Proje dizinleri (setwd ile standalone-projects/cbs-trafik-projesi/ klasörüne geçin veya buradan çalıştırın)
base_dir <- if (dir.exists("data")) getwd() else file.path(getwd(), "..")
if (!dir.exists(file.path(base_dir, "data"))) {
  base_dir <- getwd()
  if (!dir.exists(file.path(base_dir, "data"))) dir.create(file.path(base_dir, "data"), recursive = TRUE)
}
data_dir  <- file.path(base_dir, "data")
raw_dir   <- file.path(data_dir, "raw")
proc_dir  <- file.path(data_dir, "processed")

for (d in c(data_dir, raw_dir, proc_dir)) {
  if (!dir.exists(d)) dir.create(d, recursive = TRUE)
}

message("=== 1. Türkiye İl Sınırları (GADM) ===")
gpkg_path <- file.path(raw_dir, "turkiye_iller_gadm.gpkg")
if (file.exists(gpkg_path)) {
  message("-> turkiye_iller_gadm.gpkg zaten mevcut")
} else {
  tur_gadm <- geodata::gadm(country = "TUR", level = 1, path = raw_dir)
  tur_sf   <- sf::st_as_sf(tur_gadm)
  sf::st_write(tur_sf, gpkg_path, delete_dsn = TRUE)
  message("-> turkiye_iller_gadm.gpkg indirildi ve kaydedildi")
}

message("\n=== 2. Trafik Kazası Verisi ===")
kaza_path <- file.path(raw_dir, "trafik_kazasi_il_2024.csv")
if (!file.exists(kaza_path)) {
  message("-> trafik_kazasi_il_2024.csv bulunamadı.")
  message("   TÜİK'ten il bazında veriyi indirip data/raw/ klasörüne koyun.")
  message("   Veya mevcut örnek veri kullanılacak (scripts/create_sample_traffic_data.R çalıştırın).")
} else {
  message("-> trafik_kazasi_il_2024.csv mevcut")
}

message("\n=== 3. Karayolu Verisi (Opsiyonel, ~1.3 GB) ===")
roads_url <- "https://download.geofabrik.de/europe/turkey-latest-free.gpkg.zip"
roads_zip <- file.path(raw_dir, "turkey-latest-free.gpkg.zip")
if (!file.exists(roads_zip) && !file.exists(file.path(raw_dir, "turkey-roads.gpkg"))) {
  message("Geofabrik karayolu verisi indirmek için aşağıdaki komutu çalıştırın:")
  message('  download.file("', roads_url, '", destfile = "', roads_zip, '", mode = "wb")')
  message("İndirdikten sonra zip'i açıp gis_osm_roads_free_1 katmanını kullanın.")
} else {
  message("-> Karayolu verisi zaten mevcut veya indirilmiş")
}

message("\n=== Veri indirme tamamlandı ===")
message("Dizin: ", data_dir)
