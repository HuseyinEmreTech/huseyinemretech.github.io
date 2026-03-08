/* =====================================================
   ADAPTIVE UI - Spacing (yoğunluk)
   compact | comfortable | spacious
   ===================================================== */

function loadSpacing(level) {
    const body = document.body;
    body.classList.remove('adaptive-spacing-compact', 'adaptive-spacing-comfortable', 'adaptive-spacing-spacious');
    if (level && ['compact', 'comfortable', 'spacious'].includes(level)) {
        body.classList.add('adaptive-spacing-' + level);
    }
}

if (typeof window !== 'undefined') {
    window.loadSpacing = loadSpacing;
}
