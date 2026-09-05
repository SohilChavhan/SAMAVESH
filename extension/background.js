chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-with-luna",
    title: "Translate with LUNA",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-with-luna" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "translateText",
      text: info.selectionText
    });
  }
});
