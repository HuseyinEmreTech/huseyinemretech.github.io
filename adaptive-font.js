/* =====================================================
   ADAPTIVE UI - Font Boyutu (Erişilebilirlik)
   small | medium | large
   ===================================================== */

function loadFontSize(size) {
    const html = document.documentElement;
    html.classList.remove('adaptive-font-small', 'adaptive-font-medium', 'adaptive-font-large');
    if (size && ['small', 'medium', 'large'].includes(size)) {
        html.classList.add('adaptive-font-' + size);
    }
}

if (typeof window !== 'undefined') {
    window.loadFontSize = loadFontSize;
}
