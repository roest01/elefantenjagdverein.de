// Let’s make node/socketio listen on port 3000
let io = require('socket.io').listen(3000);
let Tie_Leaderboard = require('agoragames-leaderboard/lib/tie_ranking_leaderboard.js');
let hunterLeaderboard = new Tie_Leaderboard("hunterLeaderboard");

console.log(hunterLeaderboard);

// Define/initialize our global vars
let notes = [];
let socketCount = 0;

io.sockets.on('connection', function(client) {
    // Socket has connected, increase socket count
    socketCount++;
    // Let all sockets know how many are connected
    io.sockets.emit('users connected', socketCount);
    console.log("client connected", client.id);
    client.emit("connected", {
        id: client.id
    });

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

            memberScore += kill.info.points;
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

});