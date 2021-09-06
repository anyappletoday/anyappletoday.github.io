# Redmatch 2 Custom API Endpoints Documentation

- [About](#about)
- [Client Setup](#client-setup)
- [Requests](#requests)
 * [Match Started Request](#match-started-request)
 * [Match Ended Request](#match-ended-request)
 * [Player Joined Request](#player-joined-request)
 * [Player Left Request](#player-left-request)
 * [Player Died Request](#player-died-request)
 * [Weapon Switched Request](#weapon-switched-request)
 * [Player Position Request](#player-position-request)
 * [Command Request](#command-request)
- [Responding to Requests](#responding-to-requests)
- [Creating your Server](#creating-your-server)
- [Security](#security)
- [Advanced Example](#advanced-example)

## About
Custom API Endpoints is a tool I built into Redmatch 2 to make ranked modding and tournament tracking possible, but it's expanded to be a tool you can use to create custom gamemodes. You can subscribe to events fired by the host and send data to a URL endpoint on your server. The server can then respond to change game state, send a message to a certain player, or a variety of other things.

For example, you could create a sniper only mode where using any weapon other than the sniper would instantly kill you. Or a team deathmatch mode, where 2 teams fight each other. Or an Among Us clone, where 2 players are imposters and have to kill everyone else to win.

## Client Setup
To enable custom endpoints for a match, the host must have a file named "api_endpoints.json" in the folder of their local game files, next to Redmatch 2.exe.

The api_endpoints.json file is formatted like the following. To subscribe to an event, just add its name to the list and set the required data after it. Most events will just require an endpoint, where they will send information about the event to, and allow a response from the server. Some will require more information, like minimum and maximum positions to trigger a player position event, and a specific prefix to listen to for commands.

	{
		"matchStarted": "http://localhost:3000/match-started",
		"matchEnded": "http://localhost:3000/match-ended",
		"playerJoined": "http://localhost:3000/player-joined",
		"playerLeft": "http://localhost:3000/player-left",
		"playerDied": "http://localhost:3000/player-died",
		"weaponSwitched": "http://localhost:3000/weapon-switched",
		"playerPosition": {
			"positions": [
				{
					"min": [25, 24, 22],
					"max": [35, 90, 11]
				},
				{
					"min": [-92, 14, 2],
					"max": [3, 5, -11.2]
				}
			],
			"endpoint": "http://localhost:3000/player-position"
		},
		"command": "http://localhost:3000/command"
	}

You don't need to include an event if you don't want to subscribe to it. For example, if I was just making a simple bot to track kills, all I would need is this:

	{
		"playerDied": "http://localhost:3000/player-died",
	}

## Requests
When the match starts or ends, or any player dies, the host will send a PUT request to the respective URL with information about the match contained in the JSON format. These are the URLs that you specified in the api_endpoints.json file.

Every request is sent with a lobbyId, which is the unique SteamID of the lobby the match is in. You can have players join this lobby by launching the game with the command argument
	
	+connect_lobby lobbyId

or by going to this URL:

	steam://joinlobby/1280770/lobbyId

### Match Started Request
When the matchStarted event is fired, it will send a request like this to the endpoint:

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

### Match Ended Request
When the matchEnded event is fired, it will send a request like this to the endpoint:

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
| players | An array of players with SteamIDs and their in-game names, as well as their statistics |

### Player Joined Request
When any player joins, and the playerJoined event is fired, it will send a request like this to the endpoint:

	{
		lobbyId: '109775240972274609',
		id: '76561198057087288',
		name: 'Rugbug'
	}

| Variable | Description |
| --- | --- |
| id | The unique SteamID of the player who joined |
| name | The name of the player who joined |

### Player Left Request
When any player leaves, and the playerLeft event is fired, it will send a request like this to the endpoint:

	{
		lobbyId: '109775240972274609',
		id: '76561198057087288',
		name: 'Rugbug'
	}

| Variable | Description |
| --- | --- |
| id | The unique SteamID of the player who left |
| name | The name of the player who left |

### Player Died Request
When any player dies, and the playerDied event is fired, it will send a request like this to the endpoint:

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
| killer | The SteamID of who killed the player |
| victim | The SteamID of who died |
| data | Any other information about the kill. The options are: unknown, rifle, shotgun, sniper, wallbang, noscope, explosive, fall, circle, four_in_a_row |

### Weapon Switched Request
When any player switches their weapon, and the weaponSwitched event is fired, it will send a request like this to the endpoint:

	{
		lobbyId: '109775240972274609',
		id: '76561198057087288',
		weapon: 1
	}

| Variable | Description |
| --- | --- |
| id | The unique SteamID of the player who switched their weapon |
| weapon | The weapon that the player switched to. 0 = rifle, 1 = shotgun, 2 = sniper |

### Player Position Request (NOT SUPPORTED YET)
When any player enters the minimum and maximum specified, and the playerPosition event is fired, it will send a request like this to the endpoint:

	{
		lobbyId: '109775240972274609',
		id: '76561198057087288',
		position: [12.31, 54.23, 16.32],
		index: 2
	}

| Variable | Description |
| --- | --- |
| id | The unique SteamID of the player who entered the minimum and maximum of that position |
| position | The Vector3 of the player's new position |
| index | The index of the position in the specified array of positions |

### Command Request
When any player sends a chat message starting with the specefied prefix, the chat message not be sent to the chat, but instead to the host which will fire the command event and send a request like this to the endpoint:

	{
		lobbyId: '109775240972274609',
		id: '76561198057087288',
		command: 'help'
	}

| Variable | Description |
| --- | --- |
| id | The unique SteamID of the player who sent the command |
| command | The command the player sent, excluding the prefix |

## Responding to Requests
The host's game client will send a request when a match starts, ends, or when a player dies. The server can respond to these requests to modify game state with this response format:

	{
		message: '',
		title: '',
		subtitle: '',
		endGame: false,
		endGameMessage: '',
		actions: [
			{
				id: '76561198057087288',
				message: '',
				title: '',
				subtitle: '',
				outlineColor: 'FFFFFF',
				kill: false
			}
		]
	}

| Variable | Description |
| --- | --- |
| message | A message to send in chat to everyone in the match. Could be "MATCH ENDED" and then showing the players' new ranks, or anything else you could think of. You can use rich text formatting tags to enhance it. |
| title | A message to sent to everyone in the match, which is displayed at the top of their screen. |
| subtitle | A message to sent to everyone in the match, which is displayed at the bottom of their screen. |
| endGame | A bool of whether or not to end the game. |
| endGameMessage | If you choose to end the game, this message is what will be displayed at the top of the scoreboard where "Username Wins" would normally be. |
| actions | An array of actions to carry out for specific players. |

You can use actions to change game state for specific players.

| Action Variable | Description |
| --- | --- |
| id | The SteamID of the player you want to execute the action on |
| message | The message to send in chat to the specified player. You use this to tell a player their team or their updated rank. |
| title | A message to sent to the specified player, which is displayed at the top of their screen. |
| subtitle | A message to sent to the specified player, which is displayed at the bottom of their screen. |
| outlineColor | A hex code for an outline color to set around the player. Set it to empty if you want to remove the outline. |
| kill | Whether or not to kill the player. They will kill themselves. |

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

	app.put('/player-joined', (req, res) => {
		console.log(`${req.body.name} joined`);
		res.sendStatus(200);
	});

	app.put('/player-left', (req, res) => {
		console.log(`${req.body.name} left`);
		res.sendStatus(200);
	});

	app.put('/player-died', (req, res) => {
		console.log(`${req.body.killer} killed ${req.body.victim}`);
		res.sendStatus(200);
	});

	app.put('/weapon-switched', (req, res) => {
		console.log(`${req.body.id} switched weapon to ${req.body.weapon}`);
		res.sendStatus(200);
	});

	app.put('/player-position', (req, res) => {
		console.log(`${req.body.id} entered position ${req.body.index}`);
		res.sendStatus(200);
	});

	app.put('/command', (req, res) => {
		console.log(`${req.body.id} used command ${req.body.command}`);
		res.sendStatus(200);
	});

	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});

To access the contents of the request with express, just use req.body.

	app.put('/match-started', (req, res) => {
		console.log('Lobby ID: ', req.body.lobbyID);
		console.log('Map: ', req.body.settings.map);
		console.log('Players: ', req.body.players);
		res.sendStatus(200);
	});

Once I had finished writing my server, I used Heroku to host it for free.
 - [Heroku Tutorial](https://youtu.be/aUW5GAFhu6s)

Once you've hosted it somewhere, create your api_endpoints.json file and paste in the URLs.

	{
		"matchStarted": "http://localhost:3000/match-started",
		"matchEnded": "http://localhost:3000/match-ended",
		"playerDied": "http://localhost:3000/player-died"
	}

To test the server before releasing it online, you can always run your NodeJS server on localhost.

## Security

The endpoint of the server is shared with only the host of the game, who has the endpoint file on their computer. No one else can see it, since all data is relayed through the host.

As for the data sent to the server though, any player can spoof it if they know the endpoint. For example, they could send a bunch of fake death requests. This is one reason for wanting to be mindful when distributing your api_endpoints.txt file to only trusted players, or maybe you just don't care and you give it out to everyone. You could also add an 'api key' field to your endpoint, like https://redmatch-tournament.herokuapp.com/apiKey/death and give everyone you send the endpoints to a unique api key, like https://redmatch-tournament.herokuapp.com/5be33717e48a/death and then remove an api key if they start sending malicious requests.

	const apiKeys = [
		'5be33717e48a',
		'c6a8cdbf2b65'
	]

	app.put('/:apiKey/match-started', (req, res) => {
		if(!(req.params.apiKey in apiKeys)) {
			return res.sendStatus(403);
		}

		console.log('match started');
		res.sendStatus(200);
	});

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

	app.put('/player-died', (req, res) => {
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