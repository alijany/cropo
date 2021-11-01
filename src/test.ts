import image from './pine.webp';
import { download, loadCanvas, loadImageFromUrl, loadSlider } from '../script';

function prevent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
}

loadCanvas(document.getElementById('canvas') as HTMLCanvasElement);
loadImageFromUrl(image, true);
loadSlider(document.getElementById("myRange") as HTMLInputElement);
var filePicker: HTMLInputElement = <HTMLInputElement>document.getElementById("filePicker");
function loadImageFile() {
    var file = (filePicker as HTMLInputElement).files?.[0];
    if (!file) return
    var fr = new FileReader();
    fr.onload = () => loadImageFromUrl(String(fr.result));
    fr.readAsDataURL(file);
}
filePicker.addEventListener('change', (e) => { prevent(e); loadImageFile() });

/* -------------------------------------------------------------------------- */
/*                                    page                                    */
/* -------------------------------------------------------------------------- */

const dropdown = document.getElementById("dropdown");

document.getElementById("menu").addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
});

document.getElementById("download").addEventListener('click', () => {
    download(2)
});