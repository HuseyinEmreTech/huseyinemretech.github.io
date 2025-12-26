/**
 * Cloudflare Worker - HTTP Security Headers
 * 
 * Bu Worker script'i sitenize eksik olan tüm HTTP Security Header'larını ekler.
 * 
 * Kurulum Adımları:
 * 1. Cloudflare Dashboard'a gidin
 * 2. Workers & Pages > Create Application > Create Worker
 * 3. Bu kodu yapıştırın ve Deploy edin
 * 4. Triggers'a gidin ve huseyinemre.tech domain'inizi ekleyin
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    // Orijinal yanıtı al
    const response = await fetch(request)

    // Yeni yanıt oluştur (header'ları değiştirebilmek için)
    const newResponse = new Response(response.body, response)

    // HSTS - HTTP Strict Transport Security
    // 1 yıl (31536000 saniye), tüm subdomain'ler dahil, preload listesi için hazır
    newResponse.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    )

    // X-Frame-Options - Clickjacking koruması
    // SAMEORIGIN: Sadece aynı origin'den frame'lenebilir
    newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')

    // X-Content-Type-Options - MIME type sniffing engelleme
    // nosniff: Tarayıcı content-type'ı tahmin etmesin
    newResponse.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer-Policy - Referrer bilgisi kontrolü
    // strict-origin-when-cross-origin: Güvenli varsayılan
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions-Policy - Browser API'leri kontrolü
    // Kullanılmayan özellikleri devre dışı bırak
    newResponse.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    )

    // Cross-Origin-Resource-Policy - Kaynak izolasyonu
    // same-origin: Sadece aynı origin'den erişim
    // newResponse.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

    // Cross-Origin-Opener-Policy - Pencere izolasyonu
    // same-origin: Popup'lar aynı origin'den olmalı
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

    // Cross-Origin-Embedder-Policy - Kaynak yükleme kontrolü
    // require-corp: CORS/CORP izni gerekli (opsiyonel, sıkı güvenlik için)
    // NOT: CDN kullanıyorsanız bu sorun çıkarabilir, dikkatli kullanın
    // newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

    // Content-Security-Policy - Relaxed to allow CDN and API
    newResponse.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src *; img-src * data:; connect-src 'self' https://api.github.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';"
    )

    return newResponse
}
