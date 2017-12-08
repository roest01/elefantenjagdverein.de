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
let clientInfo = {
    id: -1,
    name: "anonym"
};

io.sockets.on('connection', function(client) {
    // Socket has connected, increase socket count
    socketCount++;
    // Let all sockets know how many are connected
    io.sockets.emit('users connected', socketCount);

    console.log("client connected", client.id);
    clientInfo.id = client.id;
    io.sockets.emit('player updated', clientInfo);

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
                console.log("rankMember", kill);
                io.sockets.emit('rank updated', {
                    user: user,
                    memberScore: memberScore
                });
            });
        });
    });

    client.on('initialized', function(){
        client.emit("connected", clientInfo);
    });


    client.on('request eleModules', function(input, callback){
        eleServer.loadEleModules().then(function(eleModules){
            client.emit("request eleModules", eleModules);
        });
    });

    client.on('set nickname', function(user){
       clientInfo.nickname = user.name;
        io.sockets.emit('player updated', {
            nickname: user.name,
            id: user.id
        });
    });

});