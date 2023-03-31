document.addEventListener("DOMContentLoaded", function () {
	const urlParams = new URLSearchParams(window.location.search);
	const imageUrl = urlParams.get("imageUrl");
	if (imageUrl) {
		const img = document.createElement("img");
		img.src = imageUrl;
		document.getElementById("evalImage").appendChild(img);
		// Define your function that takes the image URL as a parameter
		img.onload = function () {

			const image = img;
			// Set the canvas size to be the same as of the loaded image
			const canvas = document.createElement("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0);

			/**
			 * getImageData returns an array full of RGBA values
			 * each pixel consists of four values: the red value of the colour, the green, the blue and the alpha
			 * (transparency). For array value consistency reasons,
			 * the alpha is not from 0 to 1 like it is in the RGBA of CSS, but from 0 to 255.
			 */
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			// Convert the image data to RGB values so it's much simpler
			const rgbArray = buildRgb(imageData.data);

			/**
			 * Color quantization
			 * A process that reduces the number of colors used in an image
			 * while trying to visually maintain the original image as much as possible
			 */
			const quantColors = quantization(rgbArray, 0);
			const ratings = contrastTest(quantColors);

			const imgHeight = document.getElementsByTagName("img")[2].height
			console.log(imgHeight)
			window.resizeBy((window.innerWidth / 3.5), (imgHeight / 2));
			// height + 155 is resize size
			// Reset chart
			//chartReset = 1;
		} // image.onload
	} // if
});


//from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js  
//build an array of rgb objects, and return iy
const buildRgb = (imageData) => {
	const rgbValues = [];
	// note that we are loopin every 4!
	// for every Red, Green, Blue and Alpha
	for (let i = 0; i < imageData.length; i += 4) {
	const rgb = {r: imageData[i], g: imageData[i + 1], b: imageData[i + 2],};

	rgbValues.push(rgb);
	}

	return rgbValues;
};


//from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js  
//quantize with median cut
const quantization = (rgbValues, depth) => {
	const MAX_DEPTH = 4;

	// Base case
	if (depth === MAX_DEPTH || rgbValues.length === 0) {
	const color = rgbValues.reduce(
		(prev, curr) => {
		prev.r += curr.r;
		prev.g += curr.g;
		prev.b += curr.b;

		return prev;
		},
		{
		r: 0,
		g: 0,
		b: 0,
		}
	);

	color.r = Math.round(color.r / rgbValues.length);
	color.g = Math.round(color.g / rgbValues.length);
	color.b = Math.round(color.b / rgbValues.length);

	return [color];
	}

	/**
	 *  Recursively do the following:
	 *  1. Find the pixel channel (red,green or blue) with biggest difference/range
	 *  2. Order by this channel
	 *  3. Divide in half the rgb colors list
	 *  4. Repeat process again, until desired depth or base case
	 */
	const componentToSortBy = findBiggestColorRange(rgbValues);
	rgbValues.sort((p1, p2) => {
	return p1[componentToSortBy] - p2[componentToSortBy];
	});

	const mid = rgbValues.length / 2;
	return [
	...quantization(rgbValues.slice(0, mid), depth + 1),
	...quantization(rgbValues.slice(mid + 1), depth + 1),
	];
};

//from https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
// returns what color channel has the biggest difference
const findBiggestColorRange = (rgbValues) => {
	/**
	 * Min is initialized to the maximum value posible
	 * from there we procced to find the minimum value for that color channel
	 *
	 * Max is initialized to the minimum value posible
	 * from there we procced to fin the maximum value for that color channel
	 */
	let rMin = Number.MAX_VALUE;
	let gMin = Number.MAX_VALUE;
	let bMin = Number.MAX_VALUE;

	let rMax = Number.MIN_VALUE;
	let gMax = Number.MIN_VALUE;
	let bMax = Number.MIN_VALUE;

	rgbValues.forEach((pixel) => {
	rMin = Math.min(rMin, pixel.r);
	gMin = Math.min(gMin, pixel.g);
	bMin = Math.min(bMin, pixel.b);

	rMax = Math.max(rMax, pixel.r);
	gMax = Math.max(gMax, pixel.g);
	bMax = Math.max(bMax, pixel.b);
	});

	const rRange = rMax - rMin;
	const gRange = gMax - gMin;
	const bRange = bMax - bMin;

	// determine which color has the biggest difference
	const biggestRange = Math.max(rRange, gRange, bRange);
	if (biggestRange === rRange) {
	return "r";
	} else if (biggestRange === gRange) {
	return "g";
	} else {
	return "b";
	}
};


//from https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
//sorts array of objects by key
//modified to go in descending order
function sortByKey(array, key) {
	return array.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	});
}

