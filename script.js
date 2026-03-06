/* =====================================================
   MODERN PROFESSIONAL PORTFOLIO - JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    fetchGitHubProjects();
    initScrollAnimations();
    initMagneticButtons();
    initMobileMenu();
    fetchGitHubProjects();
    initScrollAnimations();
    initMagneticButtons();
    initCustomCursor();
    initSkillsFilter();
    initContactForm();
    initLanguageToggle();
});

/* =====================================================
   MOBILE MENU
   ===================================================== */
function initMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn) return;

    menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');

        // Toggle icon
        const icon = menuBtn.querySelector('i');
        if (icon) {
            icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });
}

/* =====================================================
   GITHUB PROJECTS INTEGRATION
   ===================================================== */
async function fetchGitHubProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    const username = 'HuseyinEmreTech';
    const baseUrl = `https://api.github.com/users/${username}/repos?type=all&sort=stars&per_page=100`;
    const cacheKey = 'github_repos_v7';
    const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 dakika - GitHub ile senkron

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_MAX_AGE) {
                renderProjects(filterGitHubRepos(data));
                return;
            }
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Portfolio-Site-1.0' };
        const allRepos = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            const response = await fetch(`${baseUrl}&page=${page}`, { headers });
            if (!response.ok) throw new Error(`GitHub API ${response.status}`);
            const pageRepos = await response.json();
            allRepos.push(...pageRepos);
            hasMore = pageRepos.length === 100;
            page++;
        }
        const validRepos = filterGitHubRepos(allRepos);

        localStorage.setItem(cacheKey, JSON.stringify({
            data: validRepos,
            timestamp: Date.now()
        }));

        renderProjects(validRepos);
    } catch (error) {
        console.error('Failed to load projects:', error);
        if (cached) {
            try {
                const { data } = JSON.parse(cached);
                renderProjects(filterGitHubRepos(data), true);
                return;
            } catch (e) { /* fallback to local only */ }
        }
        renderProjects([], true);
    }
}

function filterGitHubRepos(repos) {
    return repos.filter(r => r.name.toLowerCase() !== 'huseyinemretech.github.io');
}

