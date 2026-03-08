/* =====================================================
   ADAPTIVE UI - CTA Varyantları
   Hero bölümündeki ana butonu değiştirir.
   Dil sistemine uyumlu (tr/en).
   ===================================================== */

const ctas = {
    'github-cta': {
        tr: { text: "GitHub'ımı İncele", icon: 'fab fa-github', url: 'https://github.com/huseyinemretech' },
        en: { text: 'View My GitHub', icon: 'fab fa-github', url: 'https://github.com/huseyinemretech' }
    },
    'cv-cta': {
        tr: { text: 'CV İndir', icon: 'fas fa-file-download', url: '#' },
        en: { text: 'Download CV', icon: 'fas fa-file-download', url: '#' }
    },
    'contact-cta': {
        tr: { text: 'Proje Konuşalım', icon: 'fas fa-envelope', url: '#contact' },
        en: { text: "Let's Talk Project", icon: 'fas fa-envelope', url: '#contact' }
    }
};

const secondaryCtas = {
    'projects': {
        tr: { text: 'Projelerimi İncele', icon: 'fas fa-folder-open', url: '#projects' },
        en: { text: 'View Projects', icon: 'fas fa-folder-open', url: '#projects' }
    },
    'contact': {
        tr: { text: 'İletişime Geç', icon: 'fas fa-envelope', url: '#contact' },
        en: { text: 'Contact Me', icon: 'fas fa-envelope', url: '#contact' }
    },
    'cv': {
        tr: { text: 'CV İndir', icon: 'fas fa-file-download', url: '#' },
        en: { text: 'Download CV', icon: 'fas fa-file-download', url: '#' }
    },
    'github': {
        tr: { text: "GitHub'ımı İncele", icon: 'fab fa-github', url: 'https://github.com/huseyinemretech' },
        en: { text: 'View My GitHub', icon: 'fab fa-github', url: 'https://github.com/huseyinemretech' }
    }
};

/**
 * Belirtilen CTA tipine göre hero ana butonunu günceller
 * @param {string} type - 'github-cta' | 'cv-cta' | 'contact-cta'
 */
function loadCTA(type) {
    const config = ctas[type];
    if (!config) {
        console.warn(`[adaptive-cta] Bilinmeyen CTA: ${type}`);
        return;
    }

    const ctaGroup = document.querySelector('.hero .cta-group');
    if (!ctaGroup) return;

    const lang = document.documentElement.lang === 'en' ? 'en' : 'tr';

    const secondaryKeys = type === 'github-cta' ? ['contact', 'cv'] : type === 'cv-cta' ? ['projects', 'contact'] : ['projects', 'cv'];

    ctaGroup.innerHTML = '';

    const primary = config[lang];
    const primaryBtn = document.createElement('a');
    primaryBtn.className = 'btn btn-primary';
    primaryBtn.href = primary.url;
    primaryBtn.target = primary.url.startsWith('http') ? '_blank' : '';
    primaryBtn.rel = primary.url.startsWith('http') ? 'noopener noreferrer' : '';
    primaryBtn.innerHTML = `<i class="${primary.icon}" style="margin-right: 8px;"></i>${primary.text}`;
    ctaGroup.appendChild(primaryBtn);

    secondaryKeys.forEach(key => {
        const sec = secondaryCtas[key][lang];
        const btn = document.createElement('a');
        btn.className = 'btn btn-secondary';
        btn.href = sec.url;
        btn.target = sec.url.startsWith('http') ? '_blank' : '';
        btn.rel = sec.url.startsWith('http') ? 'noopener noreferrer' : '';
        btn.innerHTML = `<i class="${sec.icon}" style="margin-right: 8px;"></i>${sec.text}`;
        ctaGroup.appendChild(btn);
    });
}

// Konsol testi için global erişim
if (typeof window !== 'undefined') {
    window.loadCTA = loadCTA;
}
