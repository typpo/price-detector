chrome.runtime.onInstalled.addListener(
  function() {
    chrome.contextMenus.create({"title": "Track price",
                                "contexts":["all"],
                                "onclick": onClickHandler});
  });

function onClickHandler(info, tab) {
  chrome.tabs.sendRequest(tab.id, "getLastClickedDomPath",
    function(response) {
      console.log(response);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        var isSuccess = false;
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            console.log("Saved");
            isSuccess = true;
            // TODO: alert user action is complete.
          } else {
            console.log("Error" + xhr.statusText);
          }
        }

        //chrome.extension.sendMessage(
        //  {action: 'save', success: isSuccess, url: tab.url},
        //  function(){});
      };
      var params = 'user=judymou&url=' + encodeURIComponent(tab.url) +
                   '&selector=' + encodeURIComponent(response.selector);
      xhr.open('GET', 'http://127.0.0.1:3000/watch?' + params, true);
      xhr.send();
    });
};
