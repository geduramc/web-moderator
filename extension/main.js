'use strict';

const IMG_SELECTOR = "img, [style*='background-image']"
const WEB_MODERATOR_API = 'https://moderator.geduramc.com'
const CONFIG_MANAGER_API = 'https://config.geduramc.com'
const CLOUDINARY_URL = 'https://res.cloudinary.com'
const CLOUDINARY_NAME = 'geduramc'
const LOADING_IMG = 'https://res.cloudinary.com/geduramc/image/upload/s--zDlpWYnP--/v1677632961/web-moderator-loading.png'
const WEB_MODERATOR_LOGO = 'https://res.cloudinary.com/geduramc/image/upload/s--GBJLJCnP--/v1677591293/web-moderator-logo.png'
const STORAGE_ACTIVE_NAME = 'web-moderator-active'
const MODERATION_FLAG = 'geduramc/web-moderator/moderation-enable'
const IGNORE_IMAGES = 'geduramc/web-moderator/ignore-images'

let imgElements = null
let bgImgElements = null
let ctrlInterval = null
let imagesObj = []
let moderationFlag = false
let ignore = null

const setLoader = () => {
  const lastElement = document.getElementsByTagName('body')[0].firstElementChild

  const overlay = document.createElement('div')
  overlay.classList.add('g-overlay')

  const loader = document.createElement('span')
  loader.classList.add('g-loader')

  overlay.appendChild(loader)

  document.body.insertBefore(overlay, lastElement)
}

const hideLoader = () => {
  const el = document.getElementsByClassName('g-overlay')
  if (el.length == 1) el[0].remove()
}

const pixelateImg = (elements) => {
  try {
    if (elements.length > 0) {
      elements.forEach(el => {
        const originUrl = el.src
        const pixelUrl = `${CLOUDINARY_URL}/${CLOUDINARY_NAME}/image/fetch/e_pixelate/${originUrl}`
        let status = 'rejected'

        if (ignore.split(',').filter(x => x.replaceAll('"', '') === el.src).length > 0) return
        if (imagesObj.filter(x => x.url === el.src && x.status === 'approved').length > 0) return
        if (imagesObj.filter(x => x.url === el.src && x.status === 'rejected').length > 0) el.src = pixelUrl

        if (el.src && el.src.indexOf(CLOUDINARY_URL) < 0) {
          const pixelUrl = `${CLOUDINARY_URL}/${CLOUDINARY_NAME}/image/fetch/e_pixelate/${originUrl}`
          el.src = LOADING_IMG

          if (moderationFlag) {
            moderation(originUrl)
              .then(res => res.json())
              .then(({ data }) => {
                if (data.moderation && data.moderation[0].hasOwnProperty('status') && data.moderation[0].status == 'rejected')
                  el.src = pixelUrl
                else if (data.moderation && data.moderation[0].hasOwnProperty('status') && data.moderation[0].status == 'approved') {
                  el.src = originUrl
                  status = 'approved'
                }

                if (imagesObj.filter(x => x.url === el.src).length <= 0) imagesObj.push({
                  url: originUrl,
                  status: status
                })
              })
              .catch(err => {
                console.error(err)
              })
          }
        }
      })
    }
  } catch (err) {
    console.error(err)
    clearInterval(ctrlInterval)
  }
}

const pixelateBgImg = (elements) => {
  try {
    if (elements.length > 0) {
      elements.forEach(el => {
        const originUrl = el.style.backgroundImage.split('"')[1]
        el.remove()
        // if(originUrl && originUrl.indexOf(CLOUDINARY_URL) < 0){
        //   const pixelUrl = `${CLOUDINARY_URL}/${CLOUDINARY_NAME}/image/fetch/e_pixelate/${originUrl}`
        //   el.style.backgroundImage = `url(${pixelUrl})`
        // }
      })
    }
  } catch (err) {
    console.error(err)
    clearInterval(ctrlInterval)
  }
}

const validateImg = () => {
  imagesObj.filter(x => !x.status).forEach(async item => {
    console.log(item.element)
    const res = await moderation('')
    console.log(res)
    item.status = true
    debugger
  })
}

const auth = () => {
  return fetch(`${WEB_MODERATOR_API}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'web-moderator',
      user: 'geduramc',
      key: 'd2ViLW1vZGVyYXRvci1nZWR1cmFtYw=='
    })
  })
}

const moderation = async (fileUrl) => {
  let res = await auth()
  res = await res.json()

  return fetch(`${WEB_MODERATOR_API}/moderation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${res.data.token}`
    },
    body: JSON.stringify({
      file: fileUrl
    })
  })
}

const validateStorage = () => {
  if (localStorage.getItem(STORAGE_ACTIVE_NAME) == null)
    localStorage.setItem(STORAGE_ACTIVE_NAME, false)
}

const toggleStorage = () => {
  const value = (localStorage.getItem(STORAGE_ACTIVE_NAME) == 'true') ? 'false' : 'true'
  localStorage.setItem(STORAGE_ACTIVE_NAME, value)
  location.reload()
}

//main
window.addEventListener('DOMContentLoaded', async (event) => {
  validateStorage()

  // MODERATION_FLAG
  let res = await fetch(`${CONFIG_MANAGER_API}/name/${MODERATION_FLAG}`)
  res = await res.json()
  if (res.ok && res.data.length > 0) moderationFlag = (res.data[0].value === 'true') ? true : false

  res = await fetch(`${CONFIG_MANAGER_API}/name/${IGNORE_IMAGES}`)
  res = await res.json()
  if (res.ok && res.data.length > 0) ignore = res.data[0].value

  if (localStorage.getItem(STORAGE_ACTIVE_NAME) == 'true') {
    setLoader()

    setTimeout(() => {
      hideLoader()
    }, 3000)

    if (!moderationFlag) console.log('%c[Web Moderator]: Rekognition AI Moderation API disabled!', 'font-size: 20px; color: #c8cf00;')

    ctrlInterval = setInterval(() => {
      imgElements = document.querySelectorAll(`img:not([src*='${CLOUDINARY_URL}'])`)
      if (imgElements.length > 0) pixelateImg(Array.from(imgElements))

      bgImgElements = document.querySelectorAll("[style*='background-image']")
      if (bgImgElements.length > 0) pixelateBgImg(Array.from(bgImgElements))
    }, 100)
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.message === 'toggleInit') {
        sendResponse(localStorage.getItem(STORAGE_ACTIVE_NAME))
      }
      if (request.message === 'toggleChange') {
        toggleStorage()
      }
    }
  )
})
