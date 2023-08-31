chrome.runtime.sendMessage({ type: 'myCustomMessage', data: { foo: 'bar' } }, function(response) {
	// Handle the response from the background script here, if any
  });
  