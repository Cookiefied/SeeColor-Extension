function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

browser.menus.ContextType({
  id: "open-sidebar",
  title: browser.i18n.getMessage("menuItemOpenSidebar"),
  contexts: ["all"],
  command: "_execute_sidebar_action"
}, onCreated);

browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
      case "open-sidebar":
        console.log("Opening my sidebar");
        break;
  }
});

document.getElementById('upload-btn').addEventListener('click', function() {
  // Open the file picker dialog
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function() {
    let file = input.files[0];
    if (file) {
      // Process the uploaded image file and open it in a new tab
      handleImageUpload(file);
    }
  };
  input.click();
});


function handleImageUpload(file) {
  // Read the file as a data URL
  let reader = new FileReader();
  reader.onload = function() {
    let imageData = reader.result;
    // Open the uploaded image in a new tab
    browser.tabs.create({
      url: imageData,
      active: true
    });
  };
  reader.readAsDataURL(file);
}

const fileInput = document.getElementById("myFileInput");

fileInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];
  console.log(`Selected file: ${selectedFile.name}`);
  browser.tabs.create({
    url: event.target.files[0],
    active: true
  });
  // Do something with the selected file
  reader.readAsDataURL(file);
});
