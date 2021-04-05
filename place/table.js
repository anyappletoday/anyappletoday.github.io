// modified from https://github.com/susanschen/Pixel-Art-Maker

const table = document.getElementById('table');
const color = document.getElementById("colorPicker");

const url = 'https://stark-ridge-60794.herokuapp.com/';
//const url = 'http://127.0.0.1:3000/';

color.addEventListener("click", function(){});

const height = 16;
const width = 16;

downloadGrid();

function downloadGrid() {
	var request = new XMLHttpRequest();
	request.open('GET', url + 'api/pixels/');
	request.addEventListener('load', function() {
		var pixels = JSON.parse(this.responseText);
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
			cell.setAttribute('style', `background-color: ${pixels[c + r * width]}`);
            cell.addEventListener("click", function() {
				fillSquare(cell, r, c);
			});
			cell.addEventListener("mouseover", mouseoverSquare);
			cell.addEventListener("mouseleave", mouseleaveSquare);
		}
    }
}

function clearGrid() {
    while (table.firstChild){
		table.removeChild(table.firstChild);
    }
}

function fillSquare(cell, r, c) {
	var http = new XMLHttpRequest();
	http.open('POST', url + 'api/pixels/' + c + '/' + r, true);
	http.setRequestHeader('Content-type', 'application/json');
	http.onload = function() {
		cell.setAttribute('style', `background-color: ${color.value}`);
		console.log(`Recieved: ${this.responseText}`);
	}

	let send = JSON.stringify({color: color.value});
	console.log(`Sending: ${send}`);
	http.send(send);
}

function mouseoverSquare() {
	this.id = 'mouseover-square';
}

function mouseleaveSquare() {
	this.id = 'normal-square';
}

var intervalId = window.setInterval(function() {
	downloadGrid();
}, 1000);