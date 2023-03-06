const toggleInit = (el) => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { "message": "toggleInit" }, (response) => {
      el.checked = (response == 'true') ? true : false
    })
  })
}

const toggleChange = () => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { "message": "toggleChange" })
  })
}

window.addEventListener('DOMContentLoaded', async (event) => {
  try {
    const toggle = document.querySelector('input[type*="checkbox"]')
    toggleInit(toggle)
    
    toggle.addEventListener('change', () => {
      toggleChange()
    })
  } catch (err) { location.reload() }
})
