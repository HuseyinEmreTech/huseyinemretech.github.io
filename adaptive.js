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
            return { tema: data.tema, layout: data.layout, cta: data.cta, ton: data.ton };
        }
        if (data.fallback) return data.fallback;
        return null;
    } catch (e) {
        console.error('[adaptive] AI hatası:', e);
        return null;
    }
}

window.addEventListener('adaptive-test-complete', async (e) => {
    const result = e.detail;
    const selection = await fetchAdaptiveFromAI(result);
    if (selection) {
        applyAdaptive(selection);
        console.log('[adaptive] Uygulandı:', selection);
    } else {
        applyAdaptive(getFallbackSelection(result));
        console.log('[adaptive] Fallback uygulandı (AI cevap vermedi)');
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
window.fetchAdaptiveFromAI = fetchAdaptiveFromAI;
