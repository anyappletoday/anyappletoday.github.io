# Redmatch 2 Remote Modding Documentation

## About
If you're here I assume you know a bit about what modding is. It allows you, the player, to create logic to modify the way the game normally works. Like adding a custom gamemode.

The way modding works in Redmatch 2 is not the same as most other games. Most games have mods as programs that embed themselves into the game on a player's computer. I wanted to create a safer approach for Redmatch 2 that moves mod logic off of the user's computer, and prevents malicious intent and viruses.

As a result of this, modding in Redmatch 2 is much safer than conventional modding, and it's impossible to get a virus from it. The only caveat is that modders can see your IP address, but this would have also been possible with conventional modding. Players can use VPNs or a proxy to protect themselves from that, though.

## How Does it Work?
Instead of running code on the player's computer, all logic is run on a remote server. You as a mod creator are responsible for hosting and maintaining the server. You can use a service like [Heroku](https://www.heroku.com/) to host your server for free.

The host of the game will communicate with your server during gameplay. You can subscribe to events fired by the host which send data to a URL endpoint on your server. The server can then respond to change game state, send a message to a certain player, or a variety of other things.

For example:
- someone in game gets a kill
- the host recognizes this and triggers a "player died" event
- if you chose to subscribe to this event, the host will send a "player died" request to the server containing information about the death
- the server can send a response
- the host will carry out instructions in the response

## Client Setup
To enable custom endpoints for a match, the host must have a file named "api_endpoints.json" in the folder of their local game files, next to Redmatch 2.exe.

(Eventually this will change to a mod browser or something)

The api_endpoints.json file is formatted like the following. To subscribe to an event, just add its name to the list and set the endpoint after it.

	{
		"matchStarted": "http://localhost:3000/match-started",
		"matchEnded": "http://localhost:3000/match-ended",
		"playerJoined": "http://localhost:3000/player-joined",
		"playerLeft": "http://localhost:3000/player-left",
		"playerDied": "http://localhost:3000/player-died",
		"weaponSwitched": "http://localhost:3000/weapon-switched",
		"command": "http://localhost:3000/command"
	}

You don't need to include an event if you don't want to subscribe to it. For example, if I was just making a simple mod to track kills, all I would need is this:

	{
		"playerDied": "http://localhost:3000/player-died"
	}

## Events
For any event you subscribe to the host will send a PUT request to the provided URL with information data contained in the JSON format.

Every request is sent with a lobbyId, which is the unique SteamID of the lobby the match is in. You can have players join this lobby by going to this URL:

	steam://joinlobby/1280770/lobbyId

For example, if I made a discord bot and wanted players to be able to join the active lobby, I could have it send a message like this:

	steam://joinlobby/1280770/109775240972257934

If a player clicks it then Redmatch 2 will automatically connect to that lobby.

### Match Started Event
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

### Match Ended Event
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

### Player Joined Event
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

### Player Left Event
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

### Player Died Event
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

### Weapon Switched Event
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

### Command Event
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
				nameColor: 'FFFFFF',
				outlineColor: 'FFFFFF',
				kill: false,
				setPos: { x: 0, y: 100, z: 0 },
				movePos: { x: 0, y: 0.5, z: 0 },
				tags: {
					add: [
						'red'
					],
					remove: [
						'blue'
					],
					set: [
						'red'
					]
				},
				weaponActions: [
					{
						weapon: 1,
						changeAmmo: -5
					},
					{
						weapon: 2,
						equip: true,
						setTotal: 999,
						setAmmo: 1
					}
				]
			}
		],
		geometry: {
			add: [
				{
					id: 0,
					model: 'cube',
					pos: { x: 0, y: 50, z: 0 },
					size: { x: 1, y: 1, z: 2 },
					rot: { x: 360, y: 180, z: 90 },
					collision: false,
					color: '66000000'
				}
			],
			remove: [
				27
			]
		},
		tags: [
			{
				name: 'blue',
				immune: [
					'blue'
				]
			},
			{
				name: 'red',
				immune: [
					'red'
				]
			},
			{
				name: 'traitor',
				visibleOutlines: [
					'traitor'
				]
			},
			{
				name: 'innocent'
			}
		]
	}

Note that you should not include variables unless you are using them. For example if you only wanted to display a title to all players, just respond with this to save bandwidth:

	{
		title: 'Hello World!'
	}

The server can either respond in this response format or with just a status code of 200 (OK). If the server only responds with 200, then nothing will be executed on the client.

