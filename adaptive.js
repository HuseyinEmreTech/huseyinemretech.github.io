/* =====================================================
   ADAPTIVE UI - Orkestratör
   Test sonrası AI'a gider, sonucu uygular.
   Konsoldan applyAdaptive() ile direkt de test edebilirsin.
   ===================================================== */

async function fetchAdaptiveFromAI(testResult) {
    const url = '/api/adaptive';
    console.log('[adaptive] AI\'a gönderiliyor:', testResult);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testResult)
        });
        const data = await res.json();
        console.log('[adaptive] AI cevabı:', data);
        if (data.success && data.tema) {
            return {
                tema: data.tema,
                layout: data.layout,
                cta: data.cta,
                ton: data.ton,
                fontSize: data.fontSize,
                animation: data.animation,
                buttonStyle: data.buttonStyle,
                spacing: data.spacing
            };
        }
        if (data.fallback) return data.fallback;
        return null;
    } catch (e) {
        console.error('[adaptive] AI hatası:', e);
        return null;
    }
}
window.fetchAdaptiveFromAI = fetchAdaptiveFromAI;

function showAdaptiveLoading(show) {
    let el = document.getElementById('adaptive-loading-overlay');
    if (!el) {
        const text = document.documentElement.lang === 'en' ? 'Analyzing...' : 'AI analiz ediyor...';
        el = document.createElement('div');
        el.id = 'adaptive-loading-overlay';
        el.className = 'adaptive-loading-overlay';
        el.innerHTML = `
            <div class="adaptive-loading-box">
                <div class="adaptive-loading-spinner"></div>
                <span class="adaptive-loading-text">${text}</span>
            </div>
        `;
        document.body.appendChild(el);
    }
    el.classList.toggle('active', !!show);
}

window.addEventListener('adaptive-test-complete', async (e) => {
    const result = e.detail;
    showAdaptiveLoading(true);
    try {
        const selection = await fetchAdaptiveFromAI(result);
        if (selection) {
            applyAdaptive(selection);
            console.log('[adaptive] Uygulandı:', selection);
        } else {
            applyAdaptive(getFallbackSelection(result));
            console.log('[adaptive] Fallback uygulandı (AI cevap vermedi)');
        }
    } finally {
        showAdaptiveLoading(false);
    }
});

function getFallbackSelection(testResult) {
    if (testResult?.type === 'mbti' && adaptivePresets[testResult.mbti]) {
        return adaptivePresets[testResult.mbti];
    }
    return adaptivePresets.ISTJ;
}

function loadTheme(tema) {
    document.body.classList.remove('adaptive-cool', 'adaptive-warm', 'adaptive-vibrant');
    if (tema && ['cool', 'warm', 'vibrant'].includes(tema)) {
        document.body.classList.add('adaptive-' + tema);
    }
}

function applyAdaptive(config) {
    if (!config || typeof config !== 'object') return;
    const { tema, layout, cta, ton, fontSize, animation, buttonStyle, spacing } = config;
    if (tema) loadTheme(tema);
    if (layout && typeof window.loadLayout === 'function') window.loadLayout(layout);
    if (cta && typeof window.loadCTA === 'function') window.loadCTA(cta);
    if (ton && typeof window.loadTone === 'function') window.loadTone(ton);
    if (fontSize && typeof window.loadFontSize === 'function') window.loadFontSize(fontSize);
    if (animation && typeof window.loadAnimation === 'function') window.loadAnimation(animation);
    if (typeof window.loadButtonStyle === 'function') window.loadButtonStyle(buttonStyle || 'rounded');
    if (typeof window.loadSpacing === 'function') window.loadSpacing(spacing || 'comfortable');
    try {
        localStorage.setItem('adaptive_config', JSON.stringify(config));
    } catch (_) {}
}

// Konsoldan yapıştırılacak hazır presets (8 boyut)
const _base = { fontSize: 'medium', animation: 'normal', buttonStyle: 'rounded', spacing: 'comfortable' };
window.adaptivePresets = {
    INTJ: { ..._base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal', animation: 'subtle', buttonStyle: 'square' },
    ENTJ: { ..._base, tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical' },
    INFJ: { ..._base, tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story', buttonStyle: 'pill' },
    ENFJ: { ..._base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill', spacing: 'spacious' },
    ISTP: { ..._base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal', animation: 'subtle', buttonStyle: 'square', spacing: 'compact' },
    ESTP: { ..._base, tema: 'vibrant', layout: 'technical', cta: 'github-cta', ton: 'technical', animation: 'dynamic', buttonStyle: 'pill' },
    ISFP: { ..._base, tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story', buttonStyle: 'rounded', spacing: 'spacious' },
    ESFP: { ..._base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill', spacing: 'spacious' },
    ISTJ: { ..._base, tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical', buttonStyle: 'square', spacing: 'compact' },
    ESTJ: { ..._base, tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'technical' },
    ISFJ: { ..._base, tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'story' },
    ESFJ: { ..._base, tema: 'vibrant', layout: 'business', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'rounded' },
    INTP: { ..._base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical', animation: 'subtle', buttonStyle: 'square', spacing: 'compact' },
    ENTP: { ..._base, tema: 'vibrant', layout: 'technical', cta: 'github-cta', ton: 'technical', animation: 'dynamic', buttonStyle: 'pill' },
    INFP: { ..._base, tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story', spacing: 'spacious' },
    ENFP: { ..._base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill', spacing: 'spacious' },
    cool: { ..._base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal', animation: 'subtle', buttonStyle: 'square' },
    warm: { ..._base, tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'story' },
    vibrant: { ..._base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill' },
    reset: { ..._base, tema: null, layout: 'technical', cta: 'contact-cta', ton: 'story' }
};

/** Siteyi varsayılan haline sıfırlar, ayarları siler */
function resetAdaptive() {
    try {
        localStorage.removeItem('adaptive_config');
        location.reload();
    } catch (_) {}
}
window.resetAdaptive = resetAdaptive;
window.applyAdaptive = applyAdaptive;
window.loadTheme = loadTheme;
window.fetchAdaptiveFromAI = fetchAdaptiveFromAI;

// Sayfa yüklendiğinde kayıtlı config'i uygula
function restoreAdaptiveConfig() {
    try {
        const saved = localStorage.getItem('adaptive_config');
        if (saved) {
            const config = JSON.parse(saved);
            applyAdaptive(config);
        }
    } catch (_) {}
}
function createResetButton() {
    let btn = document.getElementById('adaptive-reset-btn');
    if (btn) return btn;
    const hasSaved = !!localStorage.getItem('adaptive_config');
    if (!hasSaved) return null;
    btn = document.createElement('button');
    btn.id = 'adaptive-reset-btn';
    btn.className = 'adaptive-reset-btn';
    btn.textContent = document.documentElement.lang === 'en' ? 'Reset site' : 'Siteyi sıfırla';
    btn.setAttribute('aria-label', btn.textContent);
    btn.addEventListener('click', resetAdaptive);
    document.body.appendChild(btn);
    return btn;
}

function updateResetButtonVisibility() {
    const btn = document.getElementById('adaptive-reset-btn');
    const hasSaved = !!localStorage.getItem('adaptive_config');
    if (btn) {
        btn.style.display = hasSaved ? 'flex' : 'none';
    } else if (hasSaved) {
        createResetButton();
    }
}

window.addEventListener('adaptive-test-complete', () => setTimeout(updateResetButtonVisibility, 100));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        restoreAdaptiveConfig();
        updateResetButtonVisibility();
    });
} else {
    restoreAdaptiveConfig();
    updateResetButtonVisibility();
}
