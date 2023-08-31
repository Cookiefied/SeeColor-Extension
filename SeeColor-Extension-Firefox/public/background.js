browser.contextMenus.create({
	id: "seeColor",
	title: "Evaluate via SeeColor",
	contexts: ["image"]
  });
  
  browser.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId === "seeColor") {
		console.log("image selected")
		
		browser.windows.create({
			url: browser.extension.getURL("popup.html"),
			type: "popup",
			height: 600,
			width: 800
		  });
		browser.tabs.sendMessage(tab.id, {action: "seecolor"}, function(response) {
			browser.windows.create({
				tabId: tab.id,
				type: "popup",
				height: 600,
				width: 350,
				url: "popup.html?imageUrl=" + encodeURIComponent(info.srcUrl)
			});
		});
	}
});