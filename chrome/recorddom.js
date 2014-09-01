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

function getCSSPath(e){
  var path = []

  // nodeType == 1 -- checking that is Element node
  for(; e && e.nodeType == 1; e = e.parentNode) {

    if(path.length >= 5){
      var s = path.join(" > ")
      var results = phantomFind(s);
      // If we already found a selector that works, return
      if(results.size() == 1){
        return path.join(" > ");
      }
    }

    var e_class = "";
    if($(e).attr('class') && $(e).attr('class').trim() != ""){
      e_class = "." + e.getAttribute('class').trim().replace(/\s+/g, '.');
    }

    var twins_count = $(e).siblings(e.localName.toLowerCase() + e_class).size();
    var sibs_count = $(e).siblings().size();

    i = $(e).index() + 1;

    var r = "";

    if (sibs_count == 0) {
      r += e.localName.toLowerCase();
    } else if (e_class != ""){
      r += e.localName.toLowerCase() + ":nth-child(" + i + ")" + e_class;
    } else {
      r += e.localName.toLowerCase() + ":nth-child(" + i + ")";
    }

    path.unshift(r);
  }
  return path.join(" > ");
}


function phantomFind(selector){
  var selectors = selector.split(' > ')
  var first = selectors.shift();
  var e = jQuery(first);
  selectors.forEach(function(selector){
    e = e.find(selector);
    if (e.size() == 0){
      return jQuery(null);
    }
  });

  return e;
}

