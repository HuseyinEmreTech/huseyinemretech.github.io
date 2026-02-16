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

        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '80px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'var(--bg-secondary)';
            navLinks.style.padding = '20px';
            navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
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
    projectsGrid.innerHTML = '';

    repos.forEach((repo, index) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        // Add staggering delay
        card.style.transitionDelay = `${index * 100}ms`;

        card.innerHTML = `
            <div class="project-header">
                <i class="far fa-folder folder-icon"></i>
                <div class="project-links">
                    <a href="${repo.html_url}" target="_blank" aria-label="GitHub Repo"><i class="fab fa-github"></i></a>
                    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" aria-label="Live Demo"><i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            </div>
            <h3 class="project-title">${formatTitle(repo.name)}</h3>
            <p class="project-desc">${repo.description || 'Açıklama bulunmuyor.'}</p>
            <div class="project-tech">
                ${repo.language ? `<span>${repo.language}</span>` : ''}
                <span><i class="far fa-star"></i> ${repo.stargazers_count}</span>
            </div>
        `;

        projectsGrid.appendChild(card);

        // Observe new elements
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
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    const elements = document.querySelectorAll('.timeline-item, .skills-list, .hero-content');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
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
