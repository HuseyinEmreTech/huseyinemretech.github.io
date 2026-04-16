import type { MbtiPrompt } from '@/features/personalization/model/mbtiDimensions'

export const MBTI_PROMPTS: MbtiPrompt[] = [
  {
    dimension: 'EI',
    textTurkish: 'Boş zamanında ne yaparsın?',
    textEnglish: 'What do you do in your free time?',
    optionLabelsTurkish: ['Dışarı çıkarım', 'Evde kalırım'],
    optionLabelsEnglish: ['Go out', 'Stay home'],
  },
  {
    dimension: 'EI',
    textTurkish: 'Yeni ortamda nasılsın?',
    textEnglish: 'How are you in new environments?',
    optionLabelsTurkish: ['Hemen kaynaşırım', 'Önce gözlemlerim'],
    optionLabelsEnglish: ['Blend in quickly', 'Observe first'],
  },
  {
    dimension: 'SN',
    textTurkish: 'Problemi nasıl çözersin?',
    textEnglish: 'How do you solve problems?',
    optionLabelsTurkish: ['Deneyimle', 'Sezgiyle'],
    optionLabelsEnglish: ['By experience', 'By intuition'],
  },
  {
    dimension: 'SN',
    textTurkish: 'Odağın nerede?',
    textEnglish: 'Where is your focus?',
    optionLabelsTurkish: ['Detaylarda', 'Büyük resimde'],
    optionLabelsEnglish: ['Details', 'Big picture'],
  },
  {
    dimension: 'TF',
    textTurkish: 'Zor kararı nasıl verirsin?',
    textEnglish: 'How do you make tough decisions?',
    optionLabelsTurkish: ['Mantıkla', 'Hisle'],
    optionLabelsEnglish: ['With logic', 'With feeling'],
  },
  {
    dimension: 'TF',
    textTurkish: 'Eleştiri alınca?',
    textEnglish: 'When you receive criticism?',
    optionLabelsTurkish: ['Nesnel değerlendiririm', 'İçime alırım'],
    optionLabelsEnglish: ['Evaluate objectively', 'Take it to heart'],
  },
  {
    dimension: 'JP',
    textTurkish: 'Planlamayı sever misin?',
    textEnglish: 'Do you like planning?',
    optionLabelsTurkish: ['Evet severim', 'Hayır sevmem'],
    optionLabelsEnglish: ['Yes I like it', "No I don't"],
  },
  {
    dimension: 'JP',
    textTurkish: 'Masanı nasıl tutarsın?',
    textEnglish: 'How do you keep your desk?',
    optionLabelsTurkish: ['Düzenli', 'Kaotik ama bilirim'],
    optionLabelsEnglish: ['Organized', 'Chaotic but I know where things are'],
  },
]
