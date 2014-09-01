chrome.extension.onMessage.addListener(
  function(msg, sender, sendResponse) {
    if (!msg.popup) return;
    window.alert("Updating popup.html....");
    if (msg.action == 'save') {
      if (msg.success) {
        document.getElementById("status").innerHTML = "Saved " + msg.url;
      } else {
        document.getElementById("status").innerHTML
          = "Unable to save " + msg.url;
      }
    }
  });
