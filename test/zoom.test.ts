import { describe, it, expect } from 'vitest'
import { Cropo } from '../script'
import { makeCanvas, loadImage, fireSliderInput } from './helpers'

interface SetupOptions {
  maxScale?: number
  minScale?: number
}

async function setupWithSlider (options: SetupOptions = {}) {
  const slider = document.createElement('input')
  slider.type = 'range'
  const cropo = new Cropo({
    canvas: makeCanvas(100, 100),
    rangeInput: slider,
    width: 100,
    height: 100,
    ...options
  })
  await loadImage(cropo, true) // 200x100 image fits 100x100 canvas at scale 1
  return { cropo, slider }
}

describe('zoom via slider', () => {
  it('scales the image width by the slider value', async () => {
    const { cropo, slider } = await setupWithSlider()
    expect(cropo.getCropInfo().imgWidth).toBe(200)

    fireSliderInput(slider, '2')
    expect(cropo.getCropInfo().imgWidth).toBe(400)
  })

  it('ignores slider values above the default maxScale (5)', async () => {
    const { cropo, slider } = await setupWithSlider()
    fireSliderInput(slider, '6')
    expect(cropo.getCropInfo().imgWidth).toBe(200) // unchanged
  })

  it('ignores slider values below the default minScale (1)', async () => {
    const { cropo, slider } = await setupWithSlider()
    fireSliderInput(slider, '0.5')
    expect(cropo.getCropInfo().imgWidth).toBe(200) // unchanged
  })

  it('honors a custom maxScale option', async () => {
    const { cropo, slider } = await setupWithSlider({ maxScale: 3 })

    fireSliderInput(slider, '4') // above max -> ignored
    expect(cropo.getCropInfo().imgWidth).toBe(200)

    fireSliderInput(slider, '3') // at max -> applied
    expect(cropo.getCropInfo().imgWidth).toBe(600)
  })

  it('honors a custom minScale option', async () => {
    const { cropo, slider } = await setupWithSlider({ minScale: 2 })

    fireSliderInput(slider, '1') // below min -> ignored
    expect(cropo.getCropInfo().imgWidth).toBe(200)

    fireSliderInput(slider, '2') // at min -> applied
    expect(cropo.getCropInfo().imgWidth).toBe(400)
  })
})
