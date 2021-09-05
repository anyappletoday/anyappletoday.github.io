# Redmatch 2 Custom API Endpoints Documentation

## About

Custom API Endpoints is a tool I built into Redmatch 2 to make managing custom tournaments and data processing easier. When a match starts or ends, you can send data to your own server with information about the match and players in it.

For example, you could create a discord bot to manage the total kills of players in a tournament, or make an analytics bot to track the most popular maps.

## Client Setup

To enable custom endpoints for a match, the host must have a file named "api_endpoints.txt" in the Data folder of their local game files.

The api_endpoints.txt file should have 2 lines in it, the first containing the URL to send the data to when the match starts, and the second containing the URL to send the data to when the match ends.

	https://localhost:3000/match-started
	https://localhost:3000/match-ended

## Behaviour

When the match starts or ends, the host will send a PUT request to the respective URL with information about the match contained in the JSON format.

When the match starts, a request like this will be sent:

	{
		lobbyID: '109775240971066540',
		map: 4,
		players: [
			{ steamID: '76561198057087288', name: 'Rugbug' },
			{ steamID: '76561198010526830', name: 'AnotherPlayer' }
		]
	}

When the match ends, a request like this will be sent:

	{
		lobbyID: '109775240971066540',
		map: 4,
		players: [
			{ steamID: '76561198057087288', name: 'Rugbug', kills: 10, deaths: 6 },
			{ steamID: '76561198010526830', name: 'AnotherPlayer', kills: 5, deaths: 12 }
		]
	}

| Variable | Description |
| --- | --- |
| lobbyID | The SteamID64 of the lobby the match is in, unique to each match |
| map | The index of the map being played |
| players | An array of players with steamIDs and their in-game names, with kills and deaths if it is an end match request |

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

	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});

To access the contents of the request with express, just use req.body.

	app.put('/match-started', (req, res) => {
		console.log('Lobby ID: ' + req.body.lobbyID);
		console.log('Map: ' + req.body.map);
		console.log('Players: ' req.body.players);
		res.sendStatus(200);
	});

Once I had finished writing my server, I used Heroku to host it for free.
 - [Heroku Tutorial](https://youtu.be/aUW5GAFhu6s)

Once you've hosted it somewhere, create your api_endpoints.txt file and paste in the match started and match ended URLs.

	https://redmatch-tournament.herokuapp.com/match-started
	https://redmatch-tournament.herokuapp.com/match-ended

To test the server before releasing it online, you can always run your NodeJS server on localhost.