var slider: HTMLInputElement | undefined;

// canvas related variables
var canvas: HTMLCanvasElement;
var canvasContext: CanvasRenderingContext2D | null;
var canvasWidth: number = 0;
var canvasHeight: number = 0;

// image related variables
var img: HTMLImageElement;
var imgHeight: number;
var imgWidth: number;
var scale: number;
var originalWidth: number;
var originalHeight: number;
var ratio: number;

// Pointer drag related variables
var isDown: boolean;
var pointerX: number, pointerY: number;

// the accumulated horizontal(X) & vertical(Y) panning the user has done in total
var netPanningX: number;
var netPanningY: number;

// zoom and pinch related variables
let originX: number, originY: number;
var eventCache: PointerEvent[];
var prevDiff: number;

function initPointerAndZoom() {
  isDown = false;
  netPanningX = 0;
  netPanningY = 0;
  eventCache = [];
  prevDiff = -1;
  if (slider) slider.value = '1'
}

// draw image
function draw() {
  canvasContext?.clearRect(0, 0, canvasWidth, canvasHeight);
  canvasContext?.drawImage(img, netPanningX, netPanningY, imgWidth, imgHeight);
}

// recalculate images related variables
function onImageLoad(fixScale: boolean = true) {
  scale = Math.max(canvasHeight / imgHeight, canvasWidth / imgWidth);
  imgHeight *= scale;
  imgWidth *= scale;
  originalWidth = imgWidth;
  originalHeight = imgHeight;
  ratio = originalHeight / originalWidth;
  draw();
}

// define function to clamp number
function clamp(num: number, from: number, to: number) {
  return Math.max(from, Math.min(num, to));
}

// define debounce function
function debounce<Params extends any[]>(func: (...args: Params) => any, timeout: number,): (...args: Params) => void {
  let timer: NodeJS.Timeout
  return (...args: Params) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}

// get the median point of pointers
function getPointerAverage() {
  let x = 0, y = 0;
  for (var i = 0; i < eventCache.length; i++) {
    x += eventCache[i].offsetX;
    y += eventCache[i].offsetY;
  }
  x = x / eventCache.length;
  y = y / eventCache.length;
  return [x, y]
}

// calc origin for zoom and pinch
function calcOrigin(x: number, y: number) {
  originX = (-netPanningX + x) / imgWidth;
  originY = (-netPanningY + y) / imgHeight;
}

function handleMouseMove(x: number, y: number) {
  // the last mousemove event
  var dx = x - pointerX;
  var dy = y - pointerY;
  // reset the vars for next mousemove
  pointerX = x;
  pointerY = y;
  // accumulate the net panning done
  netPanningX = clamp(netPanningX + dx, canvasWidth - imgWidth, 0);
  netPanningY = clamp(netPanningY + dy, canvasHeight - imgHeight, 0);
}

function zoom(deltaX: number, deltaY: number) {
  netPanningX = clamp(netPanningX - deltaX * originX, canvasWidth - imgWidth, 0);
  netPanningY = clamp(netPanningY - deltaY * originY, canvasHeight - imgHeight, 0);
}

function zoomDelta(deltaX: number, deltaY: number) {
  const newWidth = imgWidth + deltaX;
  if (newWidth < originalWidth || imgHeight + deltaY < originalHeight) return;
  if (newWidth / originalWidth > 5) return;
  if (slider) slider.value = String(scale = newWidth / originalWidth)
  // calc new size
  imgWidth = newWidth;
  imgHeight += deltaY;
  // accumulate the net panning done
  zoom(deltaX, deltaY);
}

function zoomScale(scale: number) {
  prevDiff = -1;
  let deltaX = imgWidth;
  let deltaY = imgHeight;
  // calc new size
  imgWidth = originalWidth * scale;
  imgHeight = originalHeight * scale;
  // calc diff
  deltaX -= imgWidth;
  deltaY -= imgHeight;
  //
  calcOrigin(canvasWidth / 2, canvasHeight / 2);
  zoom(-deltaX, -deltaY)
}

