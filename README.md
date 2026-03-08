# 🚀 Hüseyin Emre - Profesyonel Portfolyo & Blog

[**English Version of README**](README_EN.md)

<div align="center">

![Theme](https://img.shields.io/badge/Theme-Modern_Tech-6366f1?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

**ERP çözüm danışmanlığı, saha operasyonları ve modern web teknolojileri (.NET, Blazor, Vanilla JS) ile uçtan uca dijital dönüşüm.**

🔗 [**Canlı Projeyi Görüntüle**](https://huseyinemretech.github.io)

</div>

---

## ✨ Proje Hakkında

Bu proje, geleneksel tasarımların ötesine geçerek tamamen **Modern Professional Tech** estetiğiyle geliştirilmiş sunucu taraflı (Cloudflare Workers) yeteneklere sahip, yüksek performanslı bir dijital kimlik ve portfolyo platformudur. Ziyaretçilere kesintisiz, hızlı ve interaktif bir deneyim sunmayı hedefler.

## 🚀 Öne Çıkan Özellikler

- **🌌 Aurora Background & Glassmorphism 2.0:** CSS değişkenleri ve modern backdrop-filter teknikleriyle oluşturulmuş, etkileşimli ve derinlik hissi veren göz alıcı bir arayüz.
- **⚡ Performance First:** Vite altyapısı ile yıldırım hızında derleme (build) ve optimize edilmiş kaynak yönetimi.
- **📱 Uçtan Uca Responsive:** Masaüstü, tablet ve mobil cihazlar için kusursuz UX tasarımı.
- **🔄 Dinamik GitHub Entegrasyonu:** `script.js` içerisindeki GitHub API bağlantısı sayesinde projeler doğrudan repolardan çekilerek otomatik olarak listelenir.
- **🌐 Cloudflare Workers Entegrasyonu:** `workers/cloudflare-worker.js` ile uç noktada (edge computing) serverless fonksiyonlar çalıştırabilme altyapısı (Header yönetimi, iletişim formları veya API proxy işlemleri için).
- **🗺️ GIS Proje Vitrini:** Özel olarak tasarlanmış `gis-project.html` sayfasında, R Studio kullanarak geliştirilen CBS (GIS) tabanlı mekansal analiz projelerinin modern bir sunumu.

## 📂 Mimari Yapı

```text
huseyinemretech.github.io/
├── index.html              # Ana portfolyo sayfası (Semantic HTML5)
├── gis-project.html        # CBS/GIS analiz sunum sayfası
├── makine-ogrenmesi.html   # Makine öğrenmesi proje sayfası
├── hci-adaptive-ui.html    # HCI adaptif UI proje sayfası
├── assets/
│   ├── css/                # styles.css, adaptive-*.css
│   ├── js/                 # script.js, adaptive-*.js
│   ├── img/                # favicon, social preview
│   └── data/               # adaptive-content.json
├── workers/
│   └── cloudflare-worker.js # Serverless Edge computing
├── docs/                   # CLOUDFLARE_SETUP.md
├── sunum/                  # Dijital dönüşüm sunumu
├── araba-yikama-tahmin/    # Araba yıkama ML projesi
├── cbs-trafik-projesi/     # CBS trafik analizi
├── vite.config.js
└── package.json
```

## 🛠️ Kurulum & Geliştirme

Projeyi yerel ortamınızda çalıştırmak veya geliştirmek için adım adım kurulum rehberi:

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/huseyinemretech/huseyinemretech.github.io.git
   cd huseyinemretech.github.io
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   *Tarayıcınızda `http://localhost:5173` adresine giderek projeyi canlı ve sıcak yeniden yükleme (hot-reload) desteğiyle görüntüleyebilirsiniz.*

4. **Production İçin Derleme (Build):**
   ```bash
   npm run build
   ```
   *`dist` klasörü oluşturularak yayınlanmaya hazır optimize edilmiş dosyalar derlenir.*

5. **Production Önizleme:**
   ```bash
   npm run preview
   ```

## 👨‍💻 Teknik Yetkinlikler

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Vite, Blazor
- **Backend & Edge:** Cloudflare Workers, .NET Core, C#, Entity Framework
- **Database / Veri:** MS SQL Server, R Studio, Mekansal Analiz (GIS)
- **ERP:** Süreç Analizi, Sistem Kurulumu, Modül Özelleştirme ve Teknik Destek

---

<div align="center">
**⚡ Verimlilik odaklı çözümler, gelecek odaklı teknolojiler. ⚡**
<br><br>
Geliştirdiği teknolojiyi değer üretmek için kullanan tüm profesyonellerle iletişim kurmaktan memnuniyet duyarım.
</div>
