// modified from https://github.com/susanschen/Pixel-Art-Maker

const table = document.getElementById('table');
const color = document.getElementById('colorPicker');

const url = 'https://stark-ridge-60794.herokuapp.com/';

color.addEventListener("click", function(){});

const height = 32;
const width = 32;
const interactInterval = 0.5;

var lastInteractTime = 0;

var ignoreCell = { c: -1, r: -1, color: null }
var hoverCell = { c: -1, r: -1, cell: null };
var pixels = [];

var drawGrid = true;

getGrid();
getPlayerCount();

window.setInterval(() => { getGrid(); }, 500);
window.setInterval(() => { renderProgress(); }, 10);
window.setInterval(() => { getPlayerCount(); }, 15000);

function getGrid() {
	var request = new XMLHttpRequest();
	request.open('GET', url + 'api/pixels/');
	request.addEventListener('load', function() {
		pixels = JSON.parse(this.responseText);
		makeGrid(pixels);
	});
	request.send();
}

function makeGrid(pixels) {
	clearGrid();
	let i = 0;
	for (let r = 0; r < height; r++){
		const row = table.insertRow(r);
		if(drawGrid) {
			row.classList.add('borderless-cell');
		}
        for (let c = 0; c < width; c++){
			const cell = row.insertCell(c);
			if(drawGrid) {
				cell.classList.add('borderless-cell');
			}
			if(ignoreCell.c === c && ignoreCell.r === r) {
				cell.setAttribute('style', `background-color: ${ignoreCell.color}`);
				ignoreCell = { c: -1, r: -1, color: null };
			} else {
				cell.setAttribute('style', `background-color: ${pixels[c + r * width]}`);
			}
			cell.addEventListener("click", function() {
				fillSquare(cell, r, c);
			});
			cell.addEventListener("mouseover", function() {
				mouseoverSquare(cell, r, c);
			});
			cell.addEventListener("mouseleave", function() {
				mouseleaveSquare(cell, r, c);
			});
		}
    }
}

function clearGrid() {
    while (table.firstChild){
		table.removeChild(table.firstChild);
    }
}

function fillSquare(cell, r, c) {
	if(picking) return stopPicking();
	if(!canInteract()) return;

	lastInteractTime = getTotalSeconds();
	cell.setAttribute('style', `background-color: ${color.value}`);
	var http = new XMLHttpRequest();
	http.open('POST', url + 'api/pixels/' + c + '/' + r, true);
	http.setRequestHeader('Content-type', 'application/json');
	ignoreCell = {c: c, r: r, color: color.value};

	let send = JSON.stringify({color: color.value});
	console.log(`Sending: ${send}`);
	http.send(send);

	if(hoverCell.c != -1 && hoverCell.r != -1) {
		hoverCell.cell.id = 'normal-square';
	}

	couldInteract = false;
}

function mouseoverSquare(cell, r, c) {
	hoverCell = {c: c, r: r, cell: cell};
	if(picking) {
		setPickColor(r, c);
	}

	if(!canInteract()) return;
	cell.id = 'mouseover-square';
}

function mouseleaveSquare(cell, r, c) {
	hoverCell = {c: -1, r: -1, cell: null};
	cell.id = 'normal-square';
}

function canInteract() {
	return lastInteractTime < getTotalSeconds() - interactInterval;
}

function getTotalSeconds() {
	return new Date().getTime() / 1000;
}

var couldInteract = false;

function renderProgress() {
	var progressBar = document.getElementById('progressBar')
	progressBar.style.width = (Math.min((getTotalSeconds() - lastInteractTime) * 100 / interactInterval, 100)) + "%";

	if(canInteract() && !couldInteract) {
		couldInteract = true;
		if(hoverCell.c != -1 && hoverCell.r != -1) {
			hoverCell.cell.id = 'mouseover-square';
		}
	}
}

function getPlayerCount() {
	var request = new XMLHttpRequest();
	request.open('GET', url + 'api/playercount/');
	request.addEventListener('load', function() {
		var playerCount = JSON.parse(this.responseText);
		document.getElementById('playerCount').innerHTML = `${playerCount} active now`;
	});
	request.send();
}

var picking = false
var pickColor = '#FFFFFF'

function togglePicking() {
	picking = !picking
}

function stopPicking() {
	picking = false
}

function setPickColor(r, c) {
	pickColor = pixels[c + r * width]
	color.value = pickColor;
	console.log(pickColor);
	//document.getElementById('colorPreview').setAttribute('style', `background-color: ${pickColor}`)
}

if (document.addEventListener) {
	document.addEventListener('contextmenu', function(e) {
		onRightClick();
		e.preventDefault();
	}, false);
} else {
	document.attachEvent('oncontextmenu', function() {
		onRightClick();
		window.event.returnValue = false;
	});
}

function onRightClick() {
	if(hoverCell.cell == null) return;
	setPickColor(hoverCell.r, hoverCell.c)
	stopPicking()
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function validateDrawGrid() {
	drawGrid = document.getElementByName("draw_grid").checked;
}