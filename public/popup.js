document.addEventListener("DOMContentLoaded", function () {
	const urlParams = new URLSearchParams(window.location.search);
	const imageUrl = urlParams.get("imageUrl");
	if (imageUrl) {
		const img = document.createElement("img");
		img.src = imageUrl;
		document.getElementById("Result").appendChild(img);
	}
	
});
