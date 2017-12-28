// Let’s make node/socketio listen on port 3000
let io = require('socket.io')(3000, {
    path: '/eleServer',
    pingInterval: 30000
});

let Leaderboard = require('agoragames-leaderboard/lib/leaderboard.js');
let hunterLeaderboard = new Leaderboard("hunterLeaderboard");

let eleServerJS = require('./eleServer.js');
let eleServer = new eleServerJS.EleServerClass();

let ServerInfoClass = require('./ServerInfo.js');
let serverInfo = new ServerInfoClass.ServerInfoClass(hunterLeaderboard);

io.sockets.on('connection', function(client) {
    client.userId = client.handshake.query.userid;
    console.log("client connected", client.userId);

    serverInfo.updateActivePlayer(client.userId, {
        id: client.userId
    }).then(function(){
        //io.sockets.emit('users connected', serverInfo.getTotalPlayers());
        //io.sockets.emit("update active player", serverInfo.getActivePlayers());
    });

    client.on('disconnect', function () {
        serverInfo.removeActivePlayer(client.userId);
        io.sockets.emit('users connected', serverInfo.getTotalPlayers());
        io.sockets.emit('client disconnected', client.userId);
        console.log("client disconnected", client.userId);
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
            serverInfo.storeUserInformation(user.id, {
                kills: memberScore
            });

            hunterLeaderboard.rankMember(user.id, memberScore, JSON.stringify(serverInfo.getPlayerByID(user.id)), function(){
                io.sockets.emit('update active player', [serverInfo.getPlayerByID(user.id)]);
                /*io.sockets.emit('rank updated', {
                    user: user,
                    memberScore: memberScore
                });*/
            });
        });
        serverInfo.getFirstRankPage().then(function(players){
            io.sockets.emit("update rank player", players);
        });
    });

    client.on('initialized', function(){
        client.emit("connected", serverInfo.getPlayerByID(client.userId));
        //client.emit("update active player", serverInfo.getActivePlayers());

        io.sockets.emit('users connected', serverInfo.getTotalPlayers());
        io.sockets.emit("update active player", serverInfo.getActivePlayers());

        serverInfo.getFirstRankPage().then(function(players){
            io.sockets.emit("update rank player", players);
        });
    });


    client.on('request eleModules', function(){
        eleServer.loadEleModules().then(function(eleModules){
            client.emit("receive eleModules", eleModules);
        });
    });

    client.on('register with nickname', function(user){
        let striptags = require('striptags');
        user.name = striptags(user.name);

        serverInfo.storeUserInformation(user.id, {
           name: user.name
       });
        serverInfo.syncInDatabase(serverInfo.getPlayerByID(user.id));

        io.sockets.emit('update active player', [serverInfo.getPlayerByID(user.id)]);
    });

    client.emit("server ready");
});