//from https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
//return luminance of an rgb value
function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928
			? v / 12.92
			: Math.pow( (v + 0.055) / 1.055, 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}


//test contrast of image
const contrastTest = (rgbTestValues) =>{
	//stores rgb pairs and their contrast
	let ratios = [];
	let skip = false;
	
	//get the luminance of every value pair
	for (let i = 0; i < rgbTestValues.length; i++){
	const lumOne = luminance(rgbTestValues[i].r,rgbTestValues[i].g, rgbTestValues[i].b);

	for(let j = i + 1; j < rgbTestValues.length; j++){
		//if values are the same, skip this iteration of loop
		if (rgbTestValues[i].r == rgbTestValues[j].r && rgbTestValues[i].g == rgbTestValues[j].g && rgbTestValues[i].b == rgbTestValues[j].b){
		continue;
		}

		//check if pair has all ready been added
		for (let k = 0; k < ratios.length; k++){
		if (ratios[k].colour1.r == rgbTestValues[i].r && ratios[k].colour1.g == rgbTestValues[i].g && ratios[k].colour1.b == rgbTestValues[i].b &&
			ratios[k].colour2.r == rgbTestValues[j].r && ratios[k].colour2.g == rgbTestValues[j].g && ratios[k].colour2.b == rgbTestValues[j].b
			|| 
			ratios[k].colour1.r == rgbTestValues[j].r && ratios[k].colour1.g == rgbTestValues[j].g && ratios[k].colour1.b == rgbTestValues[j].b &&
			ratios[k].colour2.r == rgbTestValues[i].r && ratios[k].colour2.g == rgbTestValues[i].g && ratios[k].colour2.b == rgbTestValues[i].b) {
			skip = true;
			}
		}

		if(Math.abs(rgbTestValues[i].r - rgbTestValues[j.r]) <= 10 || Math.abs(rgbTestValues[i].g - rgbTestValues[j].g) <= 10 || Math.abs(rgbTestValues[i].b - rgbTestValues[j].b) <=10){
			skip = true;
		}

	//if it has been, skip adding again
	//if not, add it
	if (!skip){

		const lumTwo = luminance(rgbTestValues[j].r,rgbTestValues[j].g, rgbTestValues[j].b);

		//use luminance to calculate contrast
	const ratio = lumOne > lumTwo 
	? ((lumTwo  + 0.05) / (lumOne + 0.05))
	: ((lumOne + 0.05) / (lumTwo  + 0.05));

	//add pair
		const ratioAndColours = {
		colour1: rgbTestValues[i],
		colour2: rgbTestValues[j],
		contrastRatio: ratio,
		};
		
		ratios.push(ratioAndColours);
		}

		//set skip back
		skip = false;
	}
	}

	//ratios =  ratios.sort(function(a,b){
	//  return a.contrastRatio - b.contrastRatio;
	//})

	ratios = sortByKey(ratios, 'contrastRatio');

	//display all value pairs and their contrast
	let mContrast = 0;
	let pdContrast = 0;
	let tContrast = 0;

	mContrast = printContrasts(ratios);
	pdContrast = printPD(ratios);
	tContrast = printT(ratios);
	
	//print results
	document.getElementById("Results").style.display = "block";
	document.getElementById("Instructions").style.display = "none";
	document.getElementById("SeeColor logo").style.display = "none";
	console.log("Monochromacy: " + mContrast * 100)
	document.getElementById("MonoChromacy").innerHTML = "MonoChromacy: " + (mContrast * 100);
	console.log("Protanopia/Deuteranopia: " + pdContrast * 100)
	document.getElementById("Protanopia/Deuteranopia").innerHTML = "Protanopia/Deuteranopia: " + (pdContrast * 100);
	console.log("Tritanopia: " + tContrast * 100)
	document.getElementById("Tritanopia").innerHTML = "Tritanopia: " + (tContrast * 100);

//printChart(mContrast, pdContrast, tContrast);
}

