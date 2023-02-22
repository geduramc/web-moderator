"use strict";

const imgElements = document.getElementsByTagName("img")
const lastElement = document.getElementsByTagName("body")[0].firstElementChild

const overlay = document.createElement("div")
overlay.classList.add("g-overlay")

const loader = document.createElement("span")
loader.classList.add("g-loader")

overlay.appendChild(loader)
document.body.insertBefore(overlay, lastElement)

console.log(imgElements)
if(imgElements.length > 0) {
  Array.from(imgElements).forEach(el => {
    // el.remove()
  });
}

setTimeout(() => {
  document.body.removeChild(overlay)
}, 5000)