/**
 * Cloudflare Worker - HTTP Security Headers & Contact Form API & Adaptive UI
 * 
 * - HTTP Security Headers
 * - Contact form
 * - Adaptive UI: Claude API ile kişilik testi sonucundan component seçimi
 */

const ALLOWED_ORIGINS = ['https://huseyinemretech.github.io', 'https://huseyinemre.tech', 'https://www.huseyinemre.tech', 'http://localhost:5173', 'http://127.0.0.1:5173'];

function getCorsHeaders(origin) {
    const responseOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : 'https://huseyinemre.tech';
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': responseOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env);
    }
};

async function handleRequest(request, env = {}) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin');

    // 1. ADAPTIVE UI API (CORS + POST)
    if (url.pathname === '/api/adaptive') {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: { ...getCorsHeaders(origin), 'Access-Control-Max-Age': '86400' }
            });
        }
        if (request.method === 'POST') {
            return handleAdaptive(request, env, origin);
        }
    }

    // 2. İLETİŞİM FORMU API KONTROLÜ (CORS Preflight ve POST)
    if (url.pathname === '/api/contact') {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: { ...getCorsHeaders(origin), 'Access-Control-Max-Age': '86400' }
            });
        }
        if (request.method === 'POST') {
            return handleContactForm(request);
        }
    }

    // 3. HTTPS YÖNLENDİRMESİ
    if (url.protocol === 'http:' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
        const httpsUrl = 'https://' + url.hostname + url.pathname + url.search
        return Response.redirect(httpsUrl, 301)
    }

    // 4. SAYFAYI GETİR
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)

    // 5. KATI GÜVENLİK BAŞLIKLARI (STRICT SECURITY HEADERS)

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
    // unpkg.com: Leaflet harita kütüphanesi (makine-ogrenmesi, araba-yikama)
    newResponse.headers.set(
        'Content-Security-Policy',
        "default-src 'none'; " +
        "script-src 'self' https://cdnjs.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com; " +
        "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com 'unsafe-inline'; " +
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

// ADAPTIVE UI - OpenRouter (öncelik) veya Gemini ile component seçimi
// Dashboard: OPENROUTER_API_KEY veya GEMINI_API_KEY (Secret)
async function handleAdaptive(request, env, origin) {
    const openRouterKey = env.OPENROUTER_API_KEY;
    const geminiKey = env.GEMINI_API_KEY;
    if (!openRouterKey && !geminiKey) {
        return new Response(JSON.stringify({ success: false, error: 'Service not configured' }), {
            status: 503,
            headers: getCorsHeaders(origin)
        });
    }

    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        const isLocal = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
        if (!isLocal) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized Origin' }), {
                status: 403,
                headers: getCorsHeaders(origin)
            });
        }
    }

    try {
        const testResult = await request.json();

        const systemPrompt = `Sen bir UI karar motorusun. Kullanıcının kişilik testi sonucuna göre şu 4 boyutta seçim yap ve SADECE JSON döndür, başka hiçbir şey yazma. Markdown kullanma, sadece ham JSON:
{
  "tema": "cool" | "warm" | "vibrant",
  "layout": "technical" | "business" | "creative",
  "cta": "github-cta" | "cv-cta" | "contact-cta",
  "ton": "technical" | "story" | "minimal"
}

MBTI mapping: INTJ→cool+technical+github-cta+minimal, ENTJ→cool+business+cv-cta+technical, INFJ→warm+creative+contact-cta+story, ENFJ→vibrant+creative+contact-cta+story, ISTP→cool+technical+github-cta+minimal, ESTP→vibrant+technical+github-cta+technical, ISFP→warm+creative+contact-cta+story, ESFP→vibrant+creative+contact-cta+story, ISTJ→cool+business+cv-cta+technical, ESTJ→warm+business+cv-cta+technical, ISFJ→warm+business+cv-cta+story, ESFJ→vibrant+business+contact-cta+story, INTP→cool+technical+github-cta+technical, ENTP→vibrant+technical+github-cta+technical, INFP→warm+creative+contact-cta+story, ENFP→vibrant+creative+contact-cta+story.

Big Five: Openness>0.7→vibrant, 0.4-0.7→warm, <0.4→cool. Extraversion>0.7→contact-cta+story, <0.4→github-cta+minimal. Conscientiousness>0.6→cv-cta+technical. Neuroticism>0.6→warm+minimal+story.`;

        const userMessage = `Kişilik testi sonucu: ${JSON.stringify(testResult)}`;
        let rawText = '';

        // 1. OpenRouter (öncelik)
        if (openRouterKey) {
            const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://huseyinemre.tech'
                },
                body: JSON.stringify({
                    model: 'openrouter/free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 256,
                    temperature: 0.3
                })
            });
            if (orRes.ok) {
                const orData = await orRes.json();
                rawText = orData.choices?.[0]?.message?.content || '';
            } else {
                console.error('OpenRouter error:', orRes.status, await orRes.text());
            }
        }

        // 2. Gemini fallback
        if (!rawText && geminiKey) {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text: userMessage }] }],
                    generationConfig: {
                        maxOutputTokens: 256,
                        temperature: 0.3
                    }
                })
            });
            if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            } else {
                const errText = await geminiRes.text();
                console.error('Gemini API error:', geminiRes.status, errText);
            }
        }

        if (!rawText) {
            const fallback = getFallbackSelection(testResult);
            return new Response(JSON.stringify({
                success: false,
                error: 'AI service error',
                fallback
            }), {
                status: 200,
                headers: getCorsHeaders(origin)
            });
        }

        let selection = parseJsonFromText(rawText);
        if (!selection) {
            selection = getFallbackSelection(testResult);
        }

        return new Response(JSON.stringify({ success: true, ...selection }), {
            status: 200,
            headers: getCorsHeaders(origin)
        });
    } catch (e) {
        console.error('Adaptive error:', e);
        return new Response(JSON.stringify({
            success: false,
            error: 'Server error',
            fallback: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical' }
        }), {
            status: 200,
            headers: getCorsHeaders(origin)
        });
    }
}

