// sponsor context menu
function onMenuClick(info) {
  if(info.menuItemId == "sponsor") {
    chrome.tabs.create({url: "sponsor/index.html"});
  }
}
chrome.contextMenus.onClicked.addListener(onMenuClick);

function onInstall(e) {
  // if first install, open options page
  if(e && e.reason == "install") {
    const url = 'options.html?from=install';
    chrome.tabs.create({url});
  }

  // add context menu
  chrome.contextMenus.removeAll(function() {
    const context = {
      id: "sponsor",
      title: chrome.i18n.getMessage("sponsorContextMenu"),
      contexts: ["action"]
    };
    chrome.contextMenus.create(context);
  });
}
chrome.runtime.onInstalled.addListener(onInstall);