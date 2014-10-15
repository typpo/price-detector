var numUnreadNotice = 0;

chrome.runtime.onInstalled.addListener(
  function() {
    chrome.contextMenus.create({"title": "Track price",
                                "contexts":["all"],
                                "onclick": onClickHandler});
  });

function onClickHandler(info, tab) {
  chrome.tabs.sendRequest(tab.id, "getLastClickedDomPath", function(response) {
      console.log(response);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        var isSuccess = false;
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            console.log("Saved");
            isSuccess = true;
            numUnreadNotice++;
          } else {
            console.log("Error" + xhr.statusText);
          }
        }
        
        if (isSuccess) {
          if (numUnreadNotice > 0) {
            chrome.browserAction.setBadgeText({text: numUnreadNotice.toString()});
          }
        }
      };
      var params = 'user=judymou&url=' + encodeURIComponent(tab.url) +
                   '&selector=' + encodeURIComponent(response.selector);
      xhr.open('GET', 'http://127.0.0.1:3000/watch?' + params, true);
      xhr.send();
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if(request.action == "listWatches"){
    numUnreadNotice = 0;
    chrome.browserAction.setBadgeText({text: ""});

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      var isSuccess = false;
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          console.log("Received list of watches");
          isSuccess = true;
        } else {
          console.log("Error" + xhr.statusText);
        }
      }
      if (isSuccess) {
        var views = chrome.extension.getViews({type: "popup"});
        for (var i = 0; i < views.length; i++) {
          views[i].document.getElementById("watch_list").innerHTML= xhr.responseText;
        }
      }
    };
    var params = 'user=judymou';
    xhr.open('GET', 'http://127.0.0.1:3000/listWatches?' + params, true);
    xhr.send();
  }
});