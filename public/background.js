console.log("SeeColor extension loaded");
browser.tabs.onCreated({
	browser.menus.create({
		id: "SeeColor",
		title: "Evaluate via SeeColor",
		contexts: ["image"]
  	})
});

  
  
