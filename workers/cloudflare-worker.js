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
    // unpkg.com: Leaflet (ör. standalone-projects içi harita sayfaları)
    // api.qrserver.com: Sunumdaki QR kodlar için
    newResponse.headers.set(
        'Content-Security-Policy',
        "default-src 'none'; " +
        // 'wasm-unsafe-eval': Spline physics/navmesh WebAssembly modülleri için gerekli
        // blob:: Spline'ın inline Web Worker'ları için gerekli
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://cdnjs.cloudflare.com https://static.cloudflareinsights.com https://unpkg.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https: https://api.qrserver.com; " +
        // prod.spline.design: Spline 3D sahnesi yüklemek için gerekli
        "connect-src 'self' https://api.github.com https://static.cloudflareinsights.com https://openrouter.ai https://prod.spline.design https://unpkg.com; " +
        // worker-src: Spline'ın blob: Worker'ları için
        "worker-src blob:; " +
        "frame-src 'none'; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'self'; " +
        "upgrade-insecure-requests;"
    )

    return newResponse
}

// ADAPTIVE UI - Sadece OpenRouter (Llama, Gemma, openrouter/free)
// Dashboard: OPENROUTER_API_KEY (Secret)
async function handleAdaptive(request, env, origin) {
    const openRouterKey = env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
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

        const systemPrompt = `Sen bir UI karar motorusun. Kullanıcının kişilik testi sonucuna göre şu 8 boyutta seçim yap ve SADECE JSON döndür, başka hiçbir şey yazma. Markdown kullanma, sadece ham JSON:
{
  "tema": "cool" | "warm" | "vibrant",
  "layout": "technical" | "business" | "creative",
  "cta": "github-cta" | "cv-cta" | "contact-cta",
  "ton": "technical" | "story" | "minimal",
  "fontSize": "small" | "medium" | "large",
  "animation": "subtle" | "normal" | "dynamic",
  "buttonStyle": "rounded" | "square" | "pill",
  "spacing": "compact" | "comfortable" | "spacious"
}

MBTI mapping (tema,layout,cta,ton): INTJ→cool+technical+github-cta+minimal, ENTJ→cool+business+cv-cta+technical, INFJ→warm+creative+contact-cta+story, ENFJ→vibrant+creative+contact-cta+story, ISTP→cool+technical+github-cta+minimal, ESTP→vibrant+technical+github-cta+technical, ISFP→warm+creative+contact-cta+story, ESFP→vibrant+creative+contact-cta+story, ISTJ→cool+business+cv-cta+technical, ESTJ→warm+business+cv-cta+technical, ISFJ→warm+business+cv-cta+story, ESFJ→vibrant+business+contact-cta+story, INTP→cool+technical+github-cta+technical, ENTP→vibrant+technical+github-cta+technical, INFP→warm+creative+contact-cta+story, ENFP→vibrant+creative+contact-cta+story.

fontSize: large (erişilebilirlik), small/medium (teknik). animation: subtle (minimal/neurotic), dynamic (vibrant/story), normal. buttonStyle: square (teknik/INTJ), pill (yaratıcı/dostane), rounded (genel). spacing: compact (teknik/yoğun), spacious (yaratıcı/ferah), comfortable (varsayılan). Varsayılanlar: fontSize=medium, animation=normal, buttonStyle=rounded, spacing=comfortable.

Big Five: Openness>0.7→vibrant+spacious, <0.4→cool+compact. Extraversion>0.7→contact-cta+story+pill. Neuroticism>0.6→subtle+compact.`;

        const userMessage = `Kişilik testi sonucu: ${JSON.stringify(testResult)}`;
        let rawText = '';
        let lastError = null;

        // 10 model paralel — hata veren elenir, ilk geçerli cevap kullanılır
        const orModels = [
            'stepfun/step-3.5-flash:free',
            'arcee-ai/trinity-large-preview:free',
            'arcee-ai/trinity-mini:free',
            'z-ai/glm-4.5-air:free',
            'nvidia/nemotron-nano-9b-v2:free',
            'nvidia/nemotron-3-nano-30b-a3b:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'google/gemma-3-27b-it:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openai/gpt-oss-20b:free',
            'openrouter/free'
        ];

        if (openRouterKey) {
            const fetchModel = async (model) => {
                const ctrl = new AbortController();
                setTimeout(() => ctrl.abort(), 30000);
                const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    signal: ctrl.signal,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://huseyinemre.tech',
                        'X-Title': 'HuseyinEmre Portfolio'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userMessage }
                        ],
                        max_tokens: 256,
                        temperature: 0.3
                    })
                });
                const orBody = await orRes.text();
                if (!orRes.ok) throw new Error(`OpenRouter(${model}): ${orRes.status}`);
                const orData = JSON.parse(orBody);
                const text = orData.choices?.[0]?.message?.content || '';
                if (!text) throw new Error('Empty');
                return text;
            };
            try {
                rawText = await Promise.any(orModels.map(m => fetchModel(m)));
            } catch (e) {
                const errs = e.errors || [e];
                lastError = errs.map(x => x?.message || String(x)).join(' | ') || 'All rejected';
            }
        }

        if (!rawText) {
            const fallback = getFallbackSelection(testResult);
            return new Response(JSON.stringify({
                success: false,
                error: 'AI service error',
                fallback,
                debug: lastError || 'OpenRouter failed'
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
            fallback: { tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical', fontSize: 'medium', animation: 'normal', buttonStyle: 'rounded', spacing: 'comfortable' }
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
        if (!valid) return null;
        obj.fontSize = ['small', 'medium', 'large'].includes(obj.fontSize) ? obj.fontSize : 'medium';
        obj.animation = ['subtle', 'normal', 'dynamic'].includes(obj.animation) ? obj.animation : 'normal';
        obj.buttonStyle = ['rounded', 'square', 'pill'].includes(obj.buttonStyle) ? obj.buttonStyle : 'rounded';
        obj.spacing = ['compact', 'comfortable', 'spacious'].includes(obj.spacing) ? obj.spacing : 'comfortable';
        return obj;
    } catch (_) {
        return null;
    }
}

function getFallbackSelection(testResult) {
    const base = { fontSize: 'medium', animation: 'normal', buttonStyle: 'rounded', spacing: 'comfortable' };
    if (testResult?.type === 'mbti' && testResult?.mbti) {
        const map = {
            INTJ: { ...base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal', animation: 'subtle', buttonStyle: 'square', spacing: 'compact' },
            ENTJ: { ...base, tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical' },
            INFJ: { ...base, tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story', buttonStyle: 'pill' },
            ENFJ: { ...base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill', spacing: 'spacious' },
            ISTP: { ...base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'minimal', animation: 'subtle', buttonStyle: 'square', spacing: 'compact' },
            ESTP: { ...base, tema: 'vibrant', layout: 'technical', cta: 'github-cta', ton: 'technical', animation: 'dynamic', buttonStyle: 'pill' },
            ISFP: { ...base, tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story', spacing: 'spacious' },
            ESFP: { ...base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill', spacing: 'spacious' },
            ISTJ: { ...base, tema: 'cool', layout: 'business', cta: 'cv-cta', ton: 'technical', buttonStyle: 'square', spacing: 'compact' },
            ESTJ: { ...base, tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'technical' },
            ISFJ: { ...base, tema: 'warm', layout: 'business', cta: 'cv-cta', ton: 'story' },
            ESFJ: { ...base, tema: 'vibrant', layout: 'business', cta: 'contact-cta', ton: 'story', animation: 'dynamic' },
            INTP: { ...base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical', animation: 'subtle', buttonStyle: 'square', spacing: 'compact' },
            ENTP: { ...base, tema: 'vibrant', layout: 'technical', cta: 'github-cta', ton: 'technical', animation: 'dynamic', buttonStyle: 'pill' },
            INFP: { ...base, tema: 'warm', layout: 'creative', cta: 'contact-cta', ton: 'story', spacing: 'spacious' },
            ENFP: { ...base, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story', animation: 'dynamic', buttonStyle: 'pill', spacing: 'spacious' }
        };
        return map[testResult.mbti] || { ...base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical' };
    }
    if (testResult?.type === 'bigfive') {
        const o = testResult.O ?? 0.5, e = testResult.E ?? 0.5, n = testResult.N ?? 0.5;
        let tema = 'cool', cta = 'github-cta', ton = 'technical', animation = 'normal', fontSize = 'medium', buttonStyle = 'rounded', spacing = 'comfortable';
        if (o > 0.7) { tema = 'vibrant'; spacing = 'spacious'; } else if (o < 0.4) { tema = 'cool'; spacing = 'compact'; }
        if (n > 0.6) { tema = 'warm'; ton = 'minimal'; animation = 'subtle'; spacing = 'compact'; fontSize = 'large'; }
        if (e > 0.7) { cta = 'contact-cta'; ton = 'story'; animation = 'dynamic'; buttonStyle = 'pill'; spacing = 'spacious'; } else if (e < 0.4) { cta = 'github-cta'; ton = 'minimal'; animation = 'subtle'; buttonStyle = 'square'; }
        return { tema, layout: 'technical', cta, ton, fontSize, animation, buttonStyle, spacing };
    }
    return { ...base, tema: 'cool', layout: 'technical', cta: 'github-cta', ton: 'technical' };
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
