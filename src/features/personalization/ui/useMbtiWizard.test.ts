import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMbtiWizard } from './useMbtiWizard'

vi.mock('@/features/personalization/state/AdaptiveLayoutContext', () => ({
  useAdaptive: () => ({ setLayout: vi.fn() }),
}))

vi.mock('@/features/personalization/model/mbtiPrompts', () => ({
  MBTI_PROMPTS: [
    {
      textEnglish: 'Q1',
      textTurkish: 'S1',
      dimension: 'EI',
      optionLabelsEnglish: ['A', 'B'],
      optionLabelsTurkish: ['A', 'B'],
    },
    {
      textEnglish: 'Q2',
      textTurkish: 'S2',
      dimension: 'SN',
      optionLabelsEnglish: ['A', 'B'],
      optionLabelsTurkish: ['A', 'B'],
    },
  ],
}))

vi.mock('@/features/personalization/model/mbtiScoring', () => ({
  scoreAnswersAgainstMbtiPrompts: vi.fn(() => ({})),
  deriveMbtiTypeCode: vi.fn(() => 'INTJ'),
}))

vi.mock('@/features/personalization/model/mapMbtiCodeToSiteLayout', () => ({
  mapMbtiCodeToSiteLayout: vi.fn(() => ({ tema: 'cool' })),
}))

vi.mock('@/features/personalization/ui/personalizationTiming', () => ({
  PERSONALIZATION_WIZARD_RESET_DELAY_MS: 0,
}))

describe('useMbtiWizard', () => {
  beforeEach(() => { vi.useFakeTimers() })

  it('başlangıçta choice adımında olmalı', () => {
    const { result } = renderHook(() => useMbtiWizard(vi.fn()))
    expect(result.current.step).toBe('choice')
    expect(result.current.currentQuestionIndex).toBe(0)
  })

  it('cevap verilince sonraki soruya geçmeli', () => {
    const { result } = renderHook(() => useMbtiWizard(vi.fn()))
    act(() => { result.current.handleAnswer('A') })
    expect(result.current.currentQuestionIndex).toBe(1)
  })

  it('geri butonu önceki soruya döndürmeli', () => {
    const { result } = renderHook(() => useMbtiWizard(vi.fn()))
    act(() => { result.current.handleAnswer('A') })
    act(() => { result.current.goBack() })
    expect(result.current.currentQuestionIndex).toBe(0)
  })

  it('sıfırın altına inmemeli', () => {
    const { result } = renderHook(() => useMbtiWizard(vi.fn()))
    act(() => { result.current.goBack() })
    expect(result.current.currentQuestionIndex).toBe(0)
  })

  it('son sorudan sonra onComplete çağrılmalı', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useMbtiWizard(onComplete))
    act(() => { result.current.handleAnswer('A') })
    act(() => { result.current.handleAnswer('B') })
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
