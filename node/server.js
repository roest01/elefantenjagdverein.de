// Let’s make node/socketio listen on port 3000
let io = require('socket.io')(3000, {
    path: '/eleServer'
});

let Tie_Leaderboard = require('agoragames-leaderboard/lib/tie_ranking_leaderboard.js');
let hunterLeaderboard = new Tie_Leaderboard("hunterLeaderboard");

let eleServerJS = require('./eleServer.js');
let eleServer = new eleServerJS.EleServerClass();

// Define/initialize our global vars
let socketCount = 0;
let clientInfo = {};

io.sockets.on('connection', function(client) {
    // Socket has connected, increase socket count
    socketCount++;
    // Let all sockets know how many are connected
    io.sockets.emit('users connected', socketCount);
    console.log("client connected", client.id);
    clientInfo.id = client.id;
    client.emit("connected", clientInfo);

    client.on('disconnect', function () {
        // Decrease the socket count on a disconnect, emit
        socketCount--;
        io.sockets.emit('users connected', socketCount)
    });

    /**
     * {elephantInformations, user}
     */
    client.on('killed elephant', function (kill) {
        let user = kill.user;
        hunterLeaderboard.scoreFor(user.id, function(memberScore) {
            console.log("got score for user", memberScore);

            if (memberScore === null){
                memberScore = 0;
            }

            memberScore += eleServer.getPointsByElephant(kill.info.name);
            console.log("new score", memberScore);

            hunterLeaderboard.rankMember(user.id, memberScore, kill.user, function(){
                console.log("updated");
                io.sockets.emit('rank updated', {
                    user: user,
                    memberScore: memberScore
                });
            });
        });
    });

    client.on('request eleModules', function(input, callback){
        eleServer.loadEleModules().then(function(eleModules){
            callback(eleModules);
        });
    });

    client.on('set nickname', function(nickname){
       clientInfo.nickname = nickname;
       //@todo publish to clients
    });

});