import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { SplineScene } from './SplineScene'

vi.mock('@/shared/lib/webgl', () => ({
  hasWebGL: vi.fn(() => false),
}))

describe('SplineScene', () => {
  it('WebGL yoksa robot placeholder render eder', () => {
    const { container } = render(
      <SplineScene scene="https://example.com/scene.splinecode" />
    )
    const placeholder = container.querySelector('[aria-hidden="true"]')
    expect(placeholder).toBeInTheDocument()
  })

  it('shouldLoad=false iken placeholder gösterir', () => {
    const { container } = render(
      <SplineScene scene="https://example.com/scene.splinecode" shouldLoad={false} />
    )
    const placeholder = container.querySelector('[aria-hidden="true"]')
    expect(placeholder).toBeInTheDocument()
  })
})
