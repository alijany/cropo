import { describe, it, expect, vi } from 'vitest'
import { Cropo } from '../script'
import { makeCanvas, loadImage, triggerResize } from './helpers'

describe('resize', () => {
  it('resizes the canvas after the debounce window', async () => {
    const canvas = makeCanvas(100, 100)
    // jsdom reports offset* as 0; shadow them with the new layout size.
    Object.defineProperty(canvas, 'offsetWidth', { value: 120, configurable: true })
    Object.defineProperty(canvas, 'offsetHeight', { value: 80, configurable: true })

    const cropo = new Cropo({ canvas, width: 100, height: 100 })
    await loadImage(cropo, true) // load under real timers so onload resolves

    vi.useFakeTimers()
    triggerResize()

    // onResize is debounced by 300ms; nothing happens before it elapses
    expect(canvas.width).toBe(100)

    vi.advanceTimersByTime(300)
    expect(canvas.width).toBe(120)
    expect(canvas.height).toBe(80)
  })

  it('is a no-op when no image has been loaded', async () => {
    const canvas = makeCanvas(100, 100)
    Object.defineProperty(canvas, 'offsetWidth', { value: 120, configurable: true })
    Object.defineProperty(canvas, 'offsetHeight', { value: 80, configurable: true })

    const cropo = new Cropo({ canvas, width: 100, height: 100 }) // no image loaded

    vi.useFakeTimers()
    triggerResize()
    vi.advanceTimersByTime(300)

    expect(cropo.getCropInfo).toBeTypeOf('function')
    expect(canvas.width).toBe(100) // unchanged
  })
})
