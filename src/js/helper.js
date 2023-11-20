function compare(a, b) {
	return a.pos.y - b.pos.y;
}

let clearMap = () => {
	getID("map-container").innerHTML = "";

	getID("top-faction").checked = false;
	getID("top-server").checked = false;
	clearElement(getID("heat-map-index"));
};

let clearElement = (element) => {
	element.innerHTML = "";
};
let getID = (id) => document.getElementById(id);

export { compare, clearMap, getID, clearElement };
