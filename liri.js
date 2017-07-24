var Keys = require('./keys.js');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var fs = require("fs");

var commands = process.argv.slice(2);
var cmd = commands[0];
var query = commands[1];

processCommand(cmd, query);

function processCommand(c,q){

	if (c === "my-tweets"){

		getTweets();

	} else if (c === 'spotify-this-song'){

		if (typeof(q) === 'undefined'){
			q = "The Sign by Ace of Base"
		}

		searchSpotify(q);

	} else if (c === 'movie-this'){

		if (typeof(q) === 'undefined'){
			q = 'Mr. Nobody'
		}

		searchMovies(q);

	} else if (c === 'do-what-it-says'){
		fs.readFile("random.txt", "utf8", function(error, data) {

  		if (error) {
    		return console.log(error);
  		}

  		var dataArr = data.split(",");

  			processCommand(dataArr[0],dataArr[1]);

		});
	}

}

function getTweets(){
	var consumerKey = Keys.twitter.consumer_key;
	var consumerSecret = Keys.twitter.consumer_secret;
	var accessTokenKey = Keys.twitter.access_token_key;
	var accessTokenSecret = Keys.twitter.access_token_secret;
 
	var client = new Twitter({
  		consumer_key: consumerKey,
  		consumer_secret: consumerSecret,
  		access_token_key: accessTokenKey,
  		access_token_secret: accessTokenSecret
	});
 
	var params = {screen_name: 'McguinessNate', count:20};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
  		if (!error) {
    		printTweets(tweets);
  		}
	});
}

function searchSpotify(songTitle){

	var clientId = Keys.spotify.client_id;
	var clientSecret = Keys.spotify.client_secret;

	var spotify = new Spotify({
  		id: clientId,
  		secret: clientSecret
	});

	spotify.search({ type: 'track', query: songTitle, limit:20 }, function(err, data) {
  		if (err) {
    		return console.log('Error occurred: ' + err);
  		}
 
 		printTracks(data.tracks.items);
		
	});

}

function searchMovies(movieTitle){

	var queryUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=40e9cece";

	request(queryUrl, function(error, response, body) {

  		if (!error && response.statusCode === 200) {
			printMovie(JSON.parse(body));
  		}
	});

}

function printTweets(tweets){
	var count = 1;
	var output = '';

	tweets.forEach(function(tweet){
		output += 'Tweet ' + count + '\nDate: ' + tweet.created_at + '\nText: ' + tweet.text
			   + '\n------------------------------------------------------\n'
		count ++;
	})

	logData(output);
}

function printTracks(tracks){
	var count = 1;
	var trackInfo = '';

	tracks.forEach(function(track){
		var album = track.album.name;
		var artists = track.artists;
		var link = track.external_urls.spotify;

		trackInfo += "Track " + count + "\nTitle: " + track.name + '\nBy: '

		artists.forEach(function(artist){
			trackInfo += artist.name + ', '
		})

		trackInfo = trackInfo.substring(0, trackInfo.length - 2);

		trackInfo += '\nLink: ' + link;

		trackInfo += '\nAlbum: ' + album;

		trackInfo += "\n------------------------------------------------------\n";
		count++;
	});

	logData(trackInfo);
}

function printMovie(movie){

	var output = ''

	output = 'Title: ' + movie.Title + '\nYear: ' + movie.Year 
		        + '\nIMDB Rating: ' + movie.Ratings[0].Value
		        + '\nRotten Tomatoes Rating: ' + movie.Ratings[1].Value
		        + '\nCountry: ' + movie.Country
		        + '\nLanguage: ' + movie.Language
		        + '\nPlot: ' + movie.Plot
		        + '\nActors: ' + movie.Actors
				+ '\n------------------------------------------------------\n'

	logData(output);
}

function logData(data){

	console.log(data);

	fs.appendFile('log.txt', data, function(err) {

  		if (err) {
    		console.log(err);
  		}
  		else {
    		console.log('Content added to log.txt!');
  		}

	});

}