import { describe, it, expect } from 'vitest'
import { Cropo } from '../script'
import { makeCanvas, loadImage, firePointer } from './helpers'
import { setFakeImageSize } from './setup'

describe('panning', () => {
  it('accumulates panning freely on both axes when fit is disabled', async () => {
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, false)

    cropo.move(10, 5)
    expect(cropo.getCropInfo()).toMatchObject({ x: 10, y: 5 })

    cropo.move(-40, -25)
    expect(cropo.getCropInfo()).toMatchObject({ x: -40, y: -25 })
  })

  it('clamps the upper bound to 0 when fit is enabled', async () => {
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, true) // 200x100 image

    cropo.move(50, 50)
    expect(cropo.getCropInfo()).toMatchObject({ x: 0, y: 0 })
  })

  it('clamps the lower X bound to canvasWidth - imgWidth (landscape)', async () => {
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, true) // 200x100 image -> X bound is 100 - 200 = -100

    cropo.move(-200, 0)
    const info = cropo.getCropInfo()
    expect(info.x).toBe(-100)
    expect(info.y).toBe(0) // imgHeight == canvasHeight, so Y is pinned at 0
  })

  it('clamps the lower Y bound for a portrait image', async () => {
    setFakeImageSize(100, 200)
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, true) // 100x200 image -> Y bound is 100 - 200 = -100

    cropo.move(0, -200)
    const info = cropo.getCropInfo()
    expect(info.x).toBe(0)
    expect(info.y).toBe(-100)
  })

  it('pans via a pointer drag sequence', async () => {
    const canvas = makeCanvas(100, 100)
    const cropo = new Cropo({ canvas, width: 100, height: 100 })
    await loadImage(cropo, false)

    firePointer(canvas, 'pointerdown', { x: 0, y: 0, pointerId: 1 })
    firePointer(canvas, 'pointermove', { x: 10, y: 5, pointerId: 1 })
    firePointer(canvas, 'pointerup', { x: 10, y: 5, pointerId: 1 })

    expect(cropo.getCropInfo()).toMatchObject({ x: 10, y: 5 })
  })
})
