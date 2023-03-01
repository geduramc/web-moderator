'use strict';

const IMG_SELECTOR = "img, [style*='background-image']"
const WEB_MODERATOR_API = 'https://web-moderator-api.up.railway.app'
const CONFIG_MANAGER_API = 'https://config.geduramc.com'
const CLOUDINARY_URL = 'https://res.cloudinary.com'
const CLOUDINARY_NAME = 'demo'
const LOADING_IMG = 'https://res.cloudinary.com/geduramc/image/upload/s--zDlpWYnP--/v1677632961/web-moderator-loading.png'
const WEB_MODERATOR_LOGO = 'https://res.cloudinary.com/geduramc/image/upload/s--GBJLJCnP--/v1677591293/web-moderator-logo.png'
const STORAGE_ACTIVE_NAME = 'web-moderator-active'
const MODERATION_FLAG_URL = 'geduramc/web-moderator/moderation-enable'

let imgElements = null
let bgImgElements = null
let ctrlInterval = null
let imagesObj = []
let moderationFlag = false

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

        // el.src = LOADING_IMG
        if (originUrl && originUrl.indexOf(CLOUDINARY_URL) < 0) {
          const pixelUrl = `${CLOUDINARY_URL}/${CLOUDINARY_NAME}/image/fetch/e_pixelate/${originUrl}`
          el.setAttribute('src', LOADING_IMG)

          imagesObj.push({
            element: el,
            originUrl: originUrl,
            status: false,
            valid: false
          })
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
  imagesObj.filter(x => !x.status).forEach(item => {
    // console.log(item)
  })
}

const gfetch = ({ method = 'GET', url, headers = null, body }) => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url, true)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')

      if (headers != null && headers.length > 0) {
        headers.forEach(item => {
          const header = Object.getOwnPropertyNames(item)[0]
          xhr.setRequestHeader(header, item[header])
        })
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) resolve(JSON.parse(xhr.responseText))
      }
      xhr.send(JSON.stringify(body))
    }
    catch (err) { reject(err) }
  })
}

const auth = () => {
  return gfetch({
    method: 'POST',
    url: 'https://web-moderator-api.up.railway.app/auth',
    body: {
      name: 'web-moderator',
      user: 'geduramc',
      key: 'd2ViLW1vZGVyYXRvci1nZWR1cmFtYw=='
    }
  })
}

const moderation = async (fileUrl) => {
  const token = await auth()
  return gfetch({
    method: 'POST',
    url: `${WEB_MODERATOR_API}/moderation`,
    headers: [
      { Authorization: `Bearer ${token.data.token}` }
    ],
    body: {
      file: fileUrl
    }
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

const getModerationFlag = () => {
  gfetch({ url: `${CONFIG_MANAGER_API}/name/${MODERATION_FLAG_URL}` })
    .then(res => {
      if (res.ok && res.data.length > 0) {
        moderationFlag = (res.data[0].value === 'true') ? true : false
      }
    })
}

//main
window.addEventListener('DOMContentLoaded', async (event) => {
  validateStorage()

  if (localStorage.getItem(STORAGE_ACTIVE_NAME) == 'true') {
    getModerationFlag()
    setLoader()

    console.log(moderationFlag)

    setTimeout(() => {
      hideLoader()
    }, 3000)

    ctrlInterval = setInterval(() => {
      imgElements = document.querySelectorAll('img')
      if (imgElements.length > 0) pixelateImg(Array.from(imgElements))

      bgImgElements = document.querySelectorAll("[style*='background-image']")
      if (bgImgElements.length > 0) pixelateBgImg(Array.from(bgImgElements))

      validateImg()
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