/*const printChart = (mContrast, pdContrast, tContrast) => {
	const ctx = document.getElementById('resultsChart');
	Chart.defaults.font.size = 20;
	Chart.defaults.set('plugins.datalabels', {
	color: '#F9F9F9',
		font: {
			weight: 'bold'
		},
		formatter: Math.round
	});

	const chartStatus = Chart.getChart('resultsChart'); if (chartStatus !== undefined) { chartStatus.destroy(); }

resultsChart = new Chart(ctx, {
	type: 'bar',
	data: {
		labels: ['MonoChromacy', 'Protanopia/Deuteranopia', 'Tritanopia'],
		datasets: [{
			label:"rating",
			data: [mContrast * 100, pdContrast * 100, tContrast * 100],
			backgroundColor: [
				'rgba(0, 133, 62, 1.0)'
			],
			borderColor: [
				'rgba(0, 0, 0, 1)',
				'rgba(0, 0, 0, 1)',
				'rgba(0, 0, 0, 1)'
			],
			borderWidth: 2,
		}],
		datalabels: {
			align: 'end',
			anchor: 'start',
		}
	},
	
	plugins: [ChartDataLabels],
	options: {
		datalabels: {
		color: 'white',
		font: {
			weight: 'bold'
		},
		formatter: Math.round
		},
		
		scales: {
		y: {
			suggestedMin: 0,
			suggestedMax: 100
		}
	},
		
		layout:{
			padding: 2
		},
		plugins:{
			title:{
			display:true,
			text:"Contrast Ratings - High values indicate less contrast",
			}
		},
		responsive: true,
		maintainAspectRatio: true
	}
	});
}
*/

//decide which tests the colours will display for
const getColourRange = (hue) =>{

	if(hue.sat < 15){
	return 'NA';
	}
	
	//ranges might need adjusted
	//red
	if(hue.hue > 320 || hue.hue < 11 ){
	return 'PD';
	}
	//green
	else if(hue.hue < 170 && hue.hue > 80){
	return 'PD';
	}
	//yellow
	else if (hue.hue > 40 && hue.hue < 81){
	return 'PDT';
	}
	//blue
	else if(hue.hue > 169 && hue.hue < 281){
	return 'T';
	}
	else {
	return 'NA';
	}
}