function renderProjects(repos, showGitHubError = false) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    // Local/Featured Projects
    const localProjects = [
        {
            name: "GIS Analysis Project",
            description: "gis-card-desc",
            tech: ["R", "sf", "ggplot2", "Leaflet"],
            category: "dev",
            link: "gis-project.html",
            github: "https://github.com/huseyinemretech",
            isLocal: true,
            stargazers_count: 'Special'
        },
        {
            name: 'Araba Yıkama Tahmin',
            description: 'İskenderun 20 yıllık hava verisi ile regresyon: Yarın yağmur var mı? Bugün arabamı yıkamalı mıyım?',
            language: 'Python',
            html_url: 'makine-ogrenmesi.html',
            isLocal: true,
            stargazers_count: 'ML'
        }
    ];

    const repoDetails = {
        'Sinema-Bilet-Otomasyonu': {
            name: 'Sinema Bilet Otomasyonu',
            desc: 'C# ve SQL Server kullanılarak geliştirilen, kapsamlı biletleme ve salon yönetim sistemi.'
        },
        'Sinema-Bilet-Otamasyonu': {
            name: 'Sinema Bilet Otomasyonu',
            desc: 'Sinema-Bilet-Otamasyonu-desc'
        },
        'Teknik-Destek-Sistemi': {
            desc: 'Teknik-Destek-Sistemi-desc'
        },
        'ERP-Modul-Gelistirme': {
            desc: 'ERP-Modul-Gelistirme-desc'
        },
        'HuseyinEmreTech': {
            desc: 'HuseyinEmreTech-desc'
        },
        'ServisBir': {
            desc: 'Servis ve teknik destek yönetim sistemi.'
        }
    };

    const allProjects = [...localProjects, ...repos];

    // En fazla yıldız alan projeler öne - otomatik sıralama
    const getStarValue = (r) => {
        const v = r.stargazers_count;
        if (typeof v === 'number') return v;
        if (r.isLocal) return 999; // Öne çıkan yerel projeler üstte
        return 0;
    };
    allProjects.sort((a, b) => getStarValue(b) - getStarValue(a));

    if (showGitHubError && repos.length === 0) {
        const errorBanner = document.createElement('div');
        errorBanner.style.cssText = 'grid-column: 1/-1; text-align: center; color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;';
        errorBanner.innerHTML = `<i class="fas fa-exclamation-triangle"></i> GitHub projeleri geçici olarak yüklenemedi. <a href="https://github.com/HuseyinEmreTech" target="_blank" style="color: var(--accent-primary);">GitHub'da Görüntüle</a>`;
        projectsGrid.appendChild(errorBanner);
    }

    allProjects.forEach((repo, index) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.style.transitionDelay = `${index * 100}ms`;

        const detail = repoDetails[repo.name] || {};
        const title = repo.isLocal ? repo.name : (detail.name || formatTitle(repo.name));

        const currentLang = document.documentElement.lang || 'tr';
        let description = repo.isLocal ? repo.description : (detail.desc || repo.description || translations[currentLang]["project-no-desc"]);

        // If description is a translation key, translate it
        if (translations[currentLang] && translations[currentLang][description]) {
            description = translations[currentLang][description];
        }

        card.innerHTML = `
            <div class="project-header">
                <i class="far fa-folder folder-icon"></i>
                <div class="project-links">
                    <a href="${repo.html_url}" ${repo.isLocal ? '' : 'target="_blank"'} aria-label="Project Link">
                        <i class="${repo.isLocal ? 'fas fa-arrow-right' : 'fab fa-github'}"></i>
                    </a>
                </div>
            </div>
            <h3 class="project-title">${title}</h3>
            <p class="project-desc">${description}</p>
            <div class="project-tech">
                ${repo.language ? `<span>${repo.language}</span>` : ''}
                <span><i class="far fa-star"></i> ${repo.stargazers_count}</span>
            </div>
        `;

        projectsGrid.appendChild(card);

        // Intersection Observer for reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(card);
    });
}

function formatTitle(name) {
    return name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/* =====================================================
   MAGNETIC BUTTONS (Micro-Interaction)
   ===================================================== */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Magnetic pull strength
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

/* =====================================================
   SCROLL ANIMATIONS
   ===================================================== */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible to save performance
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element leaves bottom
    });

    // Removed .hero-content from here because it has its own CSS animation (fadeUp)
    // This prevents the conflict where JS hides it (opacity: 0) while CSS tries to show it
    const elements = document.querySelectorAll('.timeline-item, .skills-list');

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        el.style.willChange = 'opacity, transform'; // Performance optimization
        observer.observe(el);
    });

    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);
}

/* =====================================================
   CUSTOM CURSOR
   ===================================================== */
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Slight delay for the outline
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Add glowing effect on links/buttons
    document.querySelectorAll('a, button, .project-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '50px';
            cursorOutline.style.height = '50px';
            cursorOutline.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '30px';
            cursorOutline.style.height = '30px';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });
}

/* =====================================================
   SKILLS FILTER
   ===================================================== */
function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const skillGroups = document.querySelectorAll('.skills-group');

    if (!filterBtns.length || !skillGroups.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            skillGroups.forEach(group => {
                const category = group.getAttribute('data-category');

                // Add fade out effect
                group.style.opacity = '0';
                group.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        group.style.display = 'block';
                        // Fade in briefly after display change
                        setTimeout(() => {
                            group.style.opacity = '1';
                            group.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        group.style.display = 'none';
                    }
                }, 400); // 400ms matches the transition duration in CSS
            });
        });
    });
}

