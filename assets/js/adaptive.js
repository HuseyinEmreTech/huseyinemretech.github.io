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
        if (data.debug) console.warn('[adaptive] AI hata detayı:', data.debug);
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

// Kişisel rapor etiketleri
const RAPOR_LABELS = {
    tr: {
        tema: { cool: 'Sakin/Mavi', warm: 'Sıcak/Turuncu', vibrant: 'Enerjik/Mor' },
        layout: { technical: 'Teknik', business: 'İş odaklı', creative: 'Yaratıcı' },
        cta: { 'github-cta': 'GitHub öne çıkar', 'cv-cta': 'CV indir', 'contact-cta': 'İletişim öne çıkar' },
        ton: { technical: 'Kısa ve net', story: 'Hikaye anlatımı', minimal: 'Minimal' },
        fontSize: { small: 'Küçük font', medium: 'Orta font', large: 'Büyük font' },
        animation: { subtle: 'Hafif animasyon', normal: 'Standart', dynamic: 'Enerjik animasyon' },
        buttonStyle: { rounded: 'Yuvarlak', square: 'Köşeli', pill: 'Pil' },
        spacing: { compact: 'Sıkı', comfortable: 'Dengeli', spacious: 'Ferah' }
    },
    en: {
        tema: { cool: 'Cool/Blue', warm: 'Warm/Amber', vibrant: 'Vibrant/Purple' },
        layout: { technical: 'Technical', business: 'Business', creative: 'Creative' },
        cta: { 'github-cta': 'GitHub', 'cv-cta': 'CV', 'contact-cta': 'Contact' },
        ton: { technical: 'Short & clear', story: 'Storytelling', minimal: 'Minimal' },
        fontSize: { small: 'Small', medium: 'Medium', large: 'Large' },
        animation: { subtle: 'Subtle', normal: 'Standard', dynamic: 'Dynamic' },
        buttonStyle: { rounded: 'Rounded', square: 'Square', pill: 'Pill' },
        spacing: { compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }
    }
};

function buildAdaptiveReport(testResult, selection) {
    const lang = (document.documentElement.lang || 'tr').startsWith('en') ? 'en' : 'tr';
    const L = RAPOR_LABELS[lang];
    if (!L || !selection) return '';
    const items = [];
    ['tema', 'layout', 'cta', 'ton', 'fontSize', 'animation', 'buttonStyle', 'spacing'].forEach(k => {
        const v = selection[k];
        if (v && L[k] && L[k][v]) items.push(L[k][v]);
    });
    if (items.length === 0) return '';
    const prefix = testResult?.type === 'mbti' && testResult?.mbti
        ? (lang === 'tr' ? `${testResult.mbti} olarak siz: ` : `As ${testResult.mbti}: `)
        : (lang === 'tr' ? 'Profilinize göre: ' : 'Based on your profile: ');
    return prefix + items.join(' · ');
}

function showAdaptiveReport(testResult, selection) {
    const text = buildAdaptiveReport(testResult, selection);
    if (!text) return;
    let toast = document.getElementById('adaptive-report-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adaptive-report-toast';
        toast.className = 'adaptive-report-toast';
        const closeLabel = (document.documentElement.lang || 'tr').startsWith('en') ? 'Close' : 'Kapat';
        toast.innerHTML = `<span class="adaptive-report-text"></span><button class="adaptive-report-close" aria-label="${closeLabel}">&times;</button>`;
        toast.querySelector('.adaptive-report-close').addEventListener('click', () => toast.classList.remove('active'));
        document.body.appendChild(toast);
    }
    toast.querySelector('.adaptive-report-text').textContent = text;
    toast.classList.add('active');
}

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
        let selection = await fetchAdaptiveFromAI(result);
        if (!selection) {
            selection = getFallbackSelection(result);
            applyAdaptive(selection);
            console.log('[adaptive] Fallback uygulandı (AI cevap vermedi)');
        } else {
            applyAdaptive(selection);
            console.log('[adaptive] Uygulandı:', selection);
        }
        showAdaptiveReport(result, selection);
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

function hidePageLoadOverlay() {
    const el = document.getElementById('page-load-overlay');
    if (!el) return;
    el.classList.add('hidden');
    setTimeout(() => { el.remove(); }, 350);
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

function initPageLoad() {
    restoreAdaptiveConfig();
    updateResetButtonVisibility();
    setTimeout(hidePageLoadOverlay, 180);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageLoad);
} else {
    initPageLoad();
}

// Fallback: sayfa tam yüklendiğinde overlay'i kaldır
window.addEventListener('load', () => {
    setTimeout(hidePageLoadOverlay, 50);
});
