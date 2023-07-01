const shuttleText = new Map([
	["idle", ""],
	["called", "ETA"],
	["docked", "ETD"],
	["escape", "ESC"],
	["igniting", "IGN"],
	["endgame%3a+game+over", "FIN"],
]);

function updateServer() {
	fetch("/serverinfo/serverinfo.json", {
		method: "get",
		headers: { "Content-Type": "application/json" },
	})
		.then(res => res.json())
		.then(json => updateDisplay(json[0]))
		.catch(error => console.error(error));
}

function updateDisplay(server) {
	const infoLines = document.querySelectorAll(".serverinfoline");

	if(!server.gamestate) {
		infoLines.forEach(line => line.textContent = "")
		infoLines[0].textContent = "Status unavailable";
		return;
	}

	server.map_name = server.map_name.replace(/\+/g, " "); // I hate byond
	infoLines[0].textContent = `Map: ${server.map_name}`;
	infoLines[1].textContent = `Players: ${server.players} /\n ${server.popcap}`;

	const time = new Date(null);
	time.setSeconds(server.round_duration);
	const cutFrom = server.round_duration > 3600 ? 12 : 14;
	const timeString = time.toISOString().substr(cutFrom, 19 - cutFrom);
	infoLines[2].textContent = `Duration: ${timeString}`;

	if(server.gamestate && server.shuttle_mode != "idle") {
		const eta = new Date(null);
		eta.setSeconds(server.shuttle_timer);
		if(server.shuttle_mode == "endgame%3a+game+over" || server.gamestate == "4") { // not sure what gamestate that is but shuttle_mode won't be set if admins end the round manually
			infoLines[3].textContent = "Round Ended";
		} else {
			infoLines[3].textContent = `${shuttleText.get(server.shuttle_mode)}: ${eta.toISOString().substr(14, 5)}`;
		}
	}else if(server.gamestate == "1") {
		infoLines[3].textContent = "Round starting";
	} else {
		infoLines[3].textContent = "";
	}
}

updateServer();
setInterval(updateServer, 5000);
