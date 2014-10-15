document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({action: "listWatches"});
});