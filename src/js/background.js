chrome.pageAction.onClicked.addListener(function (tab) {
  chrome.tabs.executeScript(null, {
    file: 'js/embed.js'
  });
});


// Only show page_action on YouTube if the video is restricted
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      actions: [ new chrome.declarativeContent.ShowPageAction() ],
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostContains: '.youtube.com',
            pathEquals: '/watch',
            queryContains: 'v='
          }
        })
      ]
    }]);
  });
});
