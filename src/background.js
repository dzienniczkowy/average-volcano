chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.match(/^https:\/\/(.)*\.vulcan\.net\.pl\/([a-z0-9])*\/[a-z0-9]*\/Oceny(\.mvc)?\/Wszystkie(.)*/)) {
    chrome.pageAction.show(tab.id);
    chrome.pageAction.setIcon({tabId: tab.id, path: "icon-48.png"});
    chrome.pageAction.setTitle({tabId: tab.id, title: "Oblicz średnią"});
    chrome.pageAction.show(tab.id);
  }
});

chrome.pageAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(tab.id, {file: "bookmarklet.js"})
});
