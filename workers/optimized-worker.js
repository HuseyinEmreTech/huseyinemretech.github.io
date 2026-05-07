/**
 * Cloudflare Worker - Maliyet Optimize Edilmiş Versiyon
 *
 * Optimizasyonlar:
 * - OpenRouter cache sistemi
 * - Tek model kullanımı
 * - Rate limiting
 * - Response caching
 */

const CACHE_TTL = 86400; // 24 saat
const RATE_LIMIT = 100; // Günlük request limit per IP

// Worker KV binding: ADAPTIVE_CACHE, RATE_LIMITS
export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env, ctx);
    }
};

async function handleRequest(request, env, ctx) {
    const url = new URL(request.url);
    const clientIP = request.headers.get('CF-Connecting-IP');

    // Rate limiting check
    if (await isRateLimited(clientIP, env)) {
        return new Response('Rate limited', { status: 429 });
    }

    // Cache static headers
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
        return handleStaticWithCache(request, env, ctx);
    }

    // API routes
    if (url.pathname === '/api/adaptive') {
        return handleAdaptiveOptimized(request, env, clientIP);
    }

    if (url.pathname === '/api/contact') {
        return handleContactOptimized(request, env, clientIP);
    }

    return fetch(request);
}

async function handleAdaptiveOptimized(request, env, clientIP) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const testResult = await request.json();
        const cacheKey = `adaptive:${JSON.stringify(testResult)}`;

        // Cache'den kontrol et
        const cached = await env.ADAPTIVE_CACHE?.get(cacheKey);
        if (cached) {
            await incrementRateLimit(clientIP, env);
            return new Response(cached, {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fallback-first approach (AI'sız)
        let selection = getFallbackSelection(testResult);

        // OpenRouter sadece gerekli durumlarda
        if (shouldUseAI(testResult)) {
            const aiSelection = await getAISelectionOptimized(testResult, env);
            if (aiSelection) selection = aiSelection;
        }

        const response = JSON.stringify({ success: true, ...selection });

        // Cache'le
        await env.ADAPTIVE_CACHE?.put(cacheKey, response, { expirationTtl: CACHE_TTL });
        await incrementRateLimit(clientIP, env);

        return new Response(response, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        const fallback = getFallbackSelection({});
        return new Response(JSON.stringify({
            success: false,
            fallback,
            error: 'AI service unavailable'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getAISelectionOptimized(testResult, env) {
    const openRouterKey = env.OPENROUTER_API_KEY;
    if (!openRouterKey) return null;

    // Tek model, hızlı timeout
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s max

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            signal: controller.signal,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'stepfun/step-3.5-flash:free',
                messages: [
                    { role: 'system', content: getSystemPrompt() },
                    { role: 'user', content: `Test: ${JSON.stringify(testResult)}` }
                ],
                max_tokens: 150,
                temperature: 0.1
            })
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error('API failed');

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        return parseJsonFromText(content);

    } catch (error) {
        console.error('OpenRouter error:', error);
        return null;
    }
}

function shouldUseAI(testResult) {
    // AI sadece belirsiz durumlarda
    if (testResult?.type === 'mbti' && testResult?.mbti) {
        const knownTypes = ['INTJ', 'ENTJ', 'INFJ', 'ENFJ', 'ISTP', 'ESTP'];
        return !knownTypes.includes(testResult.mbti);
    }
    return false; // Big Five için fallback yeterli
}

async function isRateLimited(ip, env) {
    if (!env.RATE_LIMITS) return false;

    const key = `rate:${ip}:${Math.floor(Date.now() / 86400000)}`;
    const current = parseInt(await env.RATE_LIMITS.get(key) || '0');

    return current >= RATE_LIMIT;
}

async function incrementRateLimit(ip, env) {
    if (!env.RATE_LIMITS) return;

    const key = `rate:${ip}:${Math.floor(Date.now() / 86400000)}`;
    const current = parseInt(await env.RATE_LIMITS.get(key) || '0');

    await env.RATE_LIMITS.put(key, (current + 1).toString(), { expirationTtl: 86400 });
}

async function handleStaticWithCache(request, env, ctx) {
    // Edge cache for static content with headers
    const cache = caches.default;
    const cacheKey = new Request(request.url);

    let response = await cache.match(cacheKey);

    if (!response) {
        response = await fetch(request);

        // Add security headers
        const newResponse = new Response(response.body, response);
        addSecurityHeaders(newResponse);

        // Cache for 1 hour
        newResponse.headers.set('Cache-Control', 'public, max-age=3600');

        ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));
        return newResponse;
    }

    return response;
}

function addSecurityHeaders(response) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Minimal CSP for cost optimization
    response.headers.set('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://static.cloudflareinsights.com https://prod.spline.design; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https:; " +
        "connect-src 'self' https://api.github.com https://static.cloudflareinsights.com https://prod.spline.design;"
    );
}

function getSystemPrompt() {
    return `You are a UI selector. Return only JSON: {"tema":"cool"|"warm"|"vibrant","layout":"technical"|"business"|"creative","cta":"github-cta"|"cv-cta"|"contact-cta","ton":"technical"|"story"|"minimal"}`;
}

function parseJsonFromText(text) {
    if (!text) return null;
    try {
        const match = text.match(/\{[^}]*\}/);
        if (!match) return null;
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
}

function getFallbackSelection(testResult) {
    // Simplified fallback logic
    const defaults = {
        tema: 'cool',
        layout: 'technical',
        cta: 'github-cta',
        ton: 'technical',
        fontSize: 'medium',
        animation: 'normal',
        buttonStyle: 'rounded',
        spacing: 'comfortable'
    };

    if (testResult?.mbti === 'INTJ') {
        return { ...defaults, animation: 'subtle', buttonStyle: 'square', spacing: 'compact' };
    }

    if (testResult?.mbti === 'ENFJ') {
        return { ...defaults, tema: 'vibrant', layout: 'creative', cta: 'contact-cta', ton: 'story' };
    }

    return defaults;
}

async function handleContactOptimized(request, env, clientIP) {
    // Rate limit: max 5 emails per day per IP
    const emailKey = `email:${clientIP}:${Math.floor(Date.now() / 86400000)}`;
    const emailCount = parseInt(await env.RATE_LIMITS?.get(emailKey) || '0');

    if (emailCount >= 5) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Daily email limit reached'
        }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const data = await request.json();

    // Simple validation
    if (!data.name || !data.email || !data.message) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Missing required fields'
        }), { status: 400 });
    }

    // Send email via Resend
    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Email service unavailable'
        }), { status: 503 });
    }

    try {
        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Portfolio Contact <onboarding@resend.dev>',
                to: ['huseyinemre.tech@gmail.com'],
                reply_to: data.email,
                subject: `Portfolio Contact: ${data.name}`,
                text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
            }),
        });

        if (!emailRes.ok) throw new Error('Email failed');

        // Increment email counter
        await env.RATE_LIMITS?.put(emailKey, (emailCount + 1).toString(), { expirationTtl: 86400 });

        return new Response(JSON.stringify({
            success: true,
            message: 'Email sent successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to send email'
        }), { status: 500 });
    }
}