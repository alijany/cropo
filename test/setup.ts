import { vi, beforeEach, afterEach } from 'vitest'

// jsdom does not implement the canvas 2d context, canvas export (toDataURL /
// toBlob), the HTMLImageElement load lifecycle, or ResizeObserver. Provide
// lightweight, controllable stubs so the Cropo class (which is otherwise pure
// math around these APIs) can be exercised in tests.

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

/* -------------------------------------------------------------------------- */
/*                            Controllable fixtures                           */
/* -------------------------------------------------------------------------- */

const DEFAULT_IMAGE_SIZE = { width: 200, height: 100 }
let fakeImageSize = { ...DEFAULT_IMAGE_SIZE }

// Set the natural dimensions reported by the next loaded image. Useful for
// exercising landscape vs portrait `fit` behaviour.
export function setFakeImageSize (width: number, height: number) {
  fakeImageSize = { width, height }
}

// `toBlob` yields this value; set it to `null` to exercise the getBlob
// rejection branch.
let fakeBlob: Blob | null = new Blob(['fake'], { type: 'image/png' })

export function setFakeBlob (blob: Blob | null) {
  fakeBlob = blob
}

export const FAKE_DATA_URL = 'data:image/png;base64,ZmFrZQ=='

// A controllable Image stub: assigning `src` triggers `onload` on the next
// microtask, mimicking the browser without needing real network/decoding.
class FakeImage {
  onload: (() => void) | null = null
  width = 0
  height = 0
  private _src = ''

  get naturalWidth () {
    return fakeImageSize.width
  }

  get naturalHeight () {
    return fakeImageSize.height
  }

  set src (value: string) {
    this._src = value
    queueMicrotask(() => this.onload?.())
  }

  get src () {
    return this._src
  }
}

// Captures the callback passed by Cropo so tests can trigger a resize.
export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []
  readonly callback: ResizeObserverCallback

  constructor (callback: ResizeObserverCallback) {
    this.callback = callback
    FakeResizeObserver.instances.push(this)
  }

  observe () {}
  unobserve () {}
  disconnect () {}
}

/* -------------------------------------------------------------------------- */
/*                              Stub installation                             */
/* -------------------------------------------------------------------------- */

// Install the stubs at module scope so they are in place before script.ts is
// imported (the deprecated module-level `new Cropo({})` instantiates on import).
function installStubs () {
  const ctx = createFakeContext()
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => FAKE_DATA_URL) as unknown as typeof HTMLCanvasElement.prototype.toDataURL
  HTMLCanvasElement.prototype.toBlob = vi.fn(function (callback: BlobCallback) {
    callback(fakeBlob)
  }) as unknown as typeof HTMLCanvasElement.prototype.toBlob

  vi.stubGlobal('Image', FakeImage)
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  FakeResizeObserver.instances = []
}

installStubs()

// Re-install before each test so every case gets fresh spies and default state.
beforeEach(() => {
  fakeImageSize = { ...DEFAULT_IMAGE_SIZE }
  fakeBlob = new Blob(['fake'], { type: 'image/png' })
  installStubs()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})
