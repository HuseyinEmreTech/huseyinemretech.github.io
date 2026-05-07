import { describe, it, expect } from 'vitest'
import { translations } from './translations'

describe('translations', () => {
  it('tr ve en dilleri mevcut olmalı', () => {
    expect(translations).toHaveProperty('tr')
    expect(translations).toHaveProperty('en')
  })

  it('her iki dilde aynı anahtarlar bulunmalı', () => {
    const trKeys = Object.keys(translations.tr).sort()
    const enKeys = Object.keys(translations.en).sort()
    expect(trKeys).toEqual(enKeys)
  })

  it('boş çeviri değeri olmamalı', () => {
    for (const [key, value] of Object.entries(translations.tr)) {
      expect(value, `tr.${key} boş`).toBeTruthy()
    }
    for (const [key, value] of Object.entries(translations.en)) {
      expect(value, `en.${key} boş`).toBeTruthy()
    }
  })
})