For all text-based fields, rich text tags are supported:
	
	<color=red>This text will be red!</color>
	<size=5>This text will be small!</size>

| Variable | Description |
| --- | --- |
| message | A chat message sent to everyone in the match. |
| title | Text sent to everyone in the match which is displayed at the top of their screen. |
| subtitle | Text sent to everyone in the match which is displayed at the bottom of their screen. |
| endGame | Set this to true to end the game. |
| endGameMessage | If you choose to end the game, this text is what will be displayed at the top of the scoreboard where "<Username> Wins" would normally be. |
| actions | An array of actions to carry out for specific players. [more info](#actions) |
| geometry | Add or remove physical objects. [more info](#geometry) |
| tags | Define tags. [more info](#tags) |

### Actions
You can use actions to change game state for specific players. For example, only giving one player the role of "traitor" or assigning specific players to separate teams.

| Variable | Description |
| --- | --- |
| id | The SteamID of the player you want to execute the action on. |
| message | A chat message sent to the specified player. |
| title | Text sent to the specified player which is displayed at the top of their screen. |
| subtitle | Text sent to the specified player which is displayed at the bottom of their screen. |
| outlineColor | A six-digit hex code for an outline color to set around the player. Set it to empty if you want to remove the outline. Format is RRBBGG |
| kill | Set this to true to kill the player. |

You can use weapon actions to change weapon data for the specified player.

| Variable | Description |
| --- | --- |
| weapon | The index of the weapon to affect. |
| equip | Set this to true if you want the player to equip that weapon. |
| changeAmmo | The amount to change the ammo in the magazine (will always cap the ammo between 0 and the magazine size). |
| changeTotal | Change the total amount of ammo in the gun. |
| setAmmo | Sets the amount of ammo in the magazine. |
| setTotal | Sets the total amount of ammo in the gun. |

### Geometry
The geometry section has two arrays, `add` and `remove`. To add geometry, add a new geometry object.

	{
		id: 0,
		model: 'sphere',
		pos: { x: 10, y: 20, z: 50 },
		size: { x: 1, y: 1, z: 2 },
		rot: { x: 360, y: 180, z: 90 },
		color: '66000000',
		collision: false,
		animation: {
			keyframes: [
				'0': {
					pos: { x: 20, y: 20, z: 50 }
				},
				'80': {
					pos: { x: 80, y: 20, z: 50 }
				}
			],
			time: 1.2,
			ease: linear
		}
	}

| Variable | Description |
| --- | --- |
| id | A numerical id that you assign to your geometry, which can be used to remove it in the future. |
| model | The primitive model to use for the geometry. The options are: cube, sphere, cylinder, prism. |
| pos | The position to spawn the object at. You can use /position in-game to view the position at the feet of your player in order to find out where to spawn it. |
| size | The size of the object. |
| rot | The rotation of the object. |
| color | a 8-digit hex code for the color of the object. Format is RRBBGGAA |
| collision | A boolean of whether players, bullets, and other physics objects should collide with the geometry. |
| animation | Animation data. [more info](#geometry-animation) |

### Geometry Animation

Geometry can be animated! That is, move around, scale, rotate, and change color.
To do so, you fill out the animation section when creating geometry.

	{
		id: 0,
		model: 'cube',
		animation: {
			keyframes: [
				'0': {
					pos: { x: 0, y: 0, z: 0 },
					size: { x: 1, y: 1, z: 1 },
					rot: { x: 360, y: 180, z: 90 },
					color: '66000000'
				},
				'50': {
					pos: { x: 80, y: 20, z: 50 }
				}
			],
			time: 2.0,
			ease: linear
		}
	}

| Variable | Description |
| --- | --- |
| keyframes | A dictionary with a key of percentage and a value of a keyframe object. Inside the keyframe object you can add pos, size, rot, and color. |
| time | How long the animation should take in seconds. |
| ease | The type of ease to use. Default is linear. The options are: https://easings.net/ |

### Tags

	tags: [
		{
			name: 'traitor',
			visibleOutlines: [
				'traitor'
			],
			immune: [
				'traitor'
			]
		},
		{
			name: 'innocent'
		}
	]

| Variable | Description |
| --- | --- |
| name | The name of the tag. |
| visibleOutlines | An array of tags that any player with this tag will be able to see the outlines of. Defaults to all tags. |
| immune | An array of tags that the player cannot take damage from. |

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