import { describe, it, expect } from 'vitest'
import { Cropo } from '../script'
import { makeCanvas, loadImage, firePointer } from './helpers'

describe('pinch zoom', () => {
  it('grows the image as two pointers spread apart', async () => {
    const canvas = makeCanvas(100, 100)
    const cropo = new Cropo({ canvas, width: 100, height: 100 })
    await loadImage(cropo, false) // originalWidth 200, originalHeight 100, ratio 0.5

    // two fingers down
    firePointer(canvas, 'pointerdown', { x: 0, y: 0, pointerId: 1 })
    firePointer(canvas, 'pointerdown', { x: 10, y: 0, pointerId: 2 })

    // first move establishes the baseline distance (prevDiff), no zoom yet
    firePointer(canvas, 'pointermove', { x: 20, y: 0, pointerId: 2 })
    expect(cropo.getCropInfo().imgWidth).toBe(200)

    // second move widens the gap by 20px -> zoomDelta(20, 20 * ratio)
    firePointer(canvas, 'pointermove', { x: 40, y: 0, pointerId: 2 })

    const info = cropo.getCropInfo()
    expect(info.imgWidth).toBe(220)
    expect(info.imgHeight).toBe(110)
  })

  it('does not zoom past the max scale', async () => {
    const canvas = makeCanvas(100, 100)
    const cropo = new Cropo({ canvas, width: 100, height: 100, maxScale: 1 })
    await loadImage(cropo, false)

    firePointer(canvas, 'pointerdown', { x: 0, y: 0, pointerId: 1 })
    firePointer(canvas, 'pointerdown', { x: 10, y: 0, pointerId: 2 })
    firePointer(canvas, 'pointermove', { x: 20, y: 0, pointerId: 2 })
    firePointer(canvas, 'pointermove', { x: 40, y: 0, pointerId: 2 })

    // maxScale of 1 forbids any growth beyond the original width
    expect(cropo.getCropInfo().imgWidth).toBe(200)
  })
})
