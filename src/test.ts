import { loadCanvas, loadImageFromUrl, loadSlider } from 'cropo';

function prevent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
}

loadCanvas(document.getElementById('canvas') as HTMLCanvasElement)
loadImageFromUrl('https://www.tailwind-kit.com/images/landscape/3.jpg');
loadSlider(document.getElementById("myRange") as HTMLInputElement)
var filePicker: HTMLInputElement = <HTMLInputElement>document.getElementById("filePicker");
function loadImageFile() {
    var file = (filePicker as HTMLInputElement).files?.[0];
    if (!file) return
    var fr = new FileReader();
    fr.onload = () => loadImageFromUrl(String(fr.result));
    fr.readAsDataURL(file);
}
filePicker.addEventListener('change', (e) => { prevent(e); loadImageFile() });