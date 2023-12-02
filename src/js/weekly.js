const top20Servers = [
	770, 2216, 835, 1248, 1508, 851, 341, 779, 148, 1432, 1618, 591, 935, 1313,
	913, 1035, 174, 1258, 1545, 1244,
];

const factionMap = [
	{
		round: 0,
		server: [
			770, 835, 1248, 851, 1313, 1508, 1432, 779, 1618, 1035, 2216, 913, 341,
			1410, 1640, 1805, 1547, 1174, 1569,
		],
		url: "./json/ud_2_round_0.json",
	},
	{
		round: 1,
		server: [
			1432, 1313, 341, 835, 2641, 2216, 619, 1547, 851, 779, 148, 1248, 770,
			499, 184, 1035, 1510, 591, 1640, 1756,
		],
		url: "./json/ud_2_round_1.json",
	},
	{
		round: 2,
		server: [
			1432, 184, 1248, 779, 851, 835, 2216, 341, 1508, 591, 770, 2798, 2641,
			619, 935, 680, 148, 1618, 2631, 174,
		],
		url: "./json/ud_2_round_2.json",
	},
	{
		round: 3,
		server: [
			2216, 835, 1248, 779, 770, 148, 1508, 851, 2798, 341, 591, 174, 1618, 184,
			736, 619, 935, 1640, 1035, 744,
		],
		url: "./json/ud_2_round_3.json",
	},
];

// let colors = {
// 	0: "rgb(159, 187, 115/ 69%)",
// 	1: "#d4a373",
// 	2: "rgb(70, 194, 203)",
// 	3: "rgb(109, 103, 228)",	//purple
// 	4: "rgb(109, 103, 228)",
// 	5: "rgb(162, 255, 134)",
// 	6: "rgb(115 29 216 / 44%)",
// 	7: "rgb(241, 235, 144)",	//yellow  #efb8a2a6
// 	8: "rgb(137 6 6 / 49%)",
// 	9: "rgb(1, 106, 112)",
// };

let colors = {
	0: "rgb(159, 187, 115/ 69%)",
	1: "rgb(12 20 255 / 32%)",
	2: "paleturquoise",
	3: "#efb8a2a6",
	4: "#e7a2efba",
	5: "lightgreen",
	6: "#b30b0b5c",
	7: "palegoldenrod",
	8: "rgb(137 6 6 / 49%)",
	9: "rgb(1, 106, 112)",
};
export { colors, factionMap, top20Servers };
