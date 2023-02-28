chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type === "logImageId") {
		const clickedElement = document.activeElement;
		if (clickedElement.tagName === "IMG") {
			console.log(clickedElement.id);
		}
	}
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId === "logImageId") {
		chrome.tabs.sendMessage(tab.id, { type: "logImageId" });
	}
});

chrome.runtime.sendMessage({
	type: "executeScript",
	script: "console.log('Hello from content script!');"
  });
  