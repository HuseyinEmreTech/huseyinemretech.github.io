/* =====================================================
   ADAPTIVE UI - Metin Tonu Varyantları
   Hero metinlerini değiştirir. Dil sistemi ile uyumlu.
   ===================================================== */

let _contentCache = null;
let _activeTone = null;

async function getContent() {
    if (_contentCache) return _contentCache;
    try {
        const res = await fetch(new URL('adaptive-content.json', window.location.href).href);
        _contentCache = await res.json();
        return _contentCache;
    } catch (e) {
        console.warn('[adaptive-tone] JSON yüklenemedi:', e);
        return { hero: {} };
    }
}

/**
 * Belirtilen ton'a göre hero metinlerini günceller
 * @param {string} type - 'technical' | 'story' | 'minimal'
 */
async function loadTone(type) {
    const content = await getContent();
    const heroConfig = content?.hero?.[type];
    if (!heroConfig) {
        console.warn(`[adaptive-tone] Bilinmeyen ton veya eksik içerik: ${type}`);
        return;
    }

    _activeTone = type;

    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const lang = document.documentElement.lang === 'en' ? 'en' : 'tr';
    const data = heroConfig[lang] || heroConfig.tr;

    const titleEl = heroSection.querySelector('h1');
    const descEl = heroSection.querySelector('p');

    if (titleEl && data.title) {
        titleEl.innerHTML = data.title;
    }
    if (descEl && data.description !== undefined) {
        descEl.textContent = data.description;
    }
}

/**
 * Senkron loadTone - önbellek doluysa JSON fetch beklemez
 * @param {string} type - 'technical' | 'story' | 'minimal'
 */
function loadToneSync(type) {
    if (_contentCache) {
        const heroConfig = _contentCache?.hero?.[type];
        if (!heroConfig) return;

        _activeTone = type;
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        const lang = document.documentElement.lang === 'en' ? 'en' : 'tr';
        const data = heroConfig[lang] || heroConfig.tr;

        const titleEl = heroSection.querySelector('h1');
        const descEl = heroSection.querySelector('p');

        if (titleEl && data.title) titleEl.innerHTML = data.title;
        if (descEl && data.description !== undefined) descEl.textContent = data.description;
    } else {
        loadTone(type);
    }
}

// Dil değiştiğinde ton'u yeniden uygula
function initLangObserver() {
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.attributeName === 'lang' && _activeTone) {
                loadToneSync(_activeTone);
                break;
            }
        }
    });
    observer.observe(document.documentElement, { attributes: true });
}

// Sayfa yüklendiğinde observer'ı başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangObserver);
} else {
    initLangObserver();
}

// Konsol testi için global erişim
if (typeof window !== 'undefined') {
    window.loadTone = loadTone;
}
