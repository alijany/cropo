// zoom slider
var slider = <HTMLInputElement>document.getElementById("myRange");
var filePicker = <HTMLInputElement>document.getElementById("filePicker");

// canvas related variables
var canvas: HTMLCanvasElement;
var canvasContext: CanvasRenderingContext2D;
var canvasWidth: number;
var canvasHeight: number;

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
var pointerX, pointerY;

// the accumulated horizontal(X) & vertical(Y) panning the user has done in total
var netPanningX: number;
var netPanningY: number;

// zoom and pinch related variables
let originX, originY;
var eventCache: PointerEvent[];
var prevDiff: number;

function initPointerAndZoom() {
  isDown = false;
  netPanningX = 0;
  netPanningY = 0;
  eventCache = [];
  prevDiff = -1;
  slider.value = '1'
}

// draw image
function draw() {
  canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
  canvasContext.drawImage(img, netPanningX, netPanningY, imgWidth, imgHeight);
}

// recalculate images related variables
function onImageLoad() {
  imgHeight = img.naturalHeight;
  imgWidth = img.naturalWidth;
  // fix image scale to contain
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

function handleMouseMove(x, y) {
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

function zoom(deltaX, deltaY) {
  netPanningX = clamp(netPanningX - deltaX * originX, canvasWidth - imgWidth, 0);
  netPanningY = clamp(netPanningY - deltaY * originY, canvasHeight - imgHeight, 0);
}

function zoomDelta(deltaX, deltaY) {
  const newWidth = imgWidth + deltaX;
  if (newWidth < originalWidth || imgHeight + deltaY < originalHeight) return;
  if (newWidth / originalWidth > 5) return;
  slider.value = String(newWidth / originalWidth)
  // calc new size
  imgWidth = newWidth;
  imgHeight += deltaY;
  // accumulate the net panning done
  zoom(deltaX, deltaY);
}

function zoomScale(scale) {
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
  zoomScale(value);
  draw();
};

function loadImageFile(e: Event) {
  var file = filePicker.files[0];
  var fr = new FileReader();
  fr.onload = () => loadImageFromUrl(String(fr.result));
  fr.readAsDataURL(file);
}

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

function prevent(e) {
  e.preventDefault();
  e.stopPropagation();
}

function leadListeners() {
  slider.addEventListener('input', (e) => { prevent(e); onSliderMove(e) });
  filePicker.addEventListener('change', (e) => { prevent(e); loadImageFile(e) });
  canvas.addEventListener('pointerdown', (e) => { prevent(e); onPointerdown(e) });
  canvas.addEventListener('pointermove', (e) => { prevent(e); onPointermove(e) });
  canvas.addEventListener('pointerout', (e) => { prevent(e); onPointerUp(e) })
  canvas.addEventListener('pointerup', (e) => { prevent(e); onPointerUp(e) })
  canvas.addEventListener('pointercancel', (e) => { prevent(e); onPointerUp(e) })
  canvas.addEventListener('pointerleave', (e) => { prevent(e); onPointerUp(e) })
}

/* -------------------------------------------------------------------------- */
/*                                   Loading                                  */
/* -------------------------------------------------------------------------- */

function loadCanvas(id: string) {
  canvas = document.getElementById(id) as HTMLCanvasElement;
  canvasContext = canvas.getContext("2d");
  canvasWidth = canvas.offsetWidth;
  canvasHeight = canvas.offsetHeight;
}

function loadImageFromUrl(url: string) {
  img = new Image();
  img.onload = () => {
    initPointerAndZoom();
    onImageLoad();
  };
  img.src = url;
}

loadCanvas('canvas');
leadListeners();
loadImageFromUrl('https://www.tailwind-kit.com/images/landscape/3.jpg');