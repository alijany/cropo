import { describe, it, expect } from 'vitest'
import { Cropo } from './script'

function makeCanvas (width = 100, height = 100) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

// loadImageFromUrl loads asynchronously (FakeImage fires onload on a
// microtask); this resolves once the image is ready.
function loadImage (cropo: Cropo, fit: boolean) {
  return new Promise<void>((resolve) => {
    cropo.loadImageFromUrl('fake://image.png', fit, () => resolve())
  })
}

describe('Cropo', () => {
  it('constructs with a canvas without throwing', () => {
    expect(() => new Cropo({ canvas: makeCanvas(), width: 100, height: 100 })).not.toThrow()
  })

  it('exposes the loaded image dimensions via getCropInfo', async () => {
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, false) // fit: false keeps natural dimensions

    const info = cropo.getCropInfo()
    expect(info.originalWidth).toBe(200)
    expect(info.originalHeight).toBe(100)
    expect(info.imgWidth).toBe(200)
    expect(info.imgHeight).toBe(100)
    expect(info.x).toBe(0)
    expect(info.y).toBe(0)
  })

  it('accumulates panning freely when fit is disabled', async () => {
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, false)

    cropo.move(10, 5)
    let info = cropo.getCropInfo()
    expect(info.x).toBe(10)
    expect(info.y).toBe(5)

    cropo.move(30, 15)
    info = cropo.getCropInfo()
    expect(info.x).toBe(30)
    expect(info.y).toBe(15)
  })

  it('clamps panning to the canvas bounds when fit is enabled', async () => {
    const cropo = new Cropo({ canvas: makeCanvas(100, 100), width: 100, height: 100 })
    await loadImage(cropo, true)

    // image (200x100) is wider than the canvas (100x100); the upper bound of
    // panning is 0, so a positive move cannot push the image to the right.
    cropo.move(50, 50)
    const info = cropo.getCropInfo()
    expect(info.x).toBe(0)
    expect(info.y).toBe(0)
  })

  it('throws when exporting before an image is set', () => {
    const cropo = new Cropo({ canvas: makeCanvas(), width: 100, height: 100 })
    expect(() => cropo.getDataUrl()).toThrow(/set an image/)
  })

  it('throws when loading an image before a canvas exists', () => {
    const cropo = new Cropo({ canvas: makeCanvas(), width: 100, height: 100 })
    // force the no-canvas branch of loadImageFromUrl
    ;(cropo as unknown as { canvas: unknown }).canvas = undefined
    expect(() => cropo.loadImageFromUrl('fake://image.png')).toThrow(/loadCanvas/)
  })
})