/* =====================================================
   CONTACT FORM
   ===================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentLang = document.documentElement.lang || 'tr';
        const dict = translations[currentLang];

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = dict["form-sending"];
        submitBtn.disabled = true;
        statusDiv.className = 'form-status';
        statusDiv.textContent = '';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Send to Cloudflare Worker
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                form.reset();
                statusDiv.textContent = dict["form-success"];
                statusDiv.classList.add('success');
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            statusDiv.textContent = dict["form-error"];
            statusDiv.classList.add('error');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            // Clear status after 5 seconds
            setTimeout(() => {
                statusDiv.className = 'form-status';
                statusDiv.textContent = '';
            }, 5000);
        }
    });
}

/* =====================================================
   MULTI-LANGUAGE SUPPORT
   ===================================================== */
const translations = {
    tr: {
        "site-title": "Hüseyin Emre | ERP Çözüm Danışmanı & Yazılım Geliştirici",
        "meta-desc": "Hüseyin Emre - ERP Çözüm Danışmanı & Yazılım Geliştirici (.NET)",
        "meta-keywords": "yazılım, geliştirici, .net, blazor, erp, danışman, c#, teknik destek",
        "og-title": "Hüseyin Emre | ERP Çözüm Danışmanı & Yazılım Geliştirici",
        "og-desc": "Hüseyin Emre'nin ERP çözümleri ve .NET geliştirme üzerine uzmanlaşmış modern portfolyosu.",
        "tw-title": "Hüseyin Emre | ERP Çözüm Danışmanı & Yazılım Geliştirici",
        "tw-desc": "Hüseyin Emre'nin ERP çözümleri ve .NET geliştirme üzerine uzmanlaşmış modern portfolyosu.",
        "nav-about": "Hakkımda", "nav-exp": "Deneyim", "nav-edu": "Eğitim", "nav-proj": "Projeler", "nav-skills": "Yetenekler", "nav-contact": "İletişim",
        "hero-title": "ERP Çözüm Danışmanı <br>& Yazılım Geliştirici",
        "hero-desc": "İş süreçleri analizi, saha operasyonları ve modern yazılım geliştirme (.NET, Blazor) yetkinliklerini bir araya getiren, çözüm odaklı bir ERP profesyoneliyim. İşletmeler için uçtan uca, verimli ve kullanıcı dostu çözümler üretiyorum.",
        "btn-proj": "Projelerimi İncele", "btn-contact": "İletişime Geç", "btn-cv": "<i class=\"fas fa-file-download\" style=\"margin-right: 8px;\"></i> CV İndir",
        "sec-exp": "Deneyim <span class=\"mono text-muted text-sm\">/experience</span>",
        "exp1-date": "Haziran 2025 – Devam Ediyor",
        "exp1-title": "ERP Çözüm Danışmanı & Yazılım Geliştirici",
        "exp1-company": "Hisar Yazılım ve Barkodlu Satış Sistemleri",
        "exp1-desc": "ERP sistemlerinin kurulum, özelleştirme ve son kullanıcı eğitim süreçlerini yöneterek operasyonel verimliliği artırdım.",
        "exp1-li1": "İş süreçlerini analiz ederek Blazor ve C# ile kullanıcı dostu, modern web arayüzleri ve özel modüller geliştirdim.",
        "exp1-li2": "Müşteri lokasyonlarında donanım entegrasyonu (yazıcı, kasa) ve yerinde teknik destek sağladım.",
        "exp2-date": "Haziran 2023 – Haziran 2023",
        "exp2-title": "IT Altyapı ve Sistem Destek Stajyeri",
        "exp2-company": "Osmaniye Belediyesi",
        "exp2-li1": "Kurum personelinin bilgisayar, yazıcı ve ağ bağlantısı ile ilgili teknik sorunlarını çözdüm.",
        "exp2-li2": "Yazılım ve donanım kurulumu ile sistem güncellemelerini gerçekleştirdim.",
        "exp2-li3": "Temel ağ yapılandırmaları ve donanım arızalarının giderilmesinde görev aldım.",
        "sec-edu": "Eğitim <span class=\"mono text-muted text-sm\">/education</span>",
        "edu1-date": "Ekim 2024 - Devam Ediyor",
        "edu1-title": "Yönetim Bilişim Sistemleri",
        "edu1-school": "İskenderun Teknik Üniversitesi",
        "edu1-degree": "Lisans Derecesi",
        "edu2-date": "Ekim 2021 – Haziran 2023",
        "edu2-title": "Bilgisayar Programcılığı",
        "edu2-school": "Osmaniye Korkut Ata Üniversitesi",
        "edu2-degree": "Ön Lisans Derecesi",
        "sec-proj": "Projeler <span class=\"mono text-muted text-sm\">/work</span>",
        "sec-skills": "Yetenekler <span class=\"mono text-muted text-sm\">/skills</span>",
        "filter-all": "Tümü", "filter-erp": "ERP", "filter-dev": "Yazılım", "filter-tech": "Sistem",
        "skill-grp-erp": "<i class=\"fas fa-briefcase text-muted\"></i> ERP & İş Süreçleri",
        "skill-grp-dev": "<i class=\"fas fa-code text-muted\"></i> Yazılım Geliştirme",
        "skill-grp-tech": "<i class=\"fas fa-tools text-muted\"></i> Teknik Destek & Sistem",
        "skill-erp-cons": "ERP Danışmanlığı", "skill-erp-inst": "Kurulum & Özelleştirme", "skill-ba": "İş Analizi", "skill-opt": "Süreç Optimizasyonu", "skill-acc": "Ön Muhasebe",
        "skill-hw-int": "Donanım Entegrasyonu", "skill-ts": "Sorun Giderme", "skill-net": "Ağ Yapılandırması", "skill-srv": "Sunucu Desteği", "skill-rem": "Uzaktan Destek",
        "sec-contact": "İletişim <span class=\"mono text-muted text-sm\">/contact</span>",
        "contact-desc": "Bir ERP projesi, yazılım geliştirme ihtiyacı veya teknik danışmanlık için iletişime geçebilirsiniz.",
        "contact-email": "<i class=\"fas fa-envelope\" style=\"margin-right: 8px;\"></i> huseyinemre.tech@gmail.com",
        "contact-linkedin": "<i class=\"fab fa-linkedin\" style=\"margin-right: 8px;\"></i> LinkedIn",
        "contact-github": "<i class=\"fab fa-github\" style=\"margin-right: 8px;\"></i> GitHub",
        "form-name": "Adınız Soyadınız", "form-name-input-ph": "Adınız Soyadınız",
        "form-email": "E-posta Adresiniz", "form-email-input-ph": "ornek@mail.com",
        "form-msg": "Mesajınız", "form-msg-input-ph": "Nasıl yardımcı olabilirim?",
        "form-btn": "<span><i class=\"fas fa-paper-plane\" style=\"margin-right: 8px;\"></i> Mesaj Gönder</span>",
        "form-sending": "<i class=\"fas fa-spinner fa-spin\" style=\"margin-right: 8px;\"></i> Gönderiliyor...",
        "form-success": "Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağım!",
        "form-error": "Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        "footer-text": "&copy; 2026 Hüseyin Emre. Professional Excellence için tasarlandı ve kodlandı.",
        "menu-label": "Menu Paneli", "menu-btn-aria": "Menu Paneli", "lang-toggle": "🇬🇧 EN",
        "project-no-desc": "Açıklama bulunmuyor.",
        "gis-card-desc": "R dili ile coğrafi veri analizi ve görselleştirme çalışması.",
        "Sinema-Bilet-Otamasyonu-desc": "C# ve SQL Server kullanılarak geliştirilen, kapsamlı biletleme ve salon yönetim sistemi.",
        "Teknik-Destek-Sistemi-desc": "Firmaların teknik destek taleplerini organize eden, durum takibi yapılabilen web tabanlı çözüm.",
        "ERP-Modul-Gelistirme-desc": "Blazor ve .NET kullanılarak hazırlanan, stok ve fatura yönetimi odaklı özel ERP modülleri.",
        "HuseyinEmreTech-desc": "Şu an incelediğiniz modern portfolyo sitesinin kaynak kodları ve tasarım sistemi.",
        "gis-nav-back": "Geri Dön",
        "gis-hero-tag": "Üniversite Projesi / R Dili",
        "gis-hero-title": "Coğrafi Bilgi Sistemleri <br>& Mekansal Analiz",
        "gis-hero-desc": "R dili kullanılarak geliştirilen, CBS dersi kapsamında mekansal verilerin analizi, görselleştirilmesi ve haritalandırılması üzerine odaklanan kapsamlı bir çalışma.",
        "gis-hero-btn": "<i class=\"fab fa-github\" style=\"margin-right: 8px;\"></i> Kodları İncele",
        "gis-about-title": "Proje Hakkında",
        "gis-about-desc": "Bu proje, \"Coğrafi Bilgi Sistemleri\" (GIS) dersi için özel olarak hazırlanmıştır. Modern veri bilimi araçları (R, ggplot2, sf) kullanılarak coğrafi katmanların birleştirilmesi ve demografik/ekonomik verilerin harita üzerinde anlamlandırılmasını hedefler.",
        "gis-step1-title": "1. Veri Hazırlama",
        "gis-step1-desc": "Shapefile ve GeoJSON formatındaki ham verilerin R ortamına aktarılması, temizlenmesi ve koordinat sistemlerinin (CRS) normalize edilmesi süreçleri.",
        "gis-step2-title": "2. Mekansal Analiz",
        "gis-step2-desc": "Öznitelik verilerinin coğrafi katmanlarla birleştirilmesi (join) ve belirli kriterlere göre mekansal filtreleme işlemleri.",
        "gis-step3-title": "3. Görselleştirme",
        "gis-step3-desc": "Statik (ggplot2) ve interaktif (leaflet/tmap) haritaların oluşturulması, lejant yönetimi ve renk paletlerinin optimizasyonu.",
        "gis-code-label": "R Studio / Analiz",
        "gis-code-comment1": "# Mekansal veri analizi kütüphaneleri",
        "gis-code-comment2": "# Shapefile verisini oku",
        "gis-code-comment3": "# Görselleştirme katmanlarını oluştur",
        "gis-footer": "&copy; 2026 Hüseyin Emre. CBS Projesi Eğitim Materyali."
    },
    en: {
        "site-title": "Hüseyin Emre | ERP Consultant & Developer",
        "meta-desc": "Hüseyin Emre - ERP Consultant & Software Developer (.NET)",
        "meta-keywords": "software, developer, .net, blazor, erp, consultant, c#, technical support",
        "og-title": "Hüseyin Emre | ERP Consultant & Developer",
        "og-desc": "Modern and professional portfolio of Hüseyin Emre, specializing in ERP solutions and .NET development.",
        "tw-title": "Hüseyin Emre | ERP Consultant & Developer",
        "tw-desc": "Modern and professional portfolio of Hüseyin Emre, specializing in ERP solutions and .NET development.",
        "nav-about": "About", "nav-exp": "Experience", "nav-edu": "Education", "nav-proj": "Projects", "nav-skills": "Skills", "nav-contact": "Contact",
        "hero-title": "ERP Solutions Consultant <br>& Software Developer",
        "hero-desc": "A solution-oriented ERP professional bridging business process analysis, field operations, and modern software development (.NET, Blazor). Delivering end-to-end, efficient, and user-friendly solutions for enterprises.",
        "btn-proj": "View Projects", "btn-contact": "Contact Me", "btn-cv": "<i class=\"fas fa-file-download\" style=\"margin-right: 8px;\"></i> Download CV",
        "sec-exp": "Experience <span class=\"mono text-muted text-sm\">/experience</span>",
        "exp1-date": "June 2025 – Present",
        "exp1-title": "ERP Solutions Consultant & Software Developer",
        "exp1-company": "Hisar Software and Barcode Sales Systems",
        "exp1-desc": "Managed ERP system installation, customization, and end-user training processes to increase operational efficiency.",
        "exp1-li1": "Analyzed business processes to develop user-friendly, modern web interfaces and custom modules using Blazor and C#.",
        "exp1-li2": "Provided hardware integration (printers, POS) and on-site technical support at client locations.",
        "exp2-date": "June 2023 – June 2023",
        "exp2-title": "IT Infrastructure and System Support Intern",
        "exp2-company": "Osmaniye Municipality",
        "exp2-li1": "Resolved technical issues related to computers, printers, and network connections for institutional staff.",
        "exp2-li2": "Performed software and hardware installations and system updates.",
        "exp2-li3": "Assisted in basic network configurations and hardware troubleshooting.",
        "sec-edu": "Education <span class=\"mono text-muted text-sm\">/education</span>",
        "edu1-date": "October 2024 - Present",
        "edu1-title": "Management Information Systems",
        "edu1-school": "İskenderun Technical University",
        "edu1-degree": "Bachelor's Degree",
        "edu2-date": "October 2021 – June 2023",
        "edu2-title": "Computer Programming",
        "edu2-school": "Osmaniye Korkut Ata University",
        "edu2-degree": "Associate Degree",
        "sec-proj": "Projects <span class=\"mono text-muted text-sm\">/work</span>",
        "sec-skills": "Skills <span class=\"mono text-muted text-sm\">/skills</span>",
        "filter-all": "All", "filter-erp": "ERP", "filter-dev": "Development", "filter-tech": "Systems",
        "skill-grp-erp": "<i class=\"fas fa-briefcase text-muted\"></i> ERP & Business Processes",
        "skill-grp-dev": "<i class=\"fas fa-code text-muted\"></i> Software Development",
        "skill-grp-tech": "<i class=\"fas fa-tools text-muted\"></i> Tech Support & Systems",
        "skill-erp-cons": "ERP Consulting", "skill-erp-inst": "Installation & Customization", "skill-ba": "Business Analysis", "skill-opt": "Process Optimization", "skill-acc": "Accountancy",
        "skill-hw-int": "Hardware Integration", "skill-ts": "Troubleshooting", "skill-net": "Network Configuration", "skill-srv": "Server Support", "skill-rem": "Remote Support",
        "sec-contact": "Contact <span class=\"mono text-muted text-sm\">/contact</span>",
        "contact-desc": "You can contact me for an ERP project, software development needs, or technical consultancy.",
        "contact-email": "<i class=\"fas fa-envelope\" style=\"margin-right: 8px;\"></i> huseyinemre.tech@gmail.com",
        "contact-linkedin": "<i class=\"fab fa-linkedin\" style=\"margin-right: 8px;\"></i> LinkedIn",
        "contact-github": "<i class=\"fab fa-github\" style=\"margin-right: 8px;\"></i> GitHub",
        "form-name": "Full Name", "form-name-input-ph": "Your Full Name",
        "form-email": "Email Address", "form-email-input-ph": "example@mail.com",
        "form-msg": "Your Message", "form-msg-input-ph": "How can I help you?",
        "form-btn": "<span><i class=\"fas fa-paper-plane\" style=\"margin-right: 8px;\"></i> Send Message</span>",
        "form-sending": "<i class=\"fas fa-spinner fa-spin\" style=\"margin-right: 8px;\"></i> Sending...",
        "form-success": "Your message has been sent successfully. I will get back to you as soon as possible!",
        "form-error": "An error occurred while sending the message. Please try again later.",
        "footer-text": "&copy; 2026 Hüseyin Emre. Designed & Built for Professional Excellence.",
        "menu-label": "Menu Panel", "menu-btn-aria": "Menu Panel", "lang-toggle": "🇹🇷 TR",
        "project-no-desc": "Description not available.",
        "gis-card-desc": "Geospatial data analysis and visualization study with R language.",
        "Sinema-Bilet-Otamasyonu-desc": "Comprehensive ticketing and hall management system developed using C# and SQL Server.",
        "Teknik-Destek-Sistemi-desc": "Web-based solution that organizes technical support requests for companies with status tracking.",
        "ERP-Modul-Gelistirme-desc": "Custom ERP modules developed with Blazor and .NET, focusing on inventory and invoice management.",
        "HuseyinEmreTech-desc": "Source codes and design system of this modern portfolio site you are currently reviewing.",
        "gis-nav-back": "Go Back",
        "gis-hero-tag": "University Project / R Language",
        "gis-hero-title": "Geographic Information Systems <br>& Spatial Analysis",
        "gis-hero-desc": "Developed using the R language, this is a comprehensive study focused on spatial data analysis, visualization, and mapping within the scope of the GIS course.",
        "gis-hero-btn": "<i class=\"fab fa-github\" style=\"margin-right: 8px;\"></i> Review Codes",
        "gis-about-title": "About the Project",
        "gis-about-desc": "This project was specially prepared for the \"Geographic Information Systems\" (GIS) course. It aims to integrate geographic layers and make sense of demographic/economic data on the map using modern data science tools (R, ggplot2, sf).",
        "gis-step1-title": "1. Data Preparation",
        "gis-step1-desc": "Processes of importing raw data in Shapefile and GeoJSON formats into the R environment, cleaning them, and normalizing coordinate reference systems (CRS).",
        "gis-step2-title": "2. Spatial Analysis",
        "gis-step2-desc": "Joining attribute data with geographic layers and spatial filtering operations according to specific criteria.",
        "gis-step3-title": "3. Visualization",
        "gis-step3-desc": "Creation of static (ggplot2) and interactive (leaflet/tmap) maps, legend management, and optimization of color palettes.",
        "gis-code-label": "R Studio / Analysis",
        "gis-code-comment1": "# Geospatial data analysis libraries",
        "gis-code-comment2": "# Read shapefile data",
        "gis-code-comment3": "# Create visualization layers",
        "gis-footer": "&copy; 2026 Hüseyin Emre. GIS Project Educational Material."
    }
};

