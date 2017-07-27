var socket = io.connect('localhost:3000',{'force new connection': true, 'connect timeout': 1000});


// Bind the enter key to call tweet searching method
function enterBindKey(event) {
    if(event.keyCode == 13) {
        searchTweet();

    }
}

//Search for particular tag of tweet
function searchTweet(value) {
    // Get the search value
    var SearchValue = document.getElementById('tweetInputText').value;
    //Invoke the socket to search the particular tweet
    socket.emit("searchTweet", value);

}


//Remove particular of tag of tweet
function removeTagTweet(value) {

    socket.emit("removeTagTweet", value);
}
