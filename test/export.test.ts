import { describe, it, expect, vi } from 'vitest'
import { Cropo } from '../script'
import { makeCanvas, loadImage } from './helpers'
import { FAKE_DATA_URL, setFakeBlob } from './setup'

async function loadedCropo (width = 100, height = 100) {
  const cropo = new Cropo({ canvas: makeCanvas(width, height), width, height })
  await loadImage(cropo, true)
  return cropo
}

describe('export', () => {
  it('getDataUrl returns a data URL', async () => {
    const cropo = await loadedCropo()
    expect(cropo.getDataUrl()).toBe(FAKE_DATA_URL)
  })

  it('getBlob resolves to a Blob', async () => {
    const cropo = await loadedCropo()
    const blob = await cropo.getBlob()
    expect(blob).toBeInstanceOf(Blob)
  })

  it('getBlob rejects when the canvas yields no blob', async () => {
    setFakeBlob(null)
    const cropo = await loadedCropo()
    await expect(cropo.getBlob()).rejects.toThrow(/could not create blob/)
  })

  it('download creates an anchor and clicks it', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const created: HTMLElement[] = []
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag)
      created.push(el)
      return el
    })

    const cropo = await loadedCropo()
    cropo.download()

    const anchor = created.find((el) => el.tagName === 'A') as HTMLAnchorElement
    expect(anchor).toBeDefined()
    expect(anchor.download).toBe('canvas.png')
    expect(anchor.href).toContain('data:image/png')
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('scales the export canvas by the given factor', async () => {
    const created: HTMLCanvasElement[] = []
    const realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag)
      if (tag === 'canvas') created.push(el as HTMLCanvasElement)
      return el
    })

    const cropo = await loadedCropo(100, 100)
    cropo.getDataUrl(2)

    // the export canvas is the one created during getDataUrl(2)
    const exportCanvas = created.at(-1) as HTMLCanvasElement
    expect(exportCanvas.width).toBe(200)
    expect(exportCanvas.height).toBe(200)
  })
})
