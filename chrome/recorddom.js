var lastClickedDom = null;

function onMouseDown(evt) {
  lastClickedDom = document.elementFromPoint(evt.clientX, evt.clientY);
}
window.addEventListener("mousedown", onMouseDown, true);

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request == "getLastClickedDomPath") {
      // TODO: get dom path from lastClickedDom.
      sendResponse({selector: "dummyselector"});
    }
  });
