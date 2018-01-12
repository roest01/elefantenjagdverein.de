let Server = function(){
    let server = this;

    server.connectRedis = function(){
        console.log("### connect to redis ###");

        return new Promise(function(resolve,reject){
            let redis = require('redis');
            let connection = redis.createClient("6379", "localhost");

            connection.on('error', function(e){
                console.log(e.message);
            });

            connection.on('connect', function(){
                resolve(connection);
            });
        })
    };

    server._construct = function(){
        // Let’s make node/socketio listen on port 3000
        server.io = require('socket.io')(3000, {
            path: '/eleServer',
            pingInterval: 30000
        });

        server.connectRedis().then(function(connection){
            let Leaderboard = require('agoragames-leaderboard/lib/leaderboard.js');
            server.hunterLeaderboard = new Leaderboard("hunterLeaderboard", null, {
                'redis_connection': connection
            });

            let eleServerJS = require('./eleServer.js');
            server.eleServer = new eleServerJS.EleServerClass();

            let ServerInfoClass = require('./ServerInfo.js');
            server.serverInfo = new ServerInfoClass.ServerInfoClass(hunterLeaderboard);

            console.log("### Server up and running ###");
            server.run();
        });
    };

    server.run = function(){
        server.io.sockets.on('connection', function(client) {
            client.userId = client.handshake.query.userid;
            console.log("client connected", client.userId);

            server.serverInfo.updateActivePlayer(client.userId, {
                id: client.userId
            }).then(function(){
                //server.io.sockets.emit('users connected', server.serverInfo.getTotalPlayers());
                //server.io.sockets.emit("update active player", server.serverInfo.getActivePlayers());
            });

            client.on('disconnect', function () {
                server.serverInfo.removeActivePlayer(client.userId);
                server.io.sockets.emit('users connected', server.serverInfo.getTotalPlayers());
                server.io.sockets.emit('client disconnected', client.userId);
                console.log("client disconnected", client.userId);
            });

            /**
             * {elephantInformations, user}
             */
            client.on('killed elephant', function (kill) {
                let user = kill.user;
                hunterLeaderboard.scoreFor(user.id, function(memberScore) {
                    if (memberScore === null){
                        memberScore = 0;
                    }

                    memberScore += server.eleServer.getPointsByElephant(kill.info.name);
                    server.serverInfo.storeUserInformation(user.id, {
                        kills: memberScore
                    });

                    hunterLeaderboard.rankMember(user.id, memberScore, JSON.stringify(server.serverInfo.getPlayerByID(user.id)), function(){
                        server.io.sockets.emit('update active player', [server.serverInfo.getPlayerByID(user.id)]);
                        server.serverInfo.getFirstRankPage().then(function(players){
                            server.io.sockets.emit("update rank player", players);
                        });
                    });
                });
            });

            client.on('initialized', function(){
                let user = server.serverInfo.getPlayerByID(client.userId);
                if (user){
                    client.emit("connected", server.serverInfo.getPlayerByID(client.userId));
                    //client.emit("update active player", server.serverInfo.getActivePlayers());

                    server.io.sockets.emit('users connected', server.serverInfo.getTotalPlayers());
                    server.io.sockets.emit("update active player", server.serverInfo.getActivePlayers());

                    server.serverInfo.getFirstRankPage().then(function(players){
                        server.io.sockets.emit("update rank player", players);
                    });
                }
            });


            client.on('request eleModules', function(){
                server.eleServer.loadEleModules().then(function(eleModules){
                    client.emit("receive eleModules", eleModules);
                });
            });

            client.on('register with nickname', function(user){
                let striptags = require('striptags');
                user.name = striptags(user.name);

                server.serverInfo.storeUserInformation(user.id, {
                    name: user.name
                });
                server.serverInfo.syncInDatabase(server.serverInfo.getPlayerByID(user.id));

                server.io.sockets.emit('update active player', [server.serverInfo.getPlayerByID(user.id)]);
            });

            client.emit("server ready");
        });
    };
    server._construct();
}();


