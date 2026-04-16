import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/features/localization/LanguageContext'
import { useAdaptive } from '@/features/personalization/state/AdaptiveLayoutContext'
import { Sparkles, X, ChevronRight, ChevronLeft, Brain, FileText } from 'lucide-react'
import { MBTI_PROMPTS } from '@/features/personalization/model/mbtiPrompts'
import type { MbtiAnswerLetter } from '@/features/personalization/model/mbtiDimensions'
import {
  deriveMbtiTypeCode,
  scoreAnswersAgainstMbtiPrompts,
} from '@/features/personalization/model/mbtiScoring'
import { mapMbtiCodeToSiteLayout } from '@/features/personalization/model/mapMbtiCodeToSiteLayout'
import { PERSONALIZATION_WIZARD_RESET_DELAY_MS } from '@/features/personalization/ui/personalizationTiming'

type WizardStep = 'choice' | 'test'

export function PersonalizationModal() {
  const { lang, t } = useTranslation()
  const { setLayout } = useAdaptive()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>('choice')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<MbtiAnswerLetter[]>([])

  const prompts = MBTI_PROMPTS

  const handleAnswer = (letter: MbtiAnswerLetter) => {
    const nextAnswers = [...answers]
    nextAnswers[currentQuestionIndex] = letter
    setAnswers(nextAnswers)

    if (currentQuestionIndex < prompts.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      completeWizard(nextAnswers)
    }
  }

  const completeWizard = (finalAnswers: MbtiAnswerLetter[]) => {
    const scoreBoard = scoreAnswersAgainstMbtiPrompts(prompts, finalAnswers)
    const mbtiTypeCode = deriveMbtiTypeCode(scoreBoard)
    const layoutPreset = mapMbtiCodeToSiteLayout(mbtiTypeCode)
    setLayout(layoutPreset)
    setIsOpen(false)
    window.setTimeout(() => {
      setStep('choice')
      setCurrentQuestionIndex(0)
      setAnswers([])
    }, PERSONALIZATION_WIZARD_RESET_DELAY_MS)
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] p-4 rounded-full bg-indigo-600 text-white shadow-[0_8px_32px_rgba(99,102,241,0.4)] flex items-center gap-2"
        aria-label={t('test-title')}
        type="button"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-bold pr-1">
          {lang === 'tr' ? 'Kişiselleştir' : 'Personalize'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {step === 'choice' ? (
                  <div className="space-y-6">
                    <div className="text-center mb-10 pt-4">
                      <h2 className="text-2xl font-bold mb-2">{t('test-title')}</h2>
                      <p className="text-white/40 text-sm">{t('test-desc')}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('test')}
                      className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t('test-mbti')}</div>
                        <div className="text-xs text-white/30">{t('test-mbti-desc')}</div>
                      </div>
                      <ChevronRight className="ml-auto w-5 h-5 text-white/20" />
                    </button>

                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 opacity-50 cursor-not-allowed"
                    >
                      <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t('test-bigfive')}</div>
                        <div className="text-xs text-white/30">{t('test-bigfive-desc')}</div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/30">
                        <span>
                          {t('test-question')} {currentQuestionIndex + 1} / {prompts.length}
                        </span>
                        <span>
                          {Math.round(((currentQuestionIndex + 1) / prompts.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${((currentQuestionIndex + 1) / prompts.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="py-4">
                      <h3 className="text-xl font-medium leading-relaxed">
                        {lang === 'tr'
                          ? prompts[currentQuestionIndex].textTurkish
                          : prompts[currentQuestionIndex].textEnglish}
                      </h3>
                    </div>

                    <div className="space-y-3 pb-4">
                      {(['A', 'B'] as const).map((letter, optionIndex) => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleAnswer(letter)}
                          className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.06] text-left transition-all flex items-center gap-4 group"
                        >
                          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs font-mono text-white/30 group-hover:border-indigo-500/50 group-hover:text-indigo-400">
                            {letter}
                          </div>
                          <span className="font-medium text-white/80 group-hover:text-white">
                            {lang === 'tr'
                              ? prompts[currentQuestionIndex].optionLabelsTurkish[optionIndex]
                              : prompts[currentQuestionIndex].optionLabelsEnglish[optionIndex]}
                          </span>
                        </button>
                      ))}
                    </div>

                    {currentQuestionIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        className="flex items-center gap-2 text-sm font-medium text-white/30 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t('test-back')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
