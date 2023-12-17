import { colors, factionMap, top20Servers } from "./weekly.js";
import { compare, clearMap, getID, clearElement } from "./helper.js";

const MAP_WIDTH = 28;
let generate = getID("generate");
let mapContainer = getID("map-container");
let factions = [];
let originalData = [];
let heatMapArray = [];
let largestFactionCount;
let fetcher = async (url, server = 779, round = 0) => {
	await fetch(url)
		.then((response) => response.json())
		.then((json) => {
			originalData = [...json];
			factions = originalData.filter((item) => item.msid === item.sid);
			getID("total-factions").innerHTML = `Total Factions: ${factions.length}`;
			let sortedMap = adjusttMap(json, server);
			if (sortedMap) drawMap(sortedMap, server, round);

			largestFactionCount = getLargestFactionCount();
			prepareHeatMap();
		});
};

window.onload = async () => {
	let round = factionMap.length - 1;
	await fetcher(`./json/ud_2_round_${round}.json`, 779, round);
	loadRounds();
	largestFactionCount = getLargestFactionCount();
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
		singleItem.isRebel = item.isRebel;

		normalizedData.push(singleItem);
	});

	return sortMap(normalizedData);
}

function getMsidCount(msid) {
	let count = originalData.reduce((acc, cur) => {
		if (cur.msid === msid) acc++;
		return acc;
	}, 0);
	return count;
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
	//sortedMap.unshift(...lastRow);
	//lastCol.unshift(lastCol[lastCol.length - 1]);
	//lastRow.unshift(lastRow[lastRow.length - 1]);
	let count = 0;
	drawCell(lastRow[lastRow.length - 1], server, udRound, "ab");
	lastRow.forEach((item) => {
		drawCell(item, server, udRound, "b");
	});
	sortedMap.map((item, idx) => {
		//repeat last col to draw as first col

		if (idx % MAP_WIDTH === 0) {
			drawCell(lastCol[count], server, udRound, "a");
			count++;
		}
		//draw remaining cells
		drawCell(item, server, udRound);
	});
}

function drawCell(item, server, udRound, secondID = "") {
	let cell = document.createElement("div");
	cell.className = "cell";
	cell.id = `s${item.sid}${secondID}`;

	colorCells(item, cell, udRound);
	//let subFaction = item.sid !== item.msid ? "class ='sub-faction'" : "";

	cell.innerHTML = `<div >${item.msid}</div> <span>#${item.sid}</span>`;

	if (item.isRebel) {
		cell.classList.add("rebel");
	}

	mapContainer.appendChild(cell);
}

function colorCells(item, cellDiv, udRound) {
	//Style top 20 faction leaders
	let server = Number(getID("server").value);
	if (factionMap[udRound].server.includes(item.sid))
		cellDiv.classList.add("top-faction");

	//Style top 20 server
	if (top20Servers.includes(item.sid)) cellDiv.classList.add("top-server");

	let count = getMsidCount(item.msid);

	//faction leader
	if (item.sid === item.msid && count > 1)
		cellDiv.style.background = `radial-gradient(circle, rgba(255, 255, 255, 0) 0%, ${
			colors[item.color]
		} 100%)`;

	//faction subordinates
	if (item.sid !== item.msid && count > 1)
		cellDiv.style.background = colors[item.color];

	//if color data is not assigned on the json, assign color for the faction
	if (!item.color && count > 1) {
		cellDiv.style.background = colors[7];
		if (item.msid === item.sid)
			cellDiv.style.background = `radial-gradient( circle, rgba(255, 255, 255, 0) 0%, ${colors[7]} 100% )`;
	}
	if (count === 1 && item.msid === item.sid) cellDiv.style.background = "#fff";
	if (item.sid === server) cellDiv.classList.add("main-server");
}

function loadRounds() {
	let rounds = getID("rounds");
	factionMap.forEach((round, idx) => {
		let selected = factionMap.length - 1 === idx ? 'selected="selected"' : "";
		rounds.innerHTML += `<option class="opts" ${selected} value=${round.round}>Round ${round.round}</option>`;
	});
}

function prepareHeatMap() {
	heatMapArray = [];
	for (let fItem = 0; fItem < factions.length; fItem++) {
		let count = 0;
		for (let item of originalData) {
			if (factions[fItem].msid === item.msid) {
				count++;
			}
		}
		let msid = factions[fItem].msid;
		heatMapArray.push({ msid, count });
	}
}

