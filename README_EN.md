# 🚀 Hüseyin Emre - Professional Portfolio & Blog

<div align="center">

![Theme](https://img.shields.io/badge/Theme-Modern_Tech-6366f1?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

**End-to-end digital transformation with ERP solutions consultancy, field operations, and modern web technologies (.NET, Blazor, Vanilla JS).**

🔗 [**View Live Project**](https://huseyinemretech.github.io)

</div>

---

## ✨ About the Project

This project is a high-performance digital identity and portfolio platform with server-side (Cloudflare Workers) capabilities, developed with a **Modern Professional Tech** aesthetic that goes beyond traditional designs. It aims to provide visitors with a seamless, fast, and interactive experience.

## 🚀 Key Features

- **🌌 Aurora Background & Glassmorphism 2.0:** A stunning interface that feels deep and interactive, created using CSS variables and modern backdrop-filter techniques.
- **⚡ Performance First:** Lightning-fast builds and optimized resource management with the Vite infrastructure.
- **📱 End-to-End Responsive:** Flawless UX design for desktop, tablet, and mobile devices.
- **🔄 Dynamic GitHub Integration:** `src/services/github/` (HTTP client) + `src/hooks/useGithubPortfolioProjects.ts` + `src/core/config` (VITE_* defaults).
- **🌐 Cloudflare Workers Integration:** Infrastructure for running serverless functions at the edge via `workers/cloudflare-worker.js` (header management, contact forms, API proxy).
- **🗺️ GIS Project Showcase:** Static page at `public/gis-project.html` (served as `/gis-project.html` after build).
- **🌐 Full Multilingual Support:** Comprehensive Turkish and English support across the entire platform.

## 📂 Architectural Structure

```text
huseyinemretech.github.io/
├── index.html           # Vite entry — React portfolio SPA
├── public/
│   └── gis-project.html # Static GIS showcase (copied to site root on build)
├── src/                 # React application (feature-based)
├── assets/images/       # Favicon, Open Graph image
├── standalone-projects/ # Linked coursework / demos (not bundled)
├── vite.config.ts
├── workers/cloudflare-worker.js
└── package.json
```

## 🛠️ Installation & Development

Step-by-step installation guide to run or develop the project in your local environment:

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/huseyinemretech/huseyinemretech.github.io.git
   cd huseyinemretech.github.io
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *Go to `http://localhost:5173` in your browser to view the project with hot-reload support.*

4. **Build for Production:**
   ```bash
   npm run build
   ```
   *Optimized files ready for publication are compiled into the `dist` folder.*

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## 👨‍💻 Technical Competencies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Vite, Blazor
- **Backend & Edge:** Cloudflare Workers, .NET Core, C#, Entity Framework
- **Database / Data:** MS SQL Server, R Studio, Spatial Analysis (GIS)
- **ERP:** Process Analysis, System Installation, Module Customization, and Technical Support

---

<div align="center">
**⚡ Efficiency-oriented solutions, future-oriented technologies. ⚡**
<br><br>
I would be happy to communicate with all professionals who use the technology they develop to produce value.
</div>