//print protanopia and deuteranopia results
const printPD = (ratios) =>{

	const pdresultsContainer = document.getElementById("pdresults");
	//pdresultsContainer.innerHTML = "";

	const numRatiosToPrint = ratios.length;

	let foundNone = true;
	let pdContrast = 0;

	for (let i = 0; i < numRatiosToPrint; i += 1){

	//get hue of both colour
	let hue1 = rgb_to_h(ratios[i].colour1.r, ratios[i].colour1.g, ratios[i].colour1.b);
	let hue2 = rgb_to_h(ratios[i].colour2.r, ratios[i].colour2.g, ratios[i].colour2.b);

	//decide which tests the colours will display for
	let range1 = getColourRange(hue1);
	let range2 = getColourRange(hue2);

	if((range1 == 'PD' || range1 == 'PDT') && (range2 == 'PD' || range2 == 'PDT')){
		foundNone = false;
	}
	else {
		continue;
	}

	if(ratios[i].contrastRatio > pdContrast){
		pdContrast = ratios[i].contrastRatio;
	}

	//create test result elements
	const contrastElement = document.createElement("div");
	const colour1Element = document.createElement("div");
	const colour2Element = document.createElement("div");
	const WCAGElementAAL = document.createElement("div");
	const WCAGElementAAS = document.createElement("div");
	const WCAGElementAAAL = document.createElement("div");
	const WCAGElementAAAS = document.createElement("div");
	contrastElement.appendChild(document.createTextNode(ratios[i].contrastRatio.toFixed(5)));

	//get results of WCAG tests
				const resultWCAGAAL = `
				AA-level large text: ${ratios[i].contrastRatio < 1/3 ? 'PASS' : 'FAIL' } `;
				const resultWCAGAAS = `
				AA-level small text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' } `;
				const resultWCAGAAAL = `
				AAA-level large text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' }  `;
				const resultWCAGAAAS = `
				AAA-level small text: ${ratios[i].contrastRatio < 1/7 ? 'PASS' : 'FAIL' }`;


	//display wcag results
	WCAGElementAAL.appendChild(document.createTextNode(resultWCAGAAL));
	WCAGElementAAS.appendChild(document.createTextNode(resultWCAGAAS));
	WCAGElementAAAL.appendChild(document.createTextNode(resultWCAGAAAL));
	WCAGElementAAAS.appendChild(document.createTextNode(resultWCAGAAAS));

	//display hex colours
	const hex1 = rgbToHex(ratios[i].colour1);
	const hex2= rgbToHex(ratios[i].colour2);
	colour1Element.style.backgroundColor = hex1;
	colour1Element.style.color = textToLight(hex1, '#F9F9F9', '#000000');
	colour2Element.style.backgroundColor = hex2;
	colour2Element.style.color = textToLight(hex2, '#F9F9F9', '#000000');
	colour1Element.appendChild(document.createTextNode(hex1));
	colour2Element.appendChild(document.createTextNode(hex2));


	
	//pdresultsContainer.appendChild(contrastElement);
	//pdresultsContainer.appendChild(WCAGElementAAL);
	//pdresultsContainer.appendChild(WCAGElementAAS);
	//pdresultsContainer.appendChild(WCAGElementAAAL);
	//pdresultsContainer.appendChild(WCAGElementAAAS);
	//pdresultsContainer.appendChild(colour1Element);
	//pdresultsContainer.appendChild(colour2Element);
	
	}

	//write na if there are no applicable colours
	if (foundNone == true){
	const naElement = document.createElement("div");
	naElement.appendChild(document.createTextNode("NA"));
	//pdresultsContainer.appendChild(naElement);
	return 0;
	}
	else {
	return pdContrast;
	}
}