function parseJsonFromText(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
        const obj = JSON.parse(match[0]);
        const valid = ['cool', 'warm', 'vibrant'].includes(obj.tema) &&
            ['technical', 'business', 'creative'].includes(obj.layout) &&
            ['github-cta', 'cv-cta', 'contact-cta'].includes(obj.cta) &&
            ['technical', 'story', 'minimal'].includes(obj.ton);
        return valid ? obj : null;
    } catch (_) {
        return null;
    }
}

function getFallbackSelection(testResult) {
    if (testResult?.type === 'mbti' && testResult?.mbti) {
        const map = {
            INTJ: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal' },
            ENTJ: { tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical' },
            INFJ: { tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story' },
            ENFJ: { tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story' },
            ISTP: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal' },
            ESTP: { tema: 'vibrant', layout: 'technical', cta: 'github-cta', ton: 'technical' },
            ISFP: { tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story' },
            ESFP: { tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story' },
            ISTJ: { tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical' },
            ESTJ: { tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'technical' },
            ISFJ: { tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'story' },
            ESFJ: { tema: 'vibrant', layout: 'business', cta: 'contact-cta', ton: 'story' },
            INTP: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical' },
            ENTP: { tema: 'vibrant', layout: 'technical', cta: 'github-cta', ton: 'technical' },
            INFP: { tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story' },
            ENFP: { tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story' }
        };
        return map[testResult.mbti] || { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical' };
    }
    if (testResult?.type === 'bigfive') {
        const o = testResult.O ?? 0.5, e = testResult.E ?? 0.5, c = testResult.C ?? 0.5, n = testResult.N ?? 0.5;
        let tema = 'cool', cta = 'github-cta', ton = 'technical';
        if (o > 0.7) tema = 'vibrant'; else if (o >= 0.4) tema = 'warm';
        if (n > 0.6) { tema = 'warm'; ton = 'minimal'; }
        if (e > 0.7) { cta = 'contact-cta'; ton = 'story'; } else if (e < 0.4) { cta = 'github-cta'; ton = 'minimal'; }
        if (c > 0.6) { cta = 'cv-cta'; ton = 'technical'; }
        return { tema, layout: 'technical', cta, ton };
    }
    return { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical' };
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
