import { useState, useCallback } from 'react'
import { useAdaptive } from '@/features/personalization/state/AdaptiveLayoutContext'
import { MBTI_PROMPTS } from '@/features/personalization/model/mbtiPrompts'
import type { MbtiAnswerLetter } from '@/features/personalization/model/mbtiDimensions'
import { deriveMbtiTypeCode, scoreAnswersAgainstMbtiPrompts } from '@/features/personalization/model/mbtiScoring'
import { mapMbtiCodeToSiteLayout } from '@/features/personalization/model/mapMbtiCodeToSiteLayout'
import { PERSONALIZATION_WIZARD_RESET_DELAY_MS } from '@/features/personalization/ui/personalizationTiming'

export type WizardStep = 'choice' | 'test'

export function useMbtiWizard(onComplete: () => void) {
  const { setLayout } = useAdaptive()
  const [step, setStep] = useState<WizardStep>('choice')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<MbtiAnswerLetter[]>([])
  const prompts = MBTI_PROMPTS

  const handleAnswer = useCallback((letter: MbtiAnswerLetter) => {
    const nextAnswers = [...answers]
    nextAnswers[currentQuestionIndex] = letter
    setAnswers(nextAnswers)

    if (currentQuestionIndex < prompts.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
    } else {
      const scoreBoard = scoreAnswersAgainstMbtiPrompts(prompts, nextAnswers)
      const mbtiTypeCode = deriveMbtiTypeCode(scoreBoard)
      const layoutPreset = mapMbtiCodeToSiteLayout(mbtiTypeCode)
      setLayout(layoutPreset)
      onComplete()
      window.setTimeout(() => {
        setStep('choice')
        setCurrentQuestionIndex(0)
        setAnswers([])
      }, PERSONALIZATION_WIZARD_RESET_DELAY_MS)
    }
  }, [answers, currentQuestionIndex, prompts, setLayout, onComplete])

  const goBack = useCallback(() => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  }, [])

  return { step, setStep, currentQuestionIndex, prompts, handleAnswer, goBack }
}