//print the tritanopia results
const printT = (ratios) =>{

	const tresultsContainer = document.getElementById("tresults");
	//tresultsContainer.innerHTML = "";

	const numRatiosToPrint = ratios.length;

	let foundNone = true;
	let tContrast = 0;

	for (let i = 0; i < numRatiosToPrint; i += 1){

	//get hue of both colours
	let hue1 = rgb_to_h(ratios[i].colour1.r, ratios[i].colour1.g, ratios[i].colour1.b);
	let hue2 = rgb_to_h(ratios[i].colour2.r, ratios[i].colour2.g, ratios[i].colour2.b);

	//decide which tests the colours will display for
	let range1 = getColourRange(hue1);
	let range2 = getColourRange(hue2);

	if((range1 == 'T' || range1 == 'PDT') && (range2 == 'T' || range2 == 'PDT')){
		foundNone = false;
	}
	else {
		continue;
	}

	if(ratios[i].contrastRatio > tContrast){
		tContrast = ratios[i].contrastRatio;
	}

	//create test result elements
	const contrastElement = document.createElement("div");
	const colour1Element = document.createElement("div");
	const colour2Element = document.createElement("div");
	const WCAGElementAAL = document.createElement("div");
	const WCAGElementAAS = document.createElement("div");
	const WCAGElementAAAL = document.createElement("div");
	const WCAGElementAAAS = document.createElement("div");
	contrastElement.appendChild(document.createTextNode(ratios[i].contrastRatio.toFixed(5)));

	//get results of WCAG tests
				const resultWCAGAAL = `
				AA-level large text: ${ratios[i].contrastRatio < 1/3 ? 'PASS' : 'FAIL' } `;
				const resultWCAGAAS = `
				AA-level small text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' } `;
				const resultWCAGAAAL = `
				AAA-level large text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' }  `;
				const resultWCAGAAAS = `
				AAA-level small text: ${ratios[i].contrastRatio < 1/7 ? 'PASS' : 'FAIL' }`;


	//display wcag results
	WCAGElementAAL.appendChild(document.createTextNode(resultWCAGAAL));
	WCAGElementAAS.appendChild(document.createTextNode(resultWCAGAAS));
	WCAGElementAAAL.appendChild(document.createTextNode(resultWCAGAAAL));
	WCAGElementAAAS.appendChild(document.createTextNode(resultWCAGAAAS));

	//display hex colours
	const hex1 = rgbToHex(ratios[i].colour1);
	const hex2= rgbToHex(ratios[i].colour2);
	colour1Element.style.backgroundColor = hex1;
	colour1Element.style.color = textToLight(hex1, '#F9F9F9', '#000000');
	colour2Element.style.backgroundColor = hex2;
	colour2Element.style.color = textToLight(hex2, '#F9F9F9', '#000000');
	colour1Element.appendChild(document.createTextNode(hex1));
	colour2Element.appendChild(document.createTextNode(hex2));

	
		//tresultsContainer.appendChild(contrastElement);
		//tresultsContainer.appendChild(WCAGElementAAL);
		//tresultsContainer.appendChild(WCAGElementAAS);
		//tresultsContainer.appendChild(WCAGElementAAAL);
		//tresultsContainer.appendChild(WCAGElementAAAS);
		//tresultsContainer.appendChild(colour1Element);
		//tresultsContainer.appendChild(colour2Element);
	}

	//write na if there are no applicable colours
	if (foundNone == true){
	const naElement = document.createElement("div");
	naElement.appendChild(document.createTextNode("NA"));
	//tresultsContainer.appendChild(naElement);
	return 0;
	}
	else{
	return tContrast;
	}

}

