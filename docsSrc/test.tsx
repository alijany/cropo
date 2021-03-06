import image from './pine.webp'
import { Cropo } from '../script'

const cr = new Cropo({
  imageUrl: image,
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
  rangeInput: document.getElementById('myRange') as HTMLInputElement
})

//
const filePicker: HTMLInputElement = document.getElementById('filePicker') as HTMLInputElement

filePicker.addEventListener('change', (e) => {
  const file = (filePicker as HTMLInputElement).files?.[0]
  if (!file) return
  const fr = new FileReader()
  fr.onload = () => cr.loadImageFromUrl(String(fr.result))
  fr.readAsDataURL(file)
})

/* -------------------------------------------------------------------------- */
/*                                    page                                    */
/* -------------------------------------------------------------------------- */

const dropdown = document.getElementById('dropdown')

document.getElementById('menu').addEventListener('click', () => {
  dropdown.classList.toggle('hidden')
})

document.getElementById('download').addEventListener('click', () => {
  cr.download()
})