/******EVENTS********/
generate.addEventListener("click", () => {
	clearMap();

	let server = Number(getID("server").value);
	let round = Number(getID("rounds").value);

	let url = factionMap[round].url;
	fetcher(url, server, round);
	getID("heat-map").checked = false;
});

getID("top-faction").addEventListener("click", () => {
	let topFaction = document.querySelectorAll(".top-faction");
	topFaction.forEach((top) => top.classList.toggle("visible-tf"));
});

getID("top-server").addEventListener("click", () => {
	let topServer = document.querySelectorAll(".top-server");
	topServer.forEach((top) => top.classList.toggle("visible-ts"));
});

getID("heat-map").addEventListener("click", () => {
	let cells = document.querySelectorAll(".cell");
	//cells.forEach((item) => item.removeAttribute("style"));

	let server = Number(getID("server").value);
	let round = Number(getID("rounds").value);
	//await fetcher(`./json/ud_2_round_${round}.json`, server, round);
	//console.log(factions);
	let sortedMap = adjusttMap(originalData, server);
	sortedMap = sortMap(sortedMap);
	let lastRow = sortedMap.filter((item) => item.pos.x === 14);
	let lastCol = sortedMap.filter((item) => item.pos.y === 14);
	let heatMapIndex = getID("heat-map-index");
	let footer = getID("footer");
	//lastRow.unshift(lastRow[lastRow.length - 1]);
	clearElement(heatMapIndex);
	if (getID("heat-map").checked) {
		colorHeatMap(lastRow[14], "ab"); //first cell
		lastRow.forEach((item) => colorHeatMap(item, "b")); //row
		lastCol.forEach((item) => colorHeatMap(item, "a")); //col
		originalData.forEach((item) => colorHeatMap(item)); //rest of the cells

		//style footer with heat map legend
		footer.style.gridTemplateColumns = "1fr 4fr";
		footer.firstElementChild.style.textAlign = "left";

		heatMapIndex.style.gridTemplateColumns = `repeat(${largestFactionCount}, 1fr)`;
		for (let i = 0; i < largestFactionCount; i++) {
			let hmChild = document.createElement("div");
			hmChild.textContent = i + 1;
			let multiplier = Math.floor(255 / largestFactionCount);
			hmChild.style.background = `rgb(226, ${255 - (i + 1) * multiplier}, 114)`;
			heatMapIndex.append(hmChild);
		}
	} else {
		//s779ab
		let firstEl = lastRow[14];
		let div = getID(`s${firstEl.sid}ab`);

		colorCells(firstEl, div, round); //first cell
		lastRow.forEach((item) => {
			let div = getID(`s${item.sid}b`);
			colorCells(item, div, round);
		}); //row
		lastCol.forEach((item) => {
			let div = getID(`s${item.sid}a`);
			colorCells(item, div, round);
		}); //col
		originalData.forEach((item) => {
			let div = getID(`s${item.sid}`);
			colorCells(item, div, round);
		}); //rest of the cells

		//get rid of footer styling
		footer.style.gridTemplateColumns = "none";

		footer.firstElementChild.style.textAlign = "center";
		heatMapIndex.style.gridTemplateColumns = "none";
		clearElement(heatMapIndex);
	}
});

function colorHeatMap(item, idSuffix = "") {
	let colorCell = heatMapArray.filter((obj) => item.msid === obj.msid);
	let aCell = getID(`s${item.sid}${idSuffix}`);
	//let largestFactionCount = getLargestFactionCount();
	let multiplier = Math.floor(255 / largestFactionCount);
	if (aCell)
		aCell.style.background = `rgb(226, ${
			255 - colorCell[0].count * multiplier
		}, 114)`;

	//if (colorCell[0].count > 2 && aCell) aCell.style.color = "#fff";
}

function getLargestFactionCount() {
	let largest = 0;
	for (let i = 0; i < factions.length; i++) {
		let count = getMsidCount(factions[i].msid);
		if (count > largest) largest = count;
	}
	return largest;
}
function sortMap(normalizedData) {
	let data = [];
	for (let i = 0; i < MAP_WIDTH; i++) {
		data[i] = normalizedData.filter((item) => item.pos.x === i).sort(compare);
	}
	let fullSorted = [].concat.apply([], data);
	return fullSorted;
}
