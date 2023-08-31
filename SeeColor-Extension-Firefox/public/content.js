browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if (msg.from === "popup" && msg.subject === "getImage") {
	  sendResponse({ imagePath: getImagePath() });
	}
  });
  
  function getImagePath() {
	var image = document.activeElement;
	console.log("image path = " + document.activeElement)
	if (image && image.tagName == "IMG") {
	  return image.src;
	} else {
	  return null;
	}
  }
  