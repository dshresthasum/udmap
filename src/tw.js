let colors = {
	0: "rgb(129 114 73 / 68%)",
	1: "#DB2763",
	2: "#B0DB43",
	3: "#12EAEA",
	4: "#BCE7FD",
	5: "#C492B1",
	6: "#E2C044",
	7: "rgb(115 29 216 / 44%)",
	8: "rgb(137 6 6 / 49%)",
	9: "#EB8258",
};

let top20 = [
	770, 835, 1248, 851, 1313, 1508, 1432, 779, 1618, 1035, 2216, 913, 341, 1054,
	1547, 591, 1432,
];
//console.log(colors["1"]);

let generate = document.getElementById("generate");

let originalData = [];
fetch("./ud_2_map_tw.json")
	.then((response) => response.json())
	.then((json) => {
		originalData = [...json];

		let sortedMap = adjusttMap(json);
		if (sortedMap) return sortedMap;
		//drawMap(sortedMap);
	})
	.then((sortedMap) => {
		if (sortedMap) drawMap(sortedMap);
	});

let mapContainer = document.getElementById("map-container");
function adjusttMap(res, server = 779) {
	let fullData = [];
	let validServer = res.filter((item) => item.sid === server);
	if (validServer.length < 1) {
		alert("Please enter valid server");
		return;
	}
	let data = [];
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

		singleItem.x = subX < 0 ? 28 + subX : subX;
		singleItem.y = subY < 0 ? 28 + subY : subY;
		singleItem.sid = item.sid;
		singleItem.color = item.color;
		singleItem.msid = item.msid;
		normalizedData.push(singleItem);
	});

	return sortMap(normalizedData);
}

function compare(a, b) {
	return a.y - b.y;
}

function drawMap(sortedMap, server = 779) {
	//(x=8, y=23)
	for (let item of sortedMap) {
		item.x = (item.x + 13) % 28;
		item.y = (item.y + 13) % 28;
	}
	sortedMap = sortMap(sortedMap);
	let lastRow = sortedMap.filter((item) => item.x === 27);
	let lastCol = sortedMap.filter((item) => item.y === 27);
	sortedMap.unshift(...lastRow);
	lastCol.unshift(lastCol[lastCol.length - 1]);
	let count = 0;
	sortedMap.map((item, idx) => {
		if (idx % 28 === 0) {
			let cell = document.createElement("div");
			cell.className = "cell";
			cell.id = "s" + lastCol.sid;
			//cell.style.background = colors[lastCol[count].color % 9];
			cell.innerHTML = `<div>${lastCol[count].sid}</div>`;

			cell.innerHTML += `<span>F-${lastCol[count].msid}</span>`;
			mapContainer.appendChild(cell);
			count++;
		}
		let cell = document.createElement("div");
		cell.className = "cell";
		cell.id = "s" + item.sid;

		if (top20.includes(item.sid)) {
			cell.classList.add("super-server");
		}
		//cell.style.background = colors[item.color % 9];
		if (item.sid === server) {
			cell.classList.add("main-server");
			cell.style.background = colors[2];
		}
		//cell.style.background = item.sid === server ? "chartreuse": "#fff"
		cell.innerHTML = `<div>${item.sid}</div>`;
		cell.innerHTML += `<span>F-${item.msid}</span>`;

		mapContainer.appendChild(cell);
	});
}

function sortMap(normalizedData) {
	let data = [];
	for (let i = 0; i < 28; i++) {
		data[i] = normalizedData.filter((item) => item.x === i).sort(compare);
	}
	let fullSorted = [].concat.apply([], data);
	return fullSorted;
}

generate.addEventListener("click", () => {
	let server = Number(document.getElementById("server").value);
	document.getElementById("map-container").innerHTML = "";
	sortedMap = adjusttMap(originalData, server);
	if (sortedMap) drawMap(sortedMap, server);
});
