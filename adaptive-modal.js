/* =====================================================
   ADAPTIVE UI - Test Modal
   MBTI (16 soru) ve Big Five (10 soru) kişilik testleri
   ===================================================== */

const MBTI_QUESTIONS = {
    tr: [
        { dim: 'EI', a: 'E', b: 'I', text: 'Boş zamanında ne yaparsın?' },
        { dim: 'EI', a: 'E', b: 'I', text: 'Yeni ortamda nasılsın?' },
        { dim: 'EI', a: 'E', b: 'I', text: 'Toplantı sonrası?' },
        { dim: 'EI', a: 'E', b: 'I', text: 'Çalışma şeklin?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'Problemi nasıl çözersin?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'Odağın nerede?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'İş ortamın nasıl olsun?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'Kitapta seni ne çeker?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'Zor kararı nasıl verirsin?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'Eleştiri alınca?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'Tartışmada önceliğin?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'Yardım ederken?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'Planlamayı sever misin?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'Projeyi nasıl bitirirsin?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'Masanı nasıl tutarsın?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'Tatilde ne yaparsın?' }
    ],
    en: [
        { dim: 'EI', a: 'E', b: 'I', text: 'What do you do in your free time?' },
        { dim: 'EI', a: 'E', b: 'I', text: 'How are you in new environments?' },
        { dim: 'EI', a: 'E', b: 'I', text: 'After a meeting?' },
        { dim: 'EI', a: 'E', b: 'I', text: 'Your way of working?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'How do you solve problems?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'Where is your focus?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'What kind of work environment do you prefer?' },
        { dim: 'SN', a: 'S', b: 'N', text: 'What draws you in a book?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'How do you make tough decisions?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'When you receive criticism?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'Your priority in a debate?' },
        { dim: 'TF', a: 'T', b: 'F', text: 'When helping someone?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'Do you like planning?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'How do you finish projects?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'How do you keep your desk?' },
        { dim: 'JP', a: 'J', b: 'P', text: 'What do you do on vacation?' }
    ]
};

const MBTI_OPTIONS = {
    tr: [
        ['Dışarı çıkarım', 'Evde kalırım'], ['Hemen kaynaşırım', 'Önce gözlemlerim'],
        ['Enerjik hissederim', 'Yorgun hissederim'], ['Ekiple birlikte', 'Yalnız başıma'],
        ['Deneyimle', 'Sezgiyle'], ['Detaylarda', 'Büyük resimde'],
        ['Rutinli', 'Değişken'], ['Gerçek olaylar', 'Hayal gücü'],
        ['Mantıkla', 'Hisle'], ['Nesnel değerlendiririm', 'İçime alırım'],
        ['Haklı olmak', 'Uzlaşmak'], ['Pratik çözüm', 'Duygusal destek'],
        ['Evet severim', 'Hayır sevmem'], ['Erkenden teslim ederim', 'Son dakikada'],
        ['Düzenli', 'Kaotik ama bilirim'], ['Her şeyi planlarım', 'Spontane giderim']
    ],
    en: [
        ['Go out', 'Stay home'], ['Blend in quickly', 'Observe first'],
        ['Feel energetic', 'Feel tired'], ['With a team', 'Alone'],
        ['By experience', 'By intuition'], ['Details', 'Big picture'],
        ['Routine', 'Varied'], ['Real events', 'Imagination'],
        ['With logic', 'With feeling'], ['Evaluate objectively', 'Take it to heart'],
        ['Being right', 'Compromise'], ['Practical solution', 'Emotional support'],
        ['Yes I like it', "No I don't"], ['Submit early', 'Last minute'],
        ['Organized', 'Chaotic but I know where things are'], ['Plan everything', 'Go spontaneous']
    ]
};

const BIGFIVE_QUESTIONS = {
    tr: [
        { dim: 'O', text: 'Yeni fikirlere ve deneyimlere açığım' },
        { dim: 'O', text: 'Sanatsal ve yaratıcı şeylerden zevk alırım' },
        { dim: 'C', text: 'İşlerimi düzenli ve planlı yaparım' },
        { dim: 'C', text: 'Sorumluluklarımı zamanında yerine getiririm' },
        { dim: 'E', text: 'Sosyal ortamlarda kendimi rahat hissederim' },
        { dim: 'E', text: 'İnsanlarla vakit geçirmeyi severim' },
        { dim: 'A', text: 'Başkalarına yardım etmekten mutluluk duyarım' },
        { dim: 'A', text: 'İnsanlara güvenirim ve iyi niyetli davranırım' },
        { dim: 'N', text: 'Stres altında kaygılanırım' },
        { dim: 'N', text: 'Ruh halim sık sık değişir' }
    ],
    en: [
        { dim: 'O', text: 'I am open to new ideas and experiences' },
        { dim: 'O', text: 'I enjoy artistic and creative things' },
        { dim: 'C', text: 'I do my work in an organized and planned way' },
        { dim: 'C', text: 'I fulfill my responsibilities on time' },
        { dim: 'E', text: 'I feel comfortable in social situations' },
        { dim: 'E', text: 'I enjoy spending time with people' },
        { dim: 'A', text: 'I find happiness in helping others' },
        { dim: 'A', text: 'I trust people and act in good faith' },
        { dim: 'N', text: 'I get anxious under stress' },
        { dim: 'N', text: 'My mood changes frequently' }
    ]
};

const MODAL_TEXTS = {
    tr: {
        floatBtn: '✨ Kişisel',
        title: 'Sizi Tanıyalım',
        mbtiOption: 'MBTI Testi',
        mbtiMeta: '~2 dakika',
        bigfiveOption: 'Big Five Testi',
        bigfiveMeta: '~1 dakika',
        next: 'İleri',
        prev: 'Geri',
        finish: 'Sonuçları Gör'
    },
    en: {
        floatBtn: '✨ Personal',
        title: "Let's Get to Know You",
        mbtiOption: 'MBTI Test',
        mbtiMeta: '~2 min',
        bigfiveOption: 'Big Five Test',
        bigfiveMeta: '~1 min',
        next: 'Next',
        prev: 'Back',
        finish: 'See Results'
    }
};

let modalState = { testType: null, step: 0, answers: [], onComplete: null };

function getLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'tr';
}

function t(key) {
    return MODAL_TEXTS[getLang()][key] || key;
}

function createFloatButton() {
    const btn = document.createElement('button');
    btn.className = 'adaptive-float-btn';
    btn.textContent = t('floatBtn');
    btn.setAttribute('aria-label', t('floatBtn'));
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
}

function createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'adaptive-modal-overlay';
    overlay.innerHTML = `
        <div class="adaptive-modal">
            <h2 class="adaptive-modal-title">${t('title')}</h2>
            <div class="adaptive-modal-step active" data-step="choice">
                <div class="adaptive-test-option" data-test="mbti">
                    <span class="adaptive-test-option-icon">📝</span>
                    <div class="adaptive-test-option-text">
                        <div class="adaptive-test-option-title">${t('mbtiOption')}</div>
                        <div class="adaptive-test-option-meta">${t('mbtiMeta')}</div>
                    </div>
                </div>
                <div class="adaptive-test-option" data-test="bigfive">
                    <span class="adaptive-test-option-icon">🧠</span>
                    <div class="adaptive-test-option-text">
                        <div class="adaptive-test-option-title">${t('bigfiveOption')}</div>
                        <div class="adaptive-test-option-meta">${t('bigfiveMeta')}</div>
                    </div>
                </div>
            </div>
            <div class="adaptive-modal-step" data-step="question">
                <div class="adaptive-progress-bar"><div class="adaptive-progress-fill" style="width:0%"></div></div>
                <div class="adaptive-question-num"></div>
                <div class="adaptive-question-text"></div>
                <div class="adaptive-choices"></div>
                <div class="adaptive-nav-row">
                    <button type="button" class="adaptive-nav-btn secondary" id="adaptive-prev">${t('prev')}</button>
                    <button type="button" class="adaptive-nav-btn primary" id="adaptive-next">${t('next')}</button>
                </div>
            </div>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    document.body.appendChild(overlay);
    return overlay;
}

function openModal() {
    const overlay = document.querySelector('.adaptive-modal-overlay');
    if (!overlay) return;
    modalState = { testType: null, step: 0, answers: [], onComplete: modalState.onComplete };
    showStep(overlay, 'choice');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.querySelector('.adaptive-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showStep(overlay, stepId) {
    overlay.querySelectorAll('.adaptive-modal-step').forEach(s => {
        s.classList.toggle('active', s.dataset.step === stepId);
    });
}

function startTest(overlay, testType) {
    modalState.testType = testType;
    modalState.step = 0;
    modalState.answers = [];
    showQuestion(overlay);
    showStep(overlay, 'question');
}

function getQuestions() {
    const lang = getLang();
    if (modalState.testType === 'mbti') {
        return MBTI_QUESTIONS[lang];
    }
    return BIGFIVE_QUESTIONS[lang];
}

function showQuestion(overlay) {
    const questions = getQuestions();
    const total = questions.length;
    const step = modalState.step;
    const isLast = step === total - 1;

    const progressFill = overlay.querySelector('.adaptive-progress-fill');
    progressFill.style.width = `${((step + 1) / total) * 100}%`;

    const numEl = overlay.querySelector('.adaptive-question-num');
    numEl.textContent = `${step + 1} / ${total}`;

    const textEl = overlay.querySelector('.adaptive-question-text');
    const choicesEl = overlay.querySelector('.adaptive-choices');
    const prevBtn = overlay.querySelector('#adaptive-prev');
    const nextBtn = overlay.querySelector('#adaptive-next');

    prevBtn.style.display = step === 0 ? 'none' : 'block';
    nextBtn.textContent = isLast ? t('finish') : t('next');
    nextBtn.disabled = !isAnswered(step);

    if (modalState.testType === 'mbti') {
        const q = questions[step];
        const opts = MBTI_OPTIONS[getLang()][step];
        textEl.textContent = q.text;
        choicesEl.innerHTML = `
            <button type="button" class="adaptive-choice-btn" data-val="A">A) ${opts[0]}</button>
            <button type="button" class="adaptive-choice-btn" data-val="B">B) ${opts[1]}</button>
        `;
        choicesEl.querySelectorAll('.adaptive-choice-btn').forEach(btn => {
            btn.classList.toggle('selected', modalState.answers[step] === btn.dataset.val);
            btn.addEventListener('click', () => {
                modalState.answers[step] = btn.dataset.val;
                choicesEl.querySelectorAll('.adaptive-choice-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                nextBtn.disabled = false;
            });
        });
    } else {
        const q = questions[step];
        textEl.textContent = q.text;
        choicesEl.innerHTML = '<div class="adaptive-scale"></div>';
        const scale = choicesEl.querySelector('.adaptive-scale');
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'adaptive-scale-btn';
            btn.textContent = i;
            btn.classList.toggle('selected', modalState.answers[step] === i);
            btn.addEventListener('click', () => {
                modalState.answers[step] = i;
                scale.querySelectorAll('.adaptive-scale-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                nextBtn.disabled = false;
            });
            scale.appendChild(btn);
        }
    }

    prevBtn.onclick = () => {
        modalState.step--;
        showQuestion(overlay);
    };

    nextBtn.onclick = () => {
        if (isLast) {
            finishTest(overlay);
        } else {
            modalState.step++;
            showQuestion(overlay);
        }
    };
}

function isAnswered(step) {
    if (modalState.testType === 'mbti') {
        return modalState.answers[step] != null;
    }
    return modalState.answers[step] != null;
}

function finishTest(overlay) {
    let result;
    if (modalState.testType === 'mbti') {
        const scores = { EI: { E: 0, I: 0 }, SN: { S: 0, N: 0 }, TF: { T: 0, F: 0 }, JP: { J: 0, P: 0 } };
        const questions = MBTI_QUESTIONS[getLang()];
        modalState.answers.forEach((ans, i) => {
            const q = questions[i];
            const letter = ans === 'A' ? q.a : q.b;
            scores[q.dim][letter]++;
        });
        result = {
            EI: scores.EI.E >= 2 ? 'E' : 'I',
            SN: scores.SN.S >= 2 ? 'S' : 'N',
            TF: scores.TF.T >= 2 ? 'T' : 'F',
            JP: scores.JP.J >= 2 ? 'J' : 'P'
        };
        result.type = 'mbti';
        result.mbti = result.EI + result.SN + result.TF + result.JP;
    } else {
        const dims = { O: [], C: [], E: [], A: [], N: [] };
        const questions = BIGFIVE_QUESTIONS[getLang()];
        questions.forEach((q, i) => {
            dims[q.dim].push(modalState.answers[i]);
        });
        const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 4;
        result = {
            O: Math.round(avg(dims.O) * 100) / 100,
            C: Math.round(avg(dims.C) * 100) / 100,
            E: Math.round(avg(dims.E) * 100) / 100,
            A: Math.round(avg(dims.A) * 100) / 100,
            N: Math.round(avg(dims.N) * 100) / 100
        };
        result.type = 'bigfive';
    }

    closeModal();
    if (modalState.onComplete) modalState.onComplete(result);
    window.dispatchEvent(new CustomEvent('adaptive-test-complete', { detail: result }));
}

function initAdaptiveModal(onComplete) {
    modalState.onComplete = onComplete;
    createFloatButton();
    createModal();

    const overlay = document.querySelector('.adaptive-modal-overlay');
    overlay.querySelectorAll('.adaptive-test-option').forEach(opt => {
        opt.addEventListener('click', () => startTest(overlay, opt.dataset.test));
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAdaptiveModal());
} else {
    initAdaptiveModal();
}

// Konsoldan fetchAdaptiveFromAI yoksa buraya yedek ekle
if (typeof window.fetchAdaptiveFromAI !== 'function') {
    window.fetchAdaptiveFromAI = async function(testResult) {
        console.log('[adaptive] AI\'a gönderiliyor:', testResult);
        try {
            const res = await fetch('/api/adaptive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testResult)
            });
            const data = await res.json();
            console.log('[adaptive] AI cevabı:', data);
            if (data.success && data.tema) return { tema: data.tema, layout: data.layout, cta: data.cta, ton: data.ton };
            return data.fallback || null;
        } catch (e) {
            console.error('[adaptive] AI hatası:', e);
            return null;
        }
    };
}
