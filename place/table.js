// modified from https://github.com/susanschen/Pixel-Art-Maker

const table = document.getElementById('table');
const color = document.getElementById('colorPicker');

const url = 'https://stark-ridge-60794.herokuapp.com/';
//const url = 'http://127.0.0.1:3000/';

color.addEventListener("click", function(){});

const height = 32;
const width = 32;

var interactInterval = 0.5;
var lastInteractTime = 0;

var ignoreCell = { c: -1, r: -1, color: null }
var hoverCell = { c: -1, r: -1, cell: null };
var pixels = [];
var playerCount = 0;

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
        for (let c = 0; c < width; c++){
			const cell = row.insertCell(c);
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
		playerCount = JSON.parse(this.responseText);
		interactInterval = playerCount / 6;
		document.getElementById('playerCount').innerHTML = `${playerCount} active now`;
	});
	request.send();
}