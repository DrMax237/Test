// SayPlayables Template
var spVars = {}; // spVars end

var spUrlAndroid = "";
var spUrlIos = "";
var spNetwork = "";

function spTrackEvent(event, extra) {
	console.log("spTrackEvent", event, extra);
}

function spStoreUrl() {
	var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
	return isAndroid ? spUrlAndroid : spUrlIos;
}

function spClick(place) {
	window.open();
	spTrackEvent("click", place);
}

function spStartGame() {
	spBoot();
}

function spInit() {
	spStartGame();
}

window.addEventListener("load", function () {
	spInit();
});
