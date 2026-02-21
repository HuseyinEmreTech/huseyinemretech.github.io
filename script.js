/* =====================================================
   MODERN PROFESSIONAL PORTFOLIO - JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    fetchGitHubProjects();
    initScrollAnimations();
    initMagneticButtons();
    initCustomCursor();
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

    const username = 'huseyinemretech';
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;
    const cacheKey = 'github_repos_v3';

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) {
            renderProjects(data);
            return;
        }
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('GitHub API Error');

        const repos = await response.json();
        const validRepos = repos.slice(0, 6);

        localStorage.setItem(cacheKey, JSON.stringify({
            data: validRepos,
            timestamp: Date.now()
        }));

        renderProjects(validRepos);
    } catch (error) {
        console.error('Failed to load projects:', error);
        projectsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">
                <i class="fas fa-exclamation-circle"></i> Projeler yüklenemedi. 
                <a href="https://github.com/${username}" target="_blank" style="color: var(--accent-primary);">GitHub'da Görüntüle</a>
            </div>
        `;
    }
}

function renderProjects(repos) {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    // Local/Featured Projects
    const localProjects = [
        {
            name: 'GIS Mekansal Analiz',
            description: 'R dili ile mekansal veri analizi, sf ve ggplot2 paketleri kullanılarak hazırlanan üniversite projesi.',
            language: 'R Language',
            html_url: 'gis-project.html',
            isLocal: true,
            stargazers_count: 'Special'
        }
    ];

    const repoDetails = {
        'Sinema-Bilet-Otamasyonu': {
            name: 'Sinema Bilet Otomasyonu',
            desc: 'C# ve SQL Server kullanılarak geliştirilen, kapsamlı biletleme ve salon yönetim sistemi.'
        },
        'Teknik-Destek-Sistemi': {
            desc: 'Firmaların teknik destek taleplerini organize eden, durum takibi yapılabilen web tabanlı çözüm.'
        },
        'ERP-Modul-Gelistirme': {
            desc: 'Blazor ve .NET kullanılarak hazırlanan, stok ve fatura yönetimi odaklı özel ERP modülleri.'
        },
        'HuseyinEmreTech': {
            desc: 'Şu an incelediğiniz modern portfolyo sitesinin kaynak kodları ve tasarım sistemi.'
        }
    };

    const allProjects = [...localProjects, ...repos];

    allProjects.forEach((repo, index) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.style.transitionDelay = `${index * 100}ms`;

        const detail = repoDetails[repo.name] || {};
        const title = repo.isLocal ? repo.name : (detail.name || formatTitle(repo.name));
        const description = repo.isLocal ? repo.description : (detail.desc || repo.description || 'Açıklama bulunmuyor.');

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

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Gönderiliyor...';
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
                statusDiv.textContent = 'Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağım!';
                statusDiv.classList.add('success');
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            statusDiv.textContent = 'Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya doğrudan e-posta gönderin.';
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
        "nav-about": "Hakkımda", "nav-exp": "Deneyim", "nav-edu": "Eğitim", "nav-proj": "Projeler", "nav-skills": "Yetenekler", "nav-contact": "İletişim",
        "hero-title": "ERP Çözüm Danışmanı <br>& Yazılım Geliştirici",
        "hero-desc": "İş süreçleri analizi, saha operasyonları ve modern yazılım geliştirme (.NET, Blazor) yetkinliklerini bir araya getiren, çözüm odaklı bir ERP profesyoneliyim. İşletmeler için uçtan uca, verimli ve kullanıcı dostu çözümler üretiyorum.",
        "btn-proj": "Projelerimi İncele", "btn-contact": "İletişime Geç", "btn-cv": "<i class=\"fas fa-file-download\" style=\"margin-right: 8px;\"></i> CV İndir",
        "sec-exp": "Deneyim <span class=\"mono text-muted text-sm\">/experience</span>",
        "sec-edu": "Eğitim <span class=\"mono text-muted text-sm\">/education</span>",
        "sec-proj": "Projeler <span class=\"mono text-muted text-sm\">/work</span>",
        "sec-skills": "Yetenekler <span class=\"mono text-muted text-sm\">/skills</span>",
        "sec-contact": "İletişim <span class=\"mono text-muted text-sm\">/contact</span>",
        "filter-all": "Tümü", "filter-erp": "ERP", "filter-dev": "Yazılım", "filter-tech": "Sistem",
        "form-name": "Adınız Soyadınız", "form-email": "E-posta Adresiniz", "form-msg": "Mesajınız", "form-btn": "<span><i class=\"fas fa-paper-plane\" style=\"margin-right: 8px;\"></i> Mesaj Gönder</span>"
    },
    en: {
        "nav-about": "About", "nav-exp": "Experience", "nav-edu": "Education", "nav-proj": "Projects", "nav-skills": "Skills", "nav-contact": "Contact",
        "hero-title": "ERP Solutions Consultant <br>& Software Developer",
        "hero-desc": "A solution-oriented ERP professional bridging business process analysis, field operations, and modern software development (.NET, Blazor). Delivering end-to-end, efficient, and user-friendly solutions for enterprises.",
        "btn-proj": "View Projects", "btn-contact": "Contact Me", "btn-cv": "<i class=\"fas fa-file-download\" style=\"margin-right: 8px;\"></i> Download CV",
        "sec-exp": "Experience <span class=\"mono text-muted text-sm\">/experience</span>",
        "sec-edu": "Education <span class=\"mono text-muted text-sm\">/education</span>",
        "sec-proj": "Projects <span class=\"mono text-muted text-sm\">/work</span>",
        "sec-skills": "Skills <span class=\"mono text-muted text-sm\">/skills</span>",
        "sec-contact": "Contact <span class=\"mono text-muted text-sm\">/contact</span>",
        "filter-all": "All", "filter-erp": "ERP", "filter-dev": "Development", "filter-tech": "Systems",
        "form-name": "Full Name", "form-email": "Email Address", "form-msg": "Your Message", "form-btn": "<span><i class=\"fas fa-paper-plane\" style=\"margin-right: 8px;\"></i> Send Message</span>"
    }
};

function initLanguageToggle() {
    const langBtn = document.getElementById('lang-toggle');
    if (!langBtn) return;

    let currentLang = localStorage.getItem('site_lang') || 'tr';

    if (currentLang === 'en') {
        applyTranslations('en');
        langBtn.innerHTML = '🇹🇷 TR';
    }

    langBtn.addEventListener('click', () => {
        if (currentLang === 'tr') {
            currentLang = 'en';
            langBtn.innerHTML = '🇹🇷 TR';
        } else {
            currentLang = 'tr';
            langBtn.innerHTML = '🇬🇧 EN';
        }

        localStorage.setItem('site_lang', currentLang);
        applyTranslations(currentLang);
    });
}

function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    document.documentElement.lang = lang === 'tr' ? 'tr' : 'en';
}
