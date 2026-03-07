/* =====================================================
   ADAPTIVE UI - Orkestratör
   Konsoldan applyAdaptive({ tema, layout, cta, ton }) ile direkt uygula
   ===================================================== */

function loadTheme(tema) {
    document.body.classList.remove('adaptive-cool', 'adaptive-warm', 'adaptive-vibrant');
    if (tema && ['cool', 'warm', 'vibrant'].includes(tema)) {
        document.body.classList.add('adaptive-' + tema);
    }
}

function applyAdaptive(config) {
    if (!config || typeof config !== 'object') return;
    const { tema, layout, cta, ton } = config;
    if (tema) loadTheme(tema);
    if (layout && typeof window.loadLayout === 'function') window.loadLayout(layout);
    if (cta && typeof window.loadCTA === 'function') window.loadCTA(cta);
    if (ton && typeof window.loadTone === 'function') window.loadTone(ton);
    try {
        localStorage.setItem('adaptive_config', JSON.stringify(config));
    } catch (_) {}
}

// Konsoldan yapıştırılacak hazır presets
window.adaptivePresets = {
    INTJ: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal' },
    ENFP: { tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story' },
    ISTJ: { tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical' },
    INFP: { tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story' },
    cool: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal' },
    warm: { tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'story' },
    vibrant: { tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story' },
    reset: { tema: null, layout: 'technical', cta: 'contact-cta', ton: 'story' }
};

window.applyAdaptive = applyAdaptive;
window.loadTheme = loadTheme;
