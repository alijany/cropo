import { Cropo } from '../script'
import { FakeResizeObserver } from './setup'

export function makeCanvas (width = 100, height = 100) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

// loadImageFromUrl loads asynchronously (the FakeImage stub fires onload on a
// microtask); this resolves once the image is ready.
export function loadImage (cropo: Cropo, fit: boolean) {
  return new Promise<void>((resolve) => {
    cropo.loadImageFromUrl('fake://image.png', fit, () => resolve())
  })
}

interface PointerInit {
  x: number
  y: number
  pointerId?: number
}

// Dispatch a pointer event on `target`. jsdom does not compute layout-relative
// `offsetX`/`offsetY`, so we assign them (and `pointerId`) directly; event
// listeners match by type string, so a plain Event of the right type works and
// feeds Cropo's getPointerAverage as a real PointerEvent would.
export function firePointer (target: EventTarget, type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointerout', init: PointerInit) {
  const event = new Event(type, { bubbles: false, cancelable: true })
  Object.assign(event, {
    offsetX: init.x,
    offsetY: init.y,
    pointerId: init.pointerId ?? 1
  })
  target.dispatchEvent(event)
  return event
}

// Set a range input's value and dispatch the `input` event that drives
// Cropo's onSliderMove.
export function fireSliderInput (input: HTMLInputElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: false, cancelable: true }))
}

// Invoke the most recently registered ResizeObserver callback (Cropo's
// debounced onResize).
export function triggerResize () {
  const observer = FakeResizeObserver.instances.at(-1)
  observer?.callback([], observer as unknown as ResizeObserver)
}
