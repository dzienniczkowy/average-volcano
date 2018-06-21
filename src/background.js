chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.match(/^https:\/\/(.)*\.(vulcan\.net\.pl|eszkola\.opolskie\.pl|edu\.gdansk\.pl|umt\.tarnow\.pl|resman\.pl|fakelog\.cf)\/([a-zA-Z0-9])*\/[a-z0-9]*\/Oceny(\.mvc)?\/Wszystkie(.)*/)) {
    chrome.pageAction.show(tab.id);
  }
});

chrome.pageAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript(tab.id, {file: "bookmarklet.js"});
});