//make new elements for each contrast ratio and hex colour
//add them to the web page
const printContrasts = (ratios) =>{
	const mresultsContainer = document.getElementById("mresults");
	//mresultsContainer.innerHTML = "";

	
	//number of contrast ratios and rgb pairs to print
	//equal to ratios.length for full array
	//may be made into parametre
	const numRatiosToPrint = 10;

	let mContrast = 0;

	for (let i = 0; i < numRatiosToPrint, i < ratios.length; i += 1){

	if(ratios[i].contrastRatio > mContrast){
		mContrast = ratios[i].contrastRatio;
	}



	//create test result elements
	const contrastElement = document.createElement("div");
	const colour1Element = document.createElement("div");
	const colour2Element = document.createElement("div");
	const WCAGElementAAL = document.createElement("div");
	const WCAGElementAAS = document.createElement("div");
	const WCAGElementAAAL = document.createElement("div");
	const WCAGElementAAAS = document.createElement("div");
	contrastElement.appendChild(document.createTextNode(ratios[i].contrastRatio.toFixed(5)));

	//get results of WCAG tests
				const resultWCAGAAL = `
				AA-level large text: ${ratios[i].contrastRatio < 1/3 ? 'PASS' : 'FAIL' } `;
				const resultWCAGAAS = `
				AA-level small text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' } `;
				const resultWCAGAAAL = `
				AAA-level large text: ${ratios[i].contrastRatio < 1/4.5 ? 'PASS' : 'FAIL' }  `;
				const resultWCAGAAAS = `
				AAA-level small text: ${ratios[i].contrastRatio < 1/7 ? 'PASS' : 'FAIL' }`;


	//display wcag results
	WCAGElementAAL.appendChild(document.createTextNode(resultWCAGAAL));
	WCAGElementAAS.appendChild(document.createTextNode(resultWCAGAAS));
	WCAGElementAAAL.appendChild(document.createTextNode(resultWCAGAAAL));
	WCAGElementAAAS.appendChild(document.createTextNode(resultWCAGAAAS));

	//display hex colours
	const hex1 = rgbToHex(ratios[i].colour1);
	const hex2= rgbToHex(ratios[i].colour2);
	colour1Element.style.backgroundColor = hex1;
	colour1Element.style.color = textToLight(hex1, '#F9F9F9', '#000000');
	colour2Element.style.backgroundColor = hex2;
	colour2Element.style.color = textToLight(hex2, '#F9F9F9', '#000000');
	colour1Element.appendChild(document.createTextNode(hex1));
	colour2Element.appendChild(document.createTextNode(hex2));

	//add everything to containers
		//mresultsContainer.appendChild(contrastElement);
		//mresultsContainer.appendChild(WCAGElementAAL);
		//mresultsContainer.appendChild(WCAGElementAAS);
		//mresultsContainer.appendChild(WCAGElementAAAL);
		//mresultsContainer.appendChild(WCAGElementAAAS);
		//mresultsContainer.appendChild(colour1Element);
		//mresultsContainer.appendChild(colour2Element);
	}

	return mContrast;
}



//from https://github.com/zygisS22/color-palette-extraction/blob/master/index.js  
//  Convert each pixel value ( number ) to hexadecimal ( string ) with base 16
const rgbToHex = (pixel) => {
	const componentToHex = (c) => {
	const hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
	};

	return ("#" + componentToHex(pixel.r) + componentToHex(pixel.g) + componentToHex(pixel.b)).toUpperCase();
};

// determines if the result text should be black or white based on the luminence of the background color
function textToLight (bgColor, lightColor, darkColor) {
	var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
	var r = parseInt(color.substring(0, 2), 16); // hexToR
	var g = parseInt(color.substring(2, 4), 16); // hexToG
	var b = parseInt(color.substring(4, 6), 16); // hexToB
	var L = luminance(r, g, b);
	return (L > 0.179) ? darkColor : lightColor; // 0.179 is from https://www.w3.org/TR/WCAG20/ 
}

//from https://www.geeksforgeeks.org/program-change-rgb-color-model-hsv-color-model/
//returns hue value from an rgb value
function rgb_to_h(r , g , b) {

	// R, G, B values are divided by 255
	// to change the range from 0..255 to 0..1
	r = r / 255.0;
	g = g / 255.0;
	b = b / 255.0;

	// h, s, v = hue, saturation, value
	var cmax = Math.max(r, Math.max(g, b)); // maximum of r, g, b
	var cmin = Math.min(r, Math.min(g, b)); // minimum of r, g, b
	var diff = cmax - cmin; // diff of cmax and cmin.
	var h = -1, s = -1;

	// if cmax and cmax are equal then h = 0
	if (cmax == cmin)
		h = 0;

	// if cmax equal r then compute h
	else if (cmax == r)
		h = (60 * ((g - b) / diff) + 360) % 360;

	// if cmax equal g then compute h
	else if (cmax == g)
		h = (60 * ((b - r) / diff) + 120) % 360;

	// if cmax equal b then compute h
	else if (cmax == b)
		h = (60 * ((r - g) / diff) + 240) % 360;

	// if cmax equal zero
	if (cmax == 0)
	s = 0;
	else
	s = (diff / cmax) * 100;

	const hs = {
	hue: h,
	sat: s,
	};

	return hs;
}