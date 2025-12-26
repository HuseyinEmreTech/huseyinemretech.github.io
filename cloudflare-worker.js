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
    const url = new URL(request.url)

    // Force HTTPS redirect (301 Moved Permanently)
    // Ensures same-host redirect as requested by security scanners
    if (url.protocol === 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
        const httpsUrl = 'https://' + url.hostname + url.pathname + url.search
        return Response.redirect(httpsUrl, 301)
    }

    // Orijinal yanıtı al
    const response = await fetch(request)

    // Yeni yanıt oluştur (header'ları değiştirebilmek için)
    const newResponse = new Response(response.body, response)

    // HSTS - HTTP Strict Transport Security
    newResponse.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    )

    // X-Frame-Options
    newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')

    // X-Content-Type-Options
    newResponse.headers.set('X-Content-Type-Options', 'nosniff')

    // Referrer-Policy
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions-Policy
    newResponse.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    )

    // Cross-Origin-Opener-Policy
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

    // Content-Security-Policy - A+ (No unsafe-inline)
    newResponse.headers.set(
        'Content-Security-Policy',
        "default-src 'none'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests;"
    )

    return newResponse
}
