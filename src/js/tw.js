import { colors, factionMap, top20Servers } from "./weekly.js";

const MAP_WIDTH = 28;
let generate = document.getElementById("generate");
let mapContainer = document.getElementById("map-container");
let originalData = [];

let fetcher = (url, server = 779, round = 0) => {
	fetch(url)
		.then((response) => response.json())
		.then((json) => {
			originalData = [...json];

			let sortedMap = adjusttMap(json, server);
			if (sortedMap) drawMap(sortedMap, server, round);
		});
};

window.onload = () => {
	let results = fetcher("./json/ud_2_round_0.json");
	//console.log(results);
	loadRounds();
};
function adjusttMap(res, server = 779) {
	let fullData = [];
	let validServer = res.filter((item) => item.sid === server);
	if (validServer.length < 1) {
		alert("Please enter valid server");
		return;
	}
	//loop to fill data missing 0 as coordinate
	for (let item of res) {
		let singleItem = item;
		singleItem.pos.x = !item.pos.x ? 0 : item.pos.x;
		singleItem.pos.y = !item.pos.y ? 0 : item.pos.y;
		fullData.push(singleItem);
	}
	let chosenServer = fullData.filter((item) => item.sid === server);
	let normalizedData = [];
	fullData.forEach((item) => {
		let singleItem = {};
		let subX = Number(item.pos.x - chosenServer[0].pos.x); //779= x6,y2, 2254 = x21, y17  diff x15,y15
		let subY = Number(item.pos.y - chosenServer[0].pos.y);

		//
		singleItem.pos = {};
		singleItem.pos.x = subX < 0 ? 28 + subX : subX;
		singleItem.pos.y = subY < 0 ? 28 + subY : subY;
		singleItem.sid = item.sid;
		singleItem.color = item.color;
		singleItem.msid = item.msid;

		normalizedData.push(singleItem);
	});

	return sortMap(normalizedData);
}

function drawMap(sortedMap, server = 779, udRound = 0) {
	//(x=8, y=23)
	for (let item of sortedMap) {
		item.pos.x = (item.pos.x + 13) % MAP_WIDTH;
		item.pos.y = (item.pos.y + 13) % MAP_WIDTH;
	}

	sortedMap = sortMap(sortedMap);
	let lastRow = sortedMap.filter((item) => item.pos.x === MAP_WIDTH - 1);
	let lastCol = sortedMap.filter((item) => item.pos.y === MAP_WIDTH - 1);
	sortedMap.unshift(...lastRow);
	lastCol.unshift(lastCol[lastCol.length - 1]);
	let count = 0;
	sortedMap.map((item, idx) => {
		if (idx % MAP_WIDTH === 0) {
			let cell = document.createElement("div");
			cell.className = "cell";
			cell.id = "s" + lastCol.sid;
			//cell.style.background = colors[lastCol[count].color % 10];
			cell.innerHTML = `<div>${lastCol[count].sid}</div>`;

			cell.innerHTML += `<span>F-${lastCol[count].msid}</span>`;
			mapContainer.appendChild(cell);
			count++;
		}
		let cell = document.createElement("div");
		cell.className = "cell";
		cell.id = "s" + item.sid;

		//Style top 20 faction leaders
		if (factionMap[udRound].server.includes(item.sid)) {
			cell.classList.add("top-faction");
		}

		//Style top 20 server
		if (top20Servers.includes(item.sid)) {
			cell.classList.add("top-server");
		}

		//cell.style.background = colors[item.color % 10];

		if (item.sid === server) {
			cell.classList.add("main-server");
		}
		cell.innerHTML = `<div>${item.sid}</div>`;
		cell.innerHTML += `<span>F-${item.msid}</span>`;

		mapContainer.appendChild(cell);
	});
}

function sortMap(normalizedData) {
	let data = [];
	for (let i = 0; i < MAP_WIDTH; i++) {
		data[i] = normalizedData.filter((item) => item.pos.x === i).sort(compare);
	}
	let fullSorted = [].concat.apply([], data);
	return fullSorted;
}

function compare(a, b) {
	return a.pos.y - b.pos.y;
}

function loadRounds() {
	let rounds = document.getElementById("rounds");
	factionMap.forEach((round) => {
		rounds.innerHTML += `<option class="opts" value=${round.round}>Round ${round.round}</option>`;
	});
}

let clearMap = () => {
	mapContainer.innerHTML = "";

	document.getElementById("top-faction").checked = false;
	document.getElementById("top-server").checked = false;
};
/******EVENTS********/
generate.addEventListener("click", () => {
	clearMap();
	let server = Number(document.getElementById("server").value);
	let round = document.getElementById("rounds").value;

	let url = factionMap[round].url;
	fetcher(url, server, round);
});

document.getElementById("top-faction").addEventListener("click", () => {
	let topFaction = document.querySelectorAll(".top-faction");
	topFaction.forEach((top) => top.classList.toggle("visible-tf"));
});

document.getElementById("top-server").addEventListener("click", () => {
	let topServer = document.querySelectorAll(".top-server");
	topServer.forEach((top) => top.classList.toggle("visible-ts"));
});
