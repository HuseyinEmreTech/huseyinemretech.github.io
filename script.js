/* =====================================================
   MODERN PROFESSIONAL PORTFOLIO - JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    fetchGitHubProjects();
    initScrollAnimations();
    initMagneticButtons();
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
    const cacheKey = 'github_repos_v2';

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
        const validRepos = repos.filter(repo => !repo.fork).slice(0, 6);

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
