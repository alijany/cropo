import { vi, beforeEach } from 'vitest'

// jsdom does not implement the canvas 2d context, the HTMLImageElement load
// lifecycle, or ResizeObserver. Provide lightweight stubs so the Cropo class
// (which is otherwise pure math around these APIs) can be exercised in tests.

export interface FakeContext {
  clearRect: ReturnType<typeof vi.fn>
  drawImage: ReturnType<typeof vi.fn>
}

export function createFakeContext (): FakeContext {
  return {
    clearRect: vi.fn(),
    drawImage: vi.fn()
  }
}

// A controllable Image stub: assigning `src` triggers `onload` on the next
// microtask, mimicking the browser without needing real network/decoding.
class FakeImage {
  onload: (() => void) | null = null
  naturalWidth = 200
  naturalHeight = 100
  width = 0
  height = 0
  private _src = ''

  set src (value: string) {
    this._src = value
    queueMicrotask(() => this.onload?.())
  }

  get src () {
    return this._src
  }
}

class FakeResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

// Install the stubs at module scope so they are in place before script.ts is
// imported (the deprecated module-level `new Cropo({})` instantiates on import).
function installStubs () {
  const ctx = createFakeContext()
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext
  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
}

installStubs()

// Re-install before each test so every case gets a fresh 2d context spy.
beforeEach(() => {
  installStubs()
})
