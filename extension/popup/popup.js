window.addEventListener('DOMContentLoaded', async (event) => {
  const toggle = document.querySelector('input[type*="checkbox"]')

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    try{
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { "message": "toggleInit" }, (response) => {
        toggle.checked = (response == 'true') ? true : false
      })
    }catch(err){ location.reload() }
  })

  toggle.addEventListener('change', () => {
    try{
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "message": "toggleChange" })
      })
    }catch(err){ location.reload() }
  })
})