chrome.contextMenus.create({
	title: "SeeColor Extension",
	contexts: ['image'],
	documentUrlPatterns: ['*://*/*.jpg', '*://*/*.jpeg', '*://*/*.png', '*://*/*.gif'],
	onclick: (info, tab) => {
	  console.log("Context menu clicked!", info, tab);
	  // Add your custom code here to handle the context menu action
	},
  });
  
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		title: "SeeColor Extension",
		contexts: ["page", "selection", "link"],
		onclick: (info, tab) => {
		console.log("Context menu clicked!", info, tab);
		// Add your custom code here to handle the context menu action
		},
	});
});
  
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.type === 'myCustomMessage') {
	  // Do something with the message data here
	}
  });
  