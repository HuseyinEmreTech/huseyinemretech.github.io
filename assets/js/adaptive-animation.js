/* =====================================================
   ADAPTIVE UI - Animasyon Yoğunluğu
   subtle | normal | dynamic
   ===================================================== */

function loadAnimation(level) {
    const body = document.body;
    body.classList.remove('adaptive-anim-subtle', 'adaptive-anim-normal', 'adaptive-anim-dynamic');
    if (level && ['subtle', 'normal', 'dynamic'].includes(level)) {
        body.classList.add('adaptive-anim-' + level);
    }
}

if (typeof window !== 'undefined') {
    window.loadAnimation = loadAnimation;
}
