export class Cropo {
  // zoom range input
  private slider: HTMLInputElement | undefined;

  // canvas related variables
  private canvas: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  // image related variables
  private fit: boolean = true;
  private img: HTMLImageElement;
  private imgHeight: number;
  private imgWidth: number;
  private scale: number;
  private baseScale: number = 1;
  private maxScale: number = 5;
  private minScale: number = 1;
  private originalWidth: number;
  private originalHeight: number;
  private ratio: number;

  // Pointer drag related variables
  private isDown: boolean;
  private pointerX: number
  private pointerY: number;

  // the accumulated horizontal(X) & vertical(Y) panning the user has done in total
  private netPanningX: number;
  private netPanningY: number;

  // zoom and pinch related variables
  private originX: number
  private originY: number;
  private eventCache: PointerEvent[];
  private prevDiff: number;

  // TODO: remove optional from version 1.0.0
  constructor (options: {
    imageUrl?: string;
    onImageLoad?: () => void;
    canvas?: HTMLCanvasElement,
    rangeInput?: HTMLInputElement,
    height?: number,
    width?: number,
    x?: number,
    y?: number,
    fit?: boolean,
    baseScale?: number;
    maxScale?: number;
    minScale?: number;
  }) {
    this.baseScale = options?.baseScale || this.baseScale
    this.maxScale = options?.maxScale || this.maxScale
    this.minScale = options?.minScale || this.minScale
    this.loadCanvas(options?.canvas || document.createElement('canvas'), options?.width, options?.height)
    options?.rangeInput && this.loadSlider(options.rangeInput)
    if (options?.imageUrl) {
      this.loadImageFromUrl(options?.imageUrl, options?.fit, () => {
        this.move(options?.x || 0, options?.y || 0)
        options?.onImageLoad?.()
      })
    }
  }

  // define function to clamp number
  private clamp (num: number, from: number, to: number) {
    return Math.max(from, Math.min(num, to))
  }

