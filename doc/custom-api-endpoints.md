# Redmatch 2 Custom API Endpoints Documentation

- [About](#about)
- [Client Setup](#client-setup)
- [Requests](#requests)
 * [Match Start Request](#match-start-request)
 * [Match End Request](#match-end-request)
 * [Player Death Request](#player-death-request)
- [Responding to Requests](#responding-to-requests)
- [Creating your Server](#creating-your-server)
- [Advanced Example](#advanced-example)

## About
Custom API Endpoints is a tool I built into Redmatch 2 to make managing custom tournaments easier, some simple custom gamemodes and ranked modding possible. When a match starts, ends, and when a player dies, a request will be sent to your server containing information about it. You can respond to these requests to change game state or send messages to players.

For example, you could create a discord bot to manage the total kills of players in a tournament, or make an analytics bot to track the most popular maps.

## Client Setup
To enable custom endpoints for a match, the host must have a file named "api_endpoints.txt" in the Data folder of their local game files.

The api_endpoints.txt file should have 3 lines in it, the first containing the URL to send the data to when the match starts, the second containing the URL to send the data to when the match ends, and the third containing the URL to send the data to when a player dies.

	https://localhost:3000/match-started
	https://localhost:3000/match-ended
	https://localhost:3000/death

## Requests
When the match starts or ends, or any player dies, the host will send a PUT request to the respective URL with information about the match contained in the JSON format.

### Match Start Request
When the match starts, a request like this will be sent:

	{
		lobbyId: '109775240972257934',
		settings: {
			creator: '76561198057087288',
			endTime: '184.036043405533',
			map: '14',
			name: 'Super Cool Match',
			password: 'whatever',
			rs_ammoMultiplier: '1',
			rs_barrelBetweenTime: '5',
			rs_barrelpocalypse: 'False',
			rs_damageMultiplier: '1',
			rs_disablePVP: 'False',
			rs_gamemode: '0',
			rs_jumpMultiplier: '1',
			rs_night: 'False',
			rs_odmGear: 'True',
			rs_spawnAmmoPickups: 'False',
			rs_speedMultiplier: '1',
			rs_startingAmmoMultiplier: '2',
			rs_stickyGoGoBetweenTime: '5',
			rs_stickyGoGos: 'False',
			rs_teamSpawns: 'True',
			rs_time: '3',
			rs_wallbangs: '1',
			scene: '20',
			seed: '8791',
			startTime: '1630902722.60311',
			version: '1.11.0'
		},
		players: [
			{ id: '76561198057087288', name: 'Rugbug' },
			{ id: '76561198010526830', name: 'Alex' }
		]
	}

| Variable | Description |
| --- | --- |
| lobbyId | The SteamID of the lobby the match is in, unique to each match |
| settings | An array of all the settings for the room and their values, which includes the room settings (prefaced with rs_) |
| players | An array of players with unique SteamIDs and their in-game names |

| Setting | Description |
| --- | --- |
| creator | The SteamID of whoever created the match |
| endTime | The time in seconds after the startTime that the match should end  |
| map | The index of the map |
| name | The name of the match |
| password | The password of the match |
| anything starting with rs_ | A room setting |
| scene | The build index of the current loaded scene |
| seed | The seed for the match, used in-game to generate consistent random events |
| startTime | The unix timestamp that this match was created at (seconds since January 1st 1970) |
| version | The server version of the game the match is running on (this might not match up with the version you see in the main menu, since the server version is only changed when a change is made that would break compatibility between versions) |

### Match End Request
When the match ends, a request like this will be sent:

	{
		lobbyId: '109775240972274609',
		players: [
			{
				id: '76561198057087288',
				name: 'Rugbug',
				stats: {
					kills: '12',
					deaths: '3'
				}
			},
			{
				id: '76561198010526830',
				name: 'Alex',
				stats: {
					kills: '2',
					deaths: '16'
				}
			}
		]
	}

| Variable | Description |
| --- | --- |
| lobbyId | The SteamID of the lobby the match is in, unique to each match |
| players | An array of players with SteamIDs and their in-game names, as well as their statistics |

### Player Death Request
When any player dies, a request like this will be sent:

	{
		lobbyId: '109775240972274609',
		killer: '76561198057087288',
		victim: '76561198010526830',
		data: [ 'sniper', 'noscope', 'wallbang' ]
	}

Another example:

	{
		lobbyId: '109775240972274609',
		killer: '76561198057087288',
		victim: '76561198057087288',
		data: [ 'fall' ]
	}

| Variable | Description |
| --- | --- |
| lobbyID | The SteamID64 of the lobby the match is in, unique to each match |
| killer | The SteamID of who killed the player |
| victim | The SteamID of who died |
| data | Any other information about the kill. The options are: unknown, rifle, shotgun, sniper, wallbang, noscope, explosive, fall, circle, four_in_a_row |

## Responding to Requests
The host's game client will send a request when a match starts, ends, or when a player dies. The server can respond to these requests to modify game state with this response format:

	{
		message: '',
		actions: [
			{
				id: '76561198057087288',
				message: '',
				outlineColor: 'FFFFFF'
			}
		],
		endGame: 'false',
		endGameMessage: ''
	}

| Variable | Description |
| --- | --- |
| message | A message to send to everyone in the match. Could be "MATCH ENDED" and then showing the players' new ranks, or anything else you could think of. You can use rich text formatting tags to enhance it. |
| actions | An array of actions to carry out for specific players. |
| endGame | A bool of whether or not to end the game. |
| endGameMessage | If you choose to end the game, this message is what will be displayed at the top of the scoreboard where "Username Wins" would normally be. |

You can use actions to change game state for specific players.

| Action Variable | Description |
| --- | --- |
| id | The SteamID of the player you want to execute the action on/ |
| message | The message to send in chat to the specified player. You use this to tell a player their team or their updated rank. |
| outlineColor | A hex code for an outline color to set around the player. Set it to empty if you want to remove the outline. |

The server can either respond in this response format or with just a status code of 200 (OK). If the server only responds with 200, then nothing will be executed on the client.

## Creating your Server

As I mentioned before, to use the API you will need to set up your own server. For my example, I used:
 - [NodeJS v14.16.0](https://nodejs.org/en/)
 - [Express v4.17.1](https://www.npmjs.com/package/express)

Both are free, and to learn how to use them I would recommend following these tutorials by Programming with Mosh:
 - [Node.js Tutorial for Beginners: Learn Node in 1 Hour](https://www.youtube.com/watch?v=TlB_eWDSMt4)
 - [How to build a REST API with Node js & Express](https://www.youtube.com/watch?v=pKd0Rpw7O48)

If you don't want to use NodeJS you could use any other language that works to accept HTTP requests, like python, C#, etc. I prefer JavaScript with NodeJS as it's very easy to learn and write, and has a wide assortment of useful packages (like [discord.js](https://discord.js.org/#/), if you wanted to make this into a discord bot).

	const express = require('express');
	const app = express();

	const PORT = process.env.PORT || 3000;

	// Allow Cross-Origin-Resource-Sharing so that we can accept requests from anyone
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	// Required to view nested objects
	app.use(express.urlencoded({
		extended: true
	}));

	// Use JSON formatting for the request body
	app.use(express.json());

	app.put('/match-started', (req, res) => {
		console.log('match started');
		res.sendStatus(200);
	});

	app.put('/match-ended', (req, res) => {
		console.log('match ended');
		res.sendStatus(200);
	});

	app.put('/death', (req, res) => {
		console.log('someone died');
		res.sendStatus(200);
	});

	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});

To access the contents of the request with express, just use req.body.

	app.put('/match-started', (req, res) => {
		console.log('Lobby ID: ', req.body.lobbyID);
		console.log('Map: ', req.body.settings.Map);
		console.log('Players: ', req.body.players);
		res.sendStatus(200);
	});

Once I had finished writing my server, I used Heroku to host it for free.
 - [Heroku Tutorial](https://youtu.be/aUW5GAFhu6s)

Once you've hosted it somewhere, create your api_endpoints.txt file and paste in the match started and match ended URLs.

	https://redmatch-tournament.herokuapp.com/match-started
	https://redmatch-tournament.herokuapp.com/match-ended
	https://redmatch-tournament.herokuapp.com/death

To test the server before releasing it online, you can always run your NodeJS server on localhost.

## Advanced Example

The previous example was very bare-bones, and didn't have much functionality. If you want to make more complicated programs, then you can use the following as jumping off point. It has a match list and ranks.

	const express = require('express');
	const app = express();

	const PORT = process.env.PORT || 3000;

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
	app.use(express.urlencoded({extended: true}));
	app.use(express.json());

	let matches = {}; // A dictionary of all active matches, with the key being the lobbyID

	let playerRanks = {}; // A dictionary of the ranks of players, with the key being their steamID
						// If you wanted these ranks to persist after the server stops, you'd have to set up a database

	app.put('/match-started', (req, res) => {
		console.log(`Match started: ${req.body.settings.endGame}`);

		// Create a new match object and add it to our matches dictionary
		// I'm not using it in this example, but you could use this to do different things based
		// on stuff like the gamemode or map
		let match = new Match(req.body.settings, req.body.players);
		matches[req.body.lobbyId] = match;

		let response = new Response('<b>[RANKED MATCH STARTED]</b>');

		res.status(200).send(response);
	});

	app.put('/match-ended', (req, res) => {
		console.log(`Match ended: ${matches[req.lobbyId].settings.name}`);

		let actions = [];

		// Get an array of all the SteamIDs of this match's players
		let steamIds = req.body.players.map(x => x.id);

		for(let i = 0; i < steamIds.length; i++) {
			if(steamIds[i] in playerRanks) {
				let action = new ResponseAction(steamIds[i], `New Rank: ${playerRanks[steamIds[i]]}`);
				actions.push(action);
			}
		}

		delete matches[req.body.lobbyId];

		let response = new Response('<b>[RANKED MATCH ENDED]</b>', actions);

		res.status(200).send(response);
	});

	app.put('/death', (req, res) => {
		let victim = req.body.victim;
		let killer = req.body.killer;

		console.log(`${victim} was killed by ${killer}`);

		// Set up their ranks if they don't have them yet
		if(!(victim in playerRanks))
		playerRanks[victim] = 0;
		
		if(!(killer in playerRanks))
		playerRanks[killer] = 0;
		
		let actions = [];

		if(killer === victim) { // Killed themself
			playerRanks[killer] -= 2;
			actions.push(new ResponseAction(killer, `Rank -2 <color=#e3e3e3>(${playerRanks[killer]})</color>`));
		} else {
			playerRanks[victim] -= 1;
			playerRanks[killer] += 1;

			actions.push(new ResponseAction(victim, `Rank -1 <color=#e3e3e3>(${playerRanks[victim]})</color>`));
			actions.push(new ResponseAction(killer, `Rank +1 <color=#e3e3e3>(${playerRanks[killer]})</color>`));
		}

		let response = new Response('', actions);

		res.status(200).send(response);
	});

	function Match(settings, players) {
		this.settings = settings;
		this.players = players;
	}

	function ResponseAction(id, message, outlineColor) {
		this.id = id;
		this.message = message;
		this.outlineColor = outlineColor;
	}

	function Response(message, actions, endGame, endGameMessage) {
		this.message = message;
		this.actions = actions;
		this.endGame = endGame;
		this.endGameMessage = endGameMessage;
	}

	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});