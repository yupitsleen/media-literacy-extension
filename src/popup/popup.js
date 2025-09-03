document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('enableExtension');
  
  chrome.storage.sync.get(['extensionEnabled'], function(result) {
    toggle.checked = result.extensionEnabled !== false;
  });
  
  toggle.addEventListener('change', function() {
    chrome.storage.sync.set({
      extensionEnabled: toggle.checked
    });
  });
});