import type {
  MbtiAnswerLetter,
  MbtiDimension,
  MbtiPrompt,
} from '@/features/personalization/model/mbtiDimensions'

export type MbtiLetterScores = Record<MbtiAnswerLetter, number>

export type MbtiScoreBoard = Record<MbtiDimension, MbtiLetterScores>

export function createEmptyMbtiScoreBoard(): MbtiScoreBoard {
  const empty: MbtiLetterScores = { A: 0, B: 0 }
  return {
    EI: { ...empty },
    SN: { ...empty },
    TF: { ...empty },
    JP: { ...empty },
  }
}

export function scoreAnswersAgainstMbtiPrompts(
  prompts: MbtiPrompt[],
  answers: MbtiAnswerLetter[],
): MbtiScoreBoard {
  const board = createEmptyMbtiScoreBoard()
  const count = Math.min(prompts.length, answers.length)
  for (let index = 0; index < count; index += 1) {
    const letter = answers[index]
    const prompt = prompts[index]
    board[prompt.dimension][letter] += 1
  }
  return board
}

export function deriveMbtiTypeCode(scoreBoard: MbtiScoreBoard): string {
  return (
    (scoreBoard.EI.A >= scoreBoard.EI.B ? 'E' : 'I') +
    (scoreBoard.SN.A >= scoreBoard.SN.B ? 'S' : 'N') +
    (scoreBoard.TF.A >= scoreBoard.TF.B ? 'T' : 'F') +
    (scoreBoard.JP.A >= scoreBoard.JP.B ? 'J' : 'P')
  )
}
