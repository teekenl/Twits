var express = require('express');
var dateFormat = require('dateformat');
var setupConfig = require('../config');

var Twitter = require('node-tweet-stream');

var multiTag = [];
var sentiment = require('sentiment');
var router = express.Router();

// Count the number of tweets
var testTweetCount = 0;

// Setup Credential for Twitter
var clientTweet = new Twitter({
  consumer_key: setupConfig.consumer_key,
  consumer_secret: setupConfig.consumer_secret,
  token: setupConfig.access_token_key,
  token_secret: setupConfig.access_token_secret

});

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Express' });

  res.io.on('connection',function(sockets) {
    sockets.searchMultipleTags = [];

    console.log("User is connected");
    sockets.emit("socketToMe","asd");

    // Search the tweets
    sockets.on("searchTweet", function (data) {
          var exist = false;

          for (var i=0; i<sockets.searchMultipleTags.length;i++){
            if(sockets.searchMultipleTags[i]==data) {
                exist = true;
                break;
            }

          }

          // Add the phrases if it is not existed
          if(!exist) {
              console.log(data);
            sockets.searchMultipleTags.push(data);
            multiTag.push(data);
            clientTweet.track(data);
          }

    });


      // Remove particular tags
    sockets.on("removeTagTweet", function(data) {
        for(var i = 0; i < sockets.searchMultipleTags.length; i++) {
            if(data === sockets.searchMultipleTags[i]) {
                sockets.searchMultipleTags.splice(i,i+1);
                clientTweet.untrack(data);
                console.log(data);
                break;

            }
        }

    });


    sockets.on("clearAllTag", function(data) {
        sockets.searchMultipleTags=[];
        clientTweet.untrackAll();

    })


    // Find and filter the tweet
    clientTweet.on('tweet', function (tweet) {
        ResultOfTweet(tweet,sockets);
    });


  });

});

router.get('/check', function(req,res,next) {
  clientTweet.track('brisbane');
  clientTweet.track('weather');
  // Find and filter the tweet
  clientTweet.on('tweet', function (tweet) {
    console.log(tweet);

  });

});

//Get results of tweet
function ResultOfTweet(tweet,sockets) {
  var profileUrl = "https://twitter.com/" + tweet.user.screen_name;
  var createdTime = tweet.user.created_at;
  var url =  tweet.user.profile_banner_url;
  var urlLocation = tweet.user.location;
    if (typeof url==='undefined') {
      url = "images/no_available.png";
    } else {
      url +="/1500x500";
    }

    if(typeof urlLocation === '' ) {
        url = "Not Available";
    }

    createdTime = dateFormat(createdTime,"yyyy-mm-dd h:MM TT");

  var FormattedTweets = '<li><a href="'+profileUrl+'" target="_blank"><img src="'+url+'" style="width: auto; height:220px"'+
      'width="280" height="250"></a><div class="post-info">' +
      '<div class="post-basic-info"><img src ="'+tweet.user.profile_image_url+'" style="width:40px; height:40px; float:left; border-radius: 50%"><h3><a href="'+profileUrl+'" target="_blank">' +
      tweet.user.name+'</a></h3><span><br/><a href="#">'+createdTime+'<br/><label>' +
      '</label>'+tweet.user.location+'</a></span><p>'+tweet.text+'</p></div>' +
      '<div class="post-info-rate-share"><div class="rateit">' +
      '<span></span></div><div class="post-share"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+tweet.user.friends_count+'</span>' +
      '</div><div class="clear"></div></div></div></li>';

    sockets.emit("resultTweet", FormattedTweets);

}



module.exports = router;