function pinch() {
  if (eventCache.length == 2) {
    // Calculate the distance between the two pointers
    var curDiff = Math.hypot(eventCache[0].offsetX - eventCache[1].offsetX, eventCache[0].offsetY - eventCache[1].offsetY);
    // zoom into image
    if (prevDiff > 0) {
      const delta = curDiff - prevDiff;
      zoomDelta(delta, delta * ratio)
    }
    prevDiff = curDiff;
  }
}

/* -------------------------------------------------------------------------- */
/*                               Event Handlers                               */
/* -------------------------------------------------------------------------- */

function onSliderMove(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  scale = +value;
  zoomScale(scale);
  draw();
};

function onPointerdown(e: PointerEvent) {
  // This event is cached to support 2-finger gestures
  eventCache.push(e);
  // refresh move origin
  [pointerX, pointerY] = getPointerAverage();
  isDown = true;
};

function onPointerUp(e: PointerEvent) {
  // If the number of pointers down is less than two then reset diff tracker
  eventCache = eventCache.filter(ev => ev.pointerId != e.pointerId)
  if (eventCache.length < 2) {
    prevDiff = -1;
  }
  [pointerX, pointerY] = getPointerAverage();
  if (eventCache.length == 0) isDown = false;
};

function onPointermove(e: PointerEvent) {
  // Find this event in the cache and update its record with this event
  for (var i = 0; i < eventCache.length; i++)
    if (e.pointerId == eventCache[i].pointerId) {
      eventCache[i] = e; break;
    }
  // calc x,y and
  let [x, y] = getPointerAverage();
  if (isDown) handleMouseMove(x, y);
  pinch();
  calcOrigin(canvasWidth / 2, canvasHeight / 2);
  draw();
};

const onResize = debounce<[]>(() => {
  const deltaX = canvas.offsetWidth - canvasWidth;
  const deltaY = canvas.offsetHeight - canvasHeight;
  canvasWidth = canvas.width = canvas.offsetWidth;
  canvasHeight = canvas.height = canvas.offsetHeight;
  if (imgWidth < canvasWidth) {
    netPanningX = 0;
    onImageLoad();
  } else if (imgHeight < canvasHeight) {
    netPanningY = 0;
    onImageLoad();
  } else {
    netPanningX += deltaX / 2;
    netPanningY += deltaY / 2;
    draw();
  }
  slider.value = String(scale = Math.min(imgWidth / canvasWidth, imgHeight / canvasHeight));
}, 300)

function prevent(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

function leadListeners() {
  canvas.addEventListener('pointerdown', (e) => { prevent(e); onPointerdown(e) });
  canvas.addEventListener('pointermove', (e) => { prevent(e); onPointermove(e) });
  canvas.addEventListener('pointerout', (e) => { prevent(e); onPointerUp(e) })
  canvas.addEventListener('pointerup', (e) => { prevent(e); onPointerUp(e) })
  canvas.addEventListener('pointercancel', (e) => { prevent(e); onPointerUp(e) })
  canvas.addEventListener('pointerleave', (e) => { prevent(e); onPointerUp(e) })
  new ResizeObserver(onResize).observe(canvas);
}

/* -------------------------------------------------------------------------- */
/*                                   Loading                                  */
/* -------------------------------------------------------------------------- */

export function loadSlider(el: HTMLInputElement) {
  slider = el;
  slider.value = String(img ? scale : 1);
  slider.addEventListener('input', (e) => { prevent(e); onSliderMove(e) });
}

export function loadCanvas(el: HTMLCanvasElement) {
  canvas = el;
  canvasContext = canvas.getContext("2d");
  canvasWidth = canvas.width = canvas.offsetWidth;
  canvasHeight = canvas.height = canvas.offsetHeight;
  leadListeners();
}

export function loadImageFromUrl(url: string) {
  img = new Image();
  img.onload = () => {
    initPointerAndZoom();
    imgHeight = img.naturalHeight;
    imgWidth = img.naturalWidth;
    onImageLoad();
  };
  img.src = url;
}
