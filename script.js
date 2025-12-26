/* =====================================================
   CYBERPUNK PORTFOLIO - JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavbar();
    initMobileMenu();
    initTypingEffect();
    initParticles();
    initScrollAnimations();
    initCounterAnimation();
    initContactForm();
    initSmoothScroll();

    // New UI Features
    initCustomCursor();
    initThemeSwitcher();
    initHUD();
    initAudioUI();
    init3DTilt();
    initMatrixRain();

    // Load projects last
    fetchGitHubProjects();
});

/* =====================================================
   NAVBAR
   ===================================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* =====================================================
   MOBILE MENU
   ===================================================== */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.nav-link');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* =====================================================
   TYPING EFFECT
   ===================================================== */
function initTypingEffect() {
    const typingElement = document.getElementById('typing-text');
    const phrases = [
        'ERP Çözüm Danışmanı',
        '.NET Developer',
        'Blazor Developer',
        'Yazılım Geliştirici',
        'Teknik Destek Uzmanı'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        const displayText = currentPhrase.substring(0, charIndex); // Fix off-by-one visual logic
        typingElement.textContent = displayText;

        if (isDeleting) {
            charIndex--;
            typingSpeed = 50;
        } else {
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length + 1) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* =====================================================
   FLOATING PARTICLES
   ===================================================== */
function initParticles() {
    const container = document.getElementById('particles');
    // Safety check if particles exist (they should)
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Random position
    particle.style.left = `${Math.random() * 100}%`;

    // Random delay
    particle.style.animationDelay = `${Math.random() * 15}s`;

    // Random size
    const size = Math.random() * 4 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Random color
    const colors = ['var(--neon-cyan)', 'var(--neon-pink)', 'var(--neon-purple)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;
    particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

    container.appendChild(particle);
}

/* =====================================================
   SCROLL ANIMATIONS
   ===================================================== */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll(
        '.about-content, .about-stats, .project-card, .skill-category, .blog-card, .contact-content, .timeline-item'
    );

    fadeElements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('timeline-item')) {
                    entry.target.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
}

/* =====================================================
   GITHUB PROJECTS INTEGRATION
   ===================================================== */
async function fetchGitHubProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    const username = 'huseyinemretech';
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;
    const cacheKey = 'github_repos_cache';
    const cacheTimeKey = 'github_repos_cache_time';
    const cacheDuration = 3600000; // 1 hour

    try {
        // Try to load from cache first
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        const now = new Date().getTime();

        if (cachedData && cacheTime && (now - cacheTime < cacheDuration)) {
            console.log('Loading repositories from cache');
            const repos = JSON.parse(cachedData);
            displayRepos(repos);
            return;
        }

        const response = await fetch(apiUrl);

        // Check for rate limiting
        if (response.status === 403) {
            const resetTime = response.headers.get('X-RateLimit-Reset');
            const waitTime = resetTime ? Math.ceil((resetTime * 1000 - now) / 60000) : 'bir süre';
            throw new Error(`GitHub API limitine takıldık. Yaklaşık ${waitTime} dakika sonra tekrar deneyin.`);
        }

        if (!response.ok) {
            throw new Error(`GitHub API hatası: ${response.status}`);
        }

        const repos = await response.json();
        console.log('GitHub repos loaded from API:', repos.length);

        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(repos));
        localStorage.setItem(cacheTimeKey, now.toString());

        displayRepos(repos);

    } catch (error) {
        console.error('Error fetching projects:', error);

        // Final fallback: try cache even if expired
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            console.log('API error, falling back to expired cache');
            displayRepos(JSON.parse(cachedData));
            return;
        }

        projectsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle error-icon"></i>
                <p class="error-message">${error.message || 'Projeler yüklenirken bir sorun oluştu.'}</p>
                <div class="error-actions">
                    <button id="retry-btn" class="btn btn-primary">
                        Yeniden Dene
                    </button>
                    <a href="https://github.com/${username}" target="_blank" class="btn btn-secondary">
                        GitHub'da Gör
                    </a>
                </div>
            </div>
        `;

        // Add event listener to the retry button (CSP compliant)
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                localStorage.removeItem('github_repos_cache');
                location.reload();
            });
        }
    }
}

function displayRepos(repos) {
    const projectsGrid = document.getElementById('projects-grid');
    const username = 'huseyinemretech';

    // Clear loading/error state
    projectsGrid.innerHTML = '';

    // Filter out forks or profile repo if desired
    const relevantRepos = repos.filter(repo => !repo.fork && repo.name !== username);

    if (relevantRepos.length === 0) {
        projectsGrid.innerHTML = '<div class="error-state"><p>Henüz proje bulunamadı.</p></div>';
        return;
    }

    relevantRepos.forEach(repo => {
        const card = createProjectCard(repo);
        projectsGrid.appendChild(card);
    });

    // Initialize filters AFTER content is loaded
    initProjectFilters();

    // Re-run scroll animations/Tilt for new elements
    initScrollAnimations();
    init3DTilt();
}

function createProjectCard(repo) {
    // Determine category based on topics or language
    let category = 'web'; // Default
    const topics = repo.topics || [];
    const lang = (repo.language || '').toLowerCase();

    if (topics.includes('ai') || topics.includes('machine-learning') || topics.includes('python')) {
        category = 'ai';
    } else if (topics.includes('mobile') || topics.includes('react-native') || topics.includes('flutter')) {
        category = 'mobile';
    } else if (topics.includes('web') || lang === 'html' || lang === 'css' || lang === 'javascript' || lang === 'typescript' || lang === 'c#') {
        category = 'web';
    }

    // Determine icon
    let icon = 'fas fa-code';
    if (category === 'ai') icon = 'fas fa-robot';
    if (category === 'mobile') icon = 'fas fa-mobile-alt';
    if (category === 'web') icon = 'fas fa-globe';

    const article = document.createElement('article');
    article.className = 'project-card fade-in';
    article.setAttribute('data-category', category);

    article.innerHTML = `
        <div class="project-image">
            <div class="project-placeholder">
                <i class="${icon}"></i>
            </div>
            <div class="project-overlay">
                <div class="project-links">
                    <a href="${repo.html_url}" target="_blank" class="project-link" aria-label="GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                    ${repo.homepage ? `
                    <a href="${repo.homepage}" target="_blank" class="project-link" aria-label="Demo">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
            <p class="project-description">
                ${repo.description || 'Bu proje için henüz bir açıklama eklenmemiş.'}
            </p>
            <div class="project-tech">
                ${repo.language ? `<span class="tech-tag">${repo.language}</span>` : ''}
                <span class="tech-tag"><i class="far fa-star"></i> ${repo.stargazers_count}</span>
            </div>
        </div>
    `;

    return article;
}

/* =====================================================
   PROJECT FILTERS (Refactored)
   ===================================================== */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        // Remove old listeners to prevent duplicates if called multiple times
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');

            const filter = newBtn.dataset.filter;
            const projectCards = document.querySelectorAll('.project-card');

            projectCards.forEach(card => {
                const category = card.dataset.category;

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    // Reset animation
                    card.style.animation = 'none';
                    card.offsetHeight; /* trigger reflow */
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* =====================================================
   COUNTER ANIMATION
   ===================================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (target === 99 ? '' : '+');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

/* =====================================================
   CONTACT FORM
   ===================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Show success message (in real app, send to server)
        const btn = form.querySelector('.btn-submit');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<span class="btn-text">Gönderildi!</span> <i class="fas fa-check"></i>';
        btn.classList.add('btn-success');

        // Play success sound
        if (window.playConfirmSound) window.playConfirmSound();

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-success');
            form.reset();
        }, 3000);

        console.log('Form data:', data);
    });
}

/* =====================================================
   SMOOTH SCROLL
   ===================================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = 80;
                const targetPosition = target.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* =====================================================
   CUSTOM CURSOR
   ===================================================== */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    // Use simple mouse move without lerp for instant response on standard sites, 
    // or add lerp for "floaty" feel. Let's do a slight 0.1s CSS delay which is already in style.

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const clickables = document.querySelectorAll('a, button, .btn, .social-link, input, textarea');

    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            // Magnetic effect logic could go here (complex), 
            // for now CSS scale/rotate is enough visual feedback.
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });

    document.addEventListener('mousedown', () => cursor.classList.add('cursor-active'));
    document.addEventListener('mouseup', () => cursor.classList.remove('cursor-active'));
}

/* =====================================================
   THEME SWITCHER
   ===================================================== */
function initThemeSwitcher() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const switcher = document.getElementById('theme-switcher');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const body = document.body;

    // Load saved theme (default to Matrix)
    const savedTheme = localStorage.getItem('theme') || 'matrix';
    body.setAttribute('data-theme', savedTheme);

    themeBtns.forEach(btn => {
        if (btn.dataset.theme === savedTheme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Toggle Menu
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        switcher.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!switcher.contains(e.target) && !toggleBtn.contains(e.target)) {
            switcher.classList.remove('active');
        }
    });

    // Switch Theme
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            // Audio Feedback
            if (window.playClickSound) window.playClickSound();

            // Update Active State
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/* =====================================================
   HUD SYSTEM
   ===================================================== */
function initHUD() {
    const timeEl = document.getElementById('sys-time');
    const cpuEl = document.getElementById('sys-cpu');

    // Update Time
    setInterval(() => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('tr-TR');
    }, 1000);

    // Simulated CPU Load
    setInterval(() => {
        const load = Math.floor(Math.random() * 30) + 10;
        cpuEl.textContent = load + '%';
    }, 2000);
}

/* =====================================================
   AUDIO UI (Web Audio API)
   ===================================================== */
function initAudioUI() {
    // Check for AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.1; // Low volume
    gainNode.connect(audioCtx.destination);

    // Oscillator Helper
    function beep(frequency, type, duration) {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        oscGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    // Expose sounds globally
    window.playHoverSound = () => beep(800, 'sine', 0.1);
    window.playClickSound = () => beep(1200, 'square', 0.1);
    window.playConfirmSound = () => {
        beep(400, 'sine', 0.1);
        setTimeout(() => beep(600, 'sine', 0.1), 100);
    };

    // Attach to elements
    const interactiveElements = document.querySelectorAll('a, button, .theme-btn');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', window.playHoverSound);
        el.addEventListener('click', window.playClickSound);
    });
}

/* =====================================================
   3D TILT EFFECT
   ===================================================== */
function init3DTilt() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

/* =====================================================
   MATRIX DIGITAL RAIN EFFECT
   ===================================================== */
function initMatrixRain() {
    const canvas = document.getElementById('matrix-rain');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Array of drops - one per column
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // Start at random positions
    }

    // Drawing the characters
    function draw() {
        // Check if matrix theme is active
        const isMatrixTheme = document.body.getAttribute('data-theme') === 'matrix';

        if (!isMatrixTheme) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Black background with opacity for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Green text
        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';

        // Loop through drops
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const text = characters.charAt(Math.floor(Math.random() * characters.length));

            // Draw character
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Reset drop randomly after it reaches bottom
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Increment Y coordinate
            drops[i]++;
        }
    }

    // Run animation
    setInterval(draw, 35);

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drops.length = 0;
        const newColumns = canvas.width / fontSize;
        for (let i = 0; i < newColumns; i++) {
            drops[i] = Math.random() * -100;
        }
    });
}

/* =====================================================
   ANIMATION KEYFRAMES (Moved to CSS)
   ===================================================== */

