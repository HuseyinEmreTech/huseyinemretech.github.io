export type MbtiDimension = 'EI' | 'SN' | 'TF' | 'JP'

export type MbtiAnswerLetter = 'A' | 'B'

export interface MbtiPrompt {
  dimension: MbtiDimension
  textTurkish: string
  textEnglish: string
  optionLabelsTurkish: [string, string]
  optionLabelsEnglish: [string, string]
}
