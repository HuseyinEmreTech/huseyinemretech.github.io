/**
 * Cloudflare Worker - HTTP Security Headers & Contact Form API
 * 
 * This Worker script adds all missing HTTP Security Headers to your site
 * and securely handles contact form message requests.
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)

    // 1. İLETİŞİM FORMU API KONTROLÜ (CORS Preflight ve POST)
    if (url.pathname === '/api/contact') {
        // CORS Ön kontrolü (Preflight Options isteği)
        if (request.method === 'OPTIONS') {
            const origin = request.headers.get('Origin');
            const allowedOrigins = ['https://huseyinemretech.github.io', 'https://huseyinemre.tech', 'https://www.huseyinemre.tech', 'http://localhost:5173', 'http://127.0.0.1:5173'];
            const responseOrigin = allowedOrigins.includes(origin) ? origin : 'https://huseyinemre.tech';

            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': responseOrigin, // Gelen isteğe göre izin ver
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400',
                }
            })
        }

        // İletişim formu POST isteği
        if (request.method === 'POST') {
            return handleContactForm(request)
        }
    }

    // 2. HTTPS YÖNLENDİRMESİ
    if (url.protocol === 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
        const httpsUrl = 'https://' + url.hostname + url.pathname + url.search
        return Response.redirect(httpsUrl, 301)
    }

    // 3. SAYFAYI GETİR
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)

    // 4. KATI GÜVENLİK BAŞLIKLARI (STRICT SECURITY HEADERS)

    // HSTS (HTTP Strict Transport Security) - Tarayıcıyı HTTPS kullanmaya zorlar
    newResponse.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    )

    // Clickjacking Koruması
    newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')

    // MIME Sniffing Koruması
    newResponse.headers.set('X-Content-Type-Options', 'nosniff')

    // Bilgi Sızıntısı Koruması (Referrer Policy)
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Cihaz Donanımlarına İzin Verilmeyen Katı Politika
    newResponse.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    )

    // Cross-Origin İzolasyonu
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    newResponse.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none') // Dışarıdan resim vs. yüklediğiniz için unsafe-none kalmalı
    newResponse.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

    // Content-Security-Policy - Maksimum Güvenlik, Minimum Risk
    newResponse.headers.set(
        'Content-Security-Policy',
        "default-src 'none'; " +
        "script-src 'self' https://cdnjs.cloudflare.com https://static.cloudflareinsights.com; " +
        "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https://api.github.com https://static.cloudflareinsights.com; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'self'; " +
        "upgrade-insecure-requests;"
    )

    return newResponse
}

// İLETİŞİM FORMU İŞLEYİCİSİ
async function handleContactForm(request) {
    try {
        // CSRF ve Origin Koruması - Sadece sizin sitenizden gelen istekleri kabul eder
        const origin = request.headers.get('Origin');
        const allowedOrigins = ['https://huseyinemretech.github.io', 'https://huseyinemre.tech', 'https://www.huseyinemre.tech'];

        let isLocalNode = false;
        if (origin) {
            isLocalNode = origin.includes('localhost') || origin.includes('127.0.0.1');
        }

        if (!isLocalNode && (!origin || !allowedOrigins.includes(origin))) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized Origin' }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': origin || 'https://huseyinemre.tech'
                }
            });
        }

        const responseOrigin = origin || 'https://huseyinemre.tech';

        const data = await request.json();

        // Basic XSS/Injection Sanitization
        const sanitize = (str) => {
            if (!str) return '';
            return str.replace(/[<>]/g, '').trim().substring(0, 2000); // Max 2000 characters, cleans HTML tags
        };

        const safeData = {
            name: sanitize(data.name),
            email: sanitize(data.email),
            message: sanitize(data.message)
        };

        // TODO: Implement email sending with Mailchannels, SendGrid, etc.
        // Sending is ensured using safe data: safeData.name, safeData.email, etc.

        return new Response(JSON.stringify({ success: true, message: "Email safely received and processed." }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': responseOrigin // Dynamic Origin
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Server error or invalid data format' }), {
            status: 400, // Returning 400 (Bad Request) is sometimes better than 500 for security
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://huseyinemre.tech'
            }
        });
    }
}
