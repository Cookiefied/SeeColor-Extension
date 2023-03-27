chrome.contextMenus.create({
	id: "seeColor",
	title: "Evaluate via SeeColor",
	contexts: ["image"]
  });
  
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId === "seeColor") {
		chrome.tabs.sendMessage(tab.id, {action: "seecolor"}, function(response) {
			chrome.windows.create({
				tabId: tab.id,
				type: "popup",
				height: 600,
				width: 350,
				url: "popup.html?imageUrl=" + encodeURIComponent(info.srcUrl)
			});
		});
	}
});