  // define debounce function
  private debounce<Params extends any[]> (func: (...args: Params) => any, timeout: number): (...args: Params) => void {
    let timer
    return (...args: Params) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        func(...args)
      }, timeout)
    }
  }

  // initialize pointer related variables
  private initPointerAndZoom () {
    this.isDown = false
    this.netPanningX = 0
    this.netPanningY = 0
    this.eventCache = []
    this.prevDiff = -1
    if (this.slider) this.slider.value = String(this.baseScale)
  }

  // draw image
  private draw () {
    if (!this.img) return
    this.canvasContext?.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.canvasContext?.drawImage(this.img, this.netPanningX, this.netPanningY, this.imgWidth, this.imgHeight)
  }

  // fix range
  private fixScale () {
    if (this.fit) { this.scale = Math.min(this.imgWidth / this.canvasWidth, this.imgWidth / this.canvasHeight) || this.baseScale } else { this.scale = Math.min(this.imgWidth / this.originalWidth, this.imgWidth / this.originalHeight) || this.baseScale }
    if (this.slider) this.slider.value = String(this.scale)
  }

  // recalculate images related variables
  private onImageLoad () {
    if (this.fit) {
      this.scale = Math.max(this.canvasHeight / this.imgHeight, this.canvasWidth / this.imgWidth)
      this.imgHeight *= this.scale
      this.imgWidth *= this.scale
    }
    this.pointerX = this.pointerY = 0
    this.originalWidth = this.imgWidth
    this.originalHeight = this.imgHeight
    this.ratio = this.originalHeight / this.originalWidth
    this.draw()
  }

  // get the median point of pointers
  private getPointerAverage () {
    let x = 0; let y = 0
    for (let i = 0; i < this.eventCache.length; i++) {
      x += this.eventCache[i].offsetX
      y += this.eventCache[i].offsetY
    }
    x = x / this.eventCache.length
    y = y / this.eventCache.length
    return [x, y]
  }

  // calc origin for zoom and pinch
  private calcOrigin (x: number, y: number) {
    this.originX = (-this.netPanningX + x) / this.imgWidth
    this.originY = (-this.netPanningY + y) / this.imgHeight
  }

  public move (x: number, y: number) {
    // the last mousemove event
    const dx = x - this.pointerX
    const dy = y - this.pointerY
    // reset the vars for next mousemove
    this.pointerX = x
    this.pointerY = y
    // accumulate the net panning done
    this.netPanningX = this.fit ? this.clamp(this.netPanningX + dx, this.canvasWidth - this.imgWidth, 0) : this.netPanningX + dx
    this.netPanningY = this.fit ? this.clamp(this.netPanningY + dy, this.canvasHeight - this.imgHeight, 0) : this.netPanningY + dy
  }

  private drawZoom (deltaX: number, deltaY: number) {
    this.netPanningX = this.fit ? this.clamp(this.netPanningX - deltaX * this.originX, this.canvasWidth - this.imgWidth, 0) : this.netPanningX - deltaX * this.originX
    this.netPanningY = this.fit ? this.clamp(this.netPanningY - deltaY * this.originY, this.canvasHeight - this.imgHeight, 0) : this.netPanningY - deltaY * this.originY
  }

  private zoomDelta (deltaX: number, deltaY: number) {
    const newWidth = this.imgWidth + deltaX
    if (newWidth < this.originalWidth || this.imgHeight + deltaY < this.originalHeight) return
    if (newWidth / this.originalWidth > this.maxScale || newWidth / this.originalWidth < this.minScale) return
    if (this.slider) this.slider.value = String(this.scale = newWidth / this.originalWidth)
    // calc new size
    this.imgWidth = newWidth
    this.imgHeight += deltaY
    // accumulate the net panning done
    this.drawZoom(deltaX, deltaY)
  }

  private zoomScale (scale: number) {
    if (scale > this.maxScale || scale < this.minScale) return
    this.prevDiff = -1
    let deltaX = this.imgWidth
    let deltaY = this.imgHeight
    // calc new size
    this.imgWidth = this.originalWidth * scale
    this.imgHeight = this.originalHeight * scale
    // calc diff
    deltaX -= this.imgWidth
    deltaY -= this.imgHeight
    //
    this.calcOrigin(this.canvasWidth / 2, this.canvasHeight / 2)
    this.drawZoom(-deltaX, -deltaY)
  }

  private pinch () {
    if (this.eventCache.length === 2) {
      // Calculate the distance between the two pointers
      const curDiff = Math.hypot(this.eventCache[0].offsetX - this.eventCache[1].offsetX, this.eventCache[0].offsetY - this.eventCache[1].offsetY)
      // zoom into image
      if (this.prevDiff > 0) {
        const delta = curDiff - this.prevDiff
        this.zoomDelta(delta, delta * this.ratio)
      }
      this.prevDiff = curDiff
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               Event Handlers                               */
  /* -------------------------------------------------------------------------- */

  private onSliderMove (e: Event) {
    const value = (e.target as HTMLInputElement).value
    this.scale = +value
    this.zoomScale(this.scale)
    this.draw()
  };

  private onPointerdown (e: PointerEvent) {
    if (!this.img) return
    // This event is cached to support 2-finger gestures
    this.eventCache.push(e);
    // refresh move origin
    [this.pointerX, this.pointerY] = this.getPointerAverage()
    this.isDown = true
  };

  private onPointerUp (e: PointerEvent) {
    if (!this.isDown) return
    // If the number of pointers down is less than two then reset diff tracker
    this.eventCache = this.eventCache.filter(ev => ev.pointerId !== e.pointerId)
    if (this.eventCache.length < 2) {
      this.prevDiff = -1
    }
    [this.pointerX, this.pointerY] = this.getPointerAverage()
    if (this.eventCache.length === 0) this.isDown = false
  };

  private onPointermove (e: PointerEvent) {
    if (!this.isDown) return
    // Find this event in the cache and update its record with this event
    for (let i = 0; i < this.eventCache.length; i++) {
      if (e.pointerId === this.eventCache[i].pointerId) {
        this.eventCache[i] = e; break
      }
    }
    // calc x,y and
    const [x, y] = this.getPointerAverage()
    this.move(x, y)
    this.pinch()
    this.calcOrigin(this.canvasWidth / 2, this.canvasHeight / 2)
    this.draw()
  };

  private onResize = this.debounce<[]>(() => {
    if (!this.img) return
    const deltaX = this.canvas.offsetWidth - this.canvasWidth
    const deltaY = this.canvas.offsetHeight - this.canvasHeight
    this.canvasWidth = this.canvas.width = this.canvas.offsetWidth
    this.canvasHeight = this.canvas.height = this.canvas.offsetHeight
    if (this.fit && this.imgWidth < this.canvasWidth) {
      this.netPanningX = 0
      this.onImageLoad()
    } else if (this.fit && this.imgHeight < this.canvasHeight) {
      this.netPanningY = 0
      this.onImageLoad()
    } else {
      this.netPanningX += deltaX / 2
      this.netPanningY += deltaY / 2
      this.originalWidth = this.canvasWidth
      this.originalHeight = this.canvasWidth * this.ratio
      this.draw()
    }
    this.fixScale()
  }, 300)

  private prevent (e: Event) {
    e.preventDefault()
    e.stopPropagation()
  }

  private leadListeners () {
    this.canvas.addEventListener('pointerdown', (e) => { this.prevent(e); this.onPointerdown(e) })
    this.canvas.addEventListener('pointermove', (e) => { this.prevent(e); this.onPointermove(e) })
    this.canvas.addEventListener('pointerout', (e) => { this.prevent(e); this.onPointerUp(e) })
    this.canvas.addEventListener('pointerup', (e) => { this.prevent(e); this.onPointerUp(e) })
    this.canvas.addEventListener('pointercancel', (e) => { this.prevent(e); this.onPointerUp(e) })
    this.canvas.addEventListener('pointerleave', (e) => { this.prevent(e); this.onPointerUp(e) })
    new ResizeObserver(this.onResize).observe(this.canvas)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Loading                                  */
  /* -------------------------------------------------------------------------- */

  public loadSlider (el: HTMLInputElement) {
    this.slider = el
    this.slider.value = String(this.scale || this.baseScale)
    this.slider.addEventListener('input', (e) => { this.prevent(e); this.onSliderMove(e) })
  }

  public loadCanvas (el: HTMLCanvasElement, width?: number, height?: number) {
    this.canvas = el
    this.canvasContext = this.canvas.getContext('2d')
    this.canvasWidth = this.canvas.width = width || this.canvas.offsetWidth
    this.canvasHeight = this.canvas.height = height || this.canvas.offsetHeight
    this.leadListeners()
  }

  public loadImageFromUrl (url: string, fitImage: boolean = true, onload?: () => void) {
    if (!this.canvas) throw Error('first call loadCanvas')
    this.fit = fitImage
    this.img = new Image()
    this.img.onload = () => {
      this.initPointerAndZoom()
      this.imgHeight = this.img.naturalHeight
      this.imgWidth = this.img.naturalWidth
      this.onImageLoad()
      onload?.()
    }
    this.img.src = url
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Export                                   */
  /* -------------------------------------------------------------------------- */

  public getDataUrl (scale: number = 1) {
    if (!this.img) throw Error('please set an image')
    const canvas = document.createElement('canvas')
    canvas.width = this.canvasWidth * scale
    canvas.height = this.canvasHeight * scale
    const context = canvas.getContext('2d')
    context.drawImage(this.img, this.netPanningX * scale, this.netPanningY * scale, this.imgWidth * scale, this.imgHeight * scale)
    return canvas.toDataURL()
  }

  public download (scale: number = 1) {
    const link = document.createElement('a')
    link.download = 'canvas.png'
    link.href = this.getDataUrl(scale)
    link.click()
  }

  public getCropInfo () {
    return ({
      width: this.imgWidth,
      imgHeight: this.imgHeight,
      x: this.netPanningX,
      y: this.netPanningY
    })
  }
}

const cr = new Cropo({})

/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead. (example: cont cr= new Cropo(config); cr.download();)
 */
export function download (...arg: Parameters<typeof cr.download>) { cr.download(...arg) };
/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead. (example: new Cropo(config))
 */
export function loadCanvas (...arg: Parameters<typeof cr.loadCanvas>) { cr.loadCanvas(...arg) };
/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead. (example: cont cr= new Cropo(config); cr.loadImageFromUrl();)
 */
export function loadImageFromUrl (...arg: Parameters<typeof cr.loadImageFromUrl>) { cr.loadImageFromUrl(...arg) };
/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead. (example: new Cropo(config))
 */
export function loadSlider (...arg: Parameters<typeof cr.loadSlider>) { cr.loadSlider(...arg) };
/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead. (example: cont cr= new Cropo(config); cr.move();)
 */
export function move (...arg: Parameters<typeof cr.move>) { cr.move(...arg) };
/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead.(example: cont cr= new Cropo(config); cr.getCropInfo();)
 */
export function getCropInfo (...arg: Parameters<typeof cr.getCropInfo>) { cr.getCropInfo(...arg) };
/**
 * @deprecated Since version 0.6. Will be deleted in version 1.0. Use Cropo instance instead. (example: cont cr= new Cropo(config); cr.getDataUrl();)
 */
export function getDataUrl (...arg: Parameters<typeof cr.getDataUrl>) { cr.getDataUrl(...arg) };
