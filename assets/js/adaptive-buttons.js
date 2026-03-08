/* =====================================================
   ADAPTIVE UI - Buton Stili (border-radius)
   rounded | square | pill
   ===================================================== */

function loadButtonStyle(style) {
    const body = document.body;
    body.classList.remove('adaptive-btn-rounded', 'adaptive-btn-square', 'adaptive-btn-pill');
    if (style && ['rounded', 'square', 'pill'].includes(style)) {
        body.classList.add('adaptive-btn-' + style);
    }
}

if (typeof window !== 'undefined') {
    window.loadButtonStyle = loadButtonStyle;
}
