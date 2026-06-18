import { describe, it, expect } from 'vitest'
import { Cropo } from '../script'
import { makeCanvas, loadImage } from './helpers'

describe('Cropo core', () => {
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