function initLanguageToggle() {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    let currentLang = localStorage.getItem('site_lang') || 'tr';

    // Apply initial language
    applyTranslations(currentLang);
    updateToggleBtn(langBtn, currentLang);

    langBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentLang = currentLang === 'tr' ? 'en' : 'tr';

        localStorage.setItem('site_lang', currentLang);
        applyTranslations(currentLang);
        updateToggleBtn(langBtn, currentLang);

        // Re-render projects to apply language change if they are loaded
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid && !projectsGrid.querySelector('.loading-state')) {
            fetchGitHubProjects();
        }
    });
}

function updateToggleBtn(btn, lang) {
    btn.innerHTML = lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR';
}

function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;

    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');

        // Handle content
        if (dict[key]) {
            if (el.tagName === 'META') {
                el.setAttribute('content', dict[key]);
            } else if (el.tagName === 'TITLE') {
                document.title = dict[key];
            } else {
                el.innerHTML = dict[key];
            }
        }

        // Handle placeholders (even if no main content)
        const phKey = key + '-ph';
        const inputPhKey = key + '-input-ph'; // Support both styles
        if (dict[phKey]) {
            el.setAttribute('placeholder', dict[phKey]);
        } else if (dict[inputPhKey]) {
            el.setAttribute('placeholder', dict[inputPhKey]);
        }

        // Handle aria-labels
        const ariaKey = key + '-aria';
        if (dict[ariaKey]) {
            el.setAttribute('aria-label', dict[ariaKey]);
        }
    });

    document.documentElement.lang = lang;
}
