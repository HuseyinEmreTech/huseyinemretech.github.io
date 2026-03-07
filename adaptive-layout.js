/* =====================================================
   ADAPTIVE UI - Layout Varyantları
   Section sırasını değiştirir. Hiçbir section silinmez.
   ===================================================== */

const layouts = {
    technical: ['about', 'projects', 'skills', 'experience', 'education', 'contact'],
    business: ['about', 'experience', 'education', 'skills', 'projects', 'contact'],
    creative: ['about', 'projects', 'experience', 'education', 'skills', 'contact']
};

/**
 * Belirtilen layout tipine göre section sırasını günceller
 * @param {string} type - 'technical' | 'business' | 'creative'
 */
function loadLayout(type) {
    const order = layouts[type];
    if (!order) {
        console.warn(`[adaptive-layout] Bilinmeyen layout: ${type}`);
        return;
    }

    const footer = document.querySelector('footer');
    if (!footer) return;

    let refNode = footer;
    for (let i = order.length - 1; i >= 0; i--) {
        const sectionId = order[i];
        const section = document.getElementById(sectionId);
        if (section) {
            document.body.insertBefore(section, refNode);
            refNode = section;
        }
    }
}

// Konsol testi için global erişim
if (typeof window !== 'undefined') {
    window.loadLayout = loadLayout;
}
