chrome.contextMenus.create({
    "title": "SeeColor Test",
    "contexts": ["image"],
    "id": "imagesettings"
})

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId === "logImageId") {
	  chrome.tabs.executeScript(tab.id, {file: "content.js"}, function() {
		chrome.tabs.sendMessage(tab.id, { type: "logImageId" });
	  });
	}
  });
  
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type === "executeScript") {
	  chrome.tabs.executeScript(sender.tab.id, { code: message.script });
	}
  });
