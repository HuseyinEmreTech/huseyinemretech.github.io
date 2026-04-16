# =============================================================================
# CBS Projesi - Trafik Kazası Choropleth Haritası
# =============================================================================

library(sf)
library(ggplot2)
library(dplyr)
library(readr)

# Dizinler
base_dir <- if (dir.exists("data")) getwd() else file.path(getwd(), "..")
raw_dir  <- file.path(base_dir, "data", "raw")
out_dir  <- file.path(base_dir, "data", "processed")

# İl sınırlarını yükle (GADM Level 1)
gpkg_path <- file.path(raw_dir, "turkiye_iller_gadm.gpkg")
layers <- st_layers(gpkg_path)$name
layer_1 <- if ("ADM_1" %in% layers) "ADM_1" else {
  m <- grep("level1|adm_1", layers, value = TRUE, ignore.case = TRUE)
  if (length(m) > 0) m[1] else layers[1]
}
tur <- st_read(gpkg_path, layer = layer_1, quiet = TRUE)

# GADM il adı sütunu: NAME_1
# İsim eşleştirme (GADM bazen farklı yazıyor)
il_adi <- "NAME_1"
if (!il_adi %in% names(tur)) il_adi <- names(tur)[grepl("NAME", names(tur))][1]

# Trafik verisini yükle
kaza_path <- file.path(raw_dir, "trafik_kazasi_il_2024.csv")
kaza <- read_csv(kaza_path, show_col_types = FALSE)

# Eşleştirme: GADM "Istanbul", TÜİK "İstanbul" olabilir - standartlaştır
tur[[il_adi]] <- gsub("İ", "I", tur[[il_adi]])
tur[[il_adi]] <- gsub("ı", "i", tur[[il_adi]])
kaza$il_std <- gsub("İ", "I", kaza$il)
kaza$il_std <- gsub("ı", "i", kaza$il_std)

# Birleştir
merged <- left_join(tur, kaza, by = setNames("il_std", il_adi))

# UTF-8 guvenli basliklar (grafik cihazinda Turkce karakter sorununu onler)
title_olum  <- "Turkiye Illere Gore Trafik Kazasi Olum Sayilari (2024)"
title_yarali <- "Turkiye Illere Gore Trafik Kazasi Yarali Sayilari (2024)"

# Harita: Olum sayisi
p1 <- ggplot(merged) +
  geom_sf(aes(fill = olum_2024), color = "white", linewidth = 0.2) +
  scale_fill_viridis_c(option = "magma", name = "Olum (2024)") +
  theme_minimal() +
  theme(
    axis.text = element_blank(),
    panel.grid = element_blank(),
    plot.title = element_text(hjust = 0.5, face = "bold")
  ) +
  labs(title = title_olum)

# Harita: Yarali sayisi
p2 <- ggplot(merged) +
  geom_sf(aes(fill = yarali_2024), color = "white", linewidth = 0.2) +
  scale_fill_viridis_c(option = "viridis", name = "Yarali (2024)") +
  theme_minimal() +
  theme(
    axis.text = element_blank(),
    panel.grid = element_blank(),
    plot.title = element_text(hjust = 0.5, face = "bold")
  ) +
  labs(title = title_yarali)

# Kaydet (Cairo ile UTF-8 / Türkçe karakter desteği)
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)
ggsave(file.path(out_dir, "harita_olum_2024.png"), p1, width = 10, height = 8, dpi = 150, device = png, type = "cairo")
ggsave(file.path(out_dir, "harita_yarali_2024.png"), p2, width = 10, height = 8, dpi = 150, device = png, type = "cairo")

message("Haritalar kaydedildi:")
message("  - ", file.path(out_dir, "harita_olum_2024.png"))
message("  - ", file.path(out_dir, "harita_yarali_2024.png"))

# Konsolda göster
print(p1)
