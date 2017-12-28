let md5 = require('blueimp-md5');

exports.ServerInfoClass = function(hunterLeaderboard){
    let serverInfo = this;
    let playerDefaults = {
        kills: 0,
        name: "anonym",
        id: null,
        encodedID: null //used for reference in DOM
    };

    serverInfo.hunterLeaderboard = hunterLeaderboard;
    serverInfo.activePlayer = {};
    serverInfo.currentUser = {};

    /**
     * set default attributes on player object
     * @param player
     * @returns {*}
     * @private
     */
    serverInfo._updatePlayerWithDefaults = function (player) {
        return new Promise(function(resolve) {

            for (let key in playerDefaults) {
                if (!player[key] && playerDefaults.hasOwnProperty(key)) {
                    player[key] = playerDefaults[key];
                }
            }
            if (!player.encodedID) {
                player.encodedID = md5(player.id);
            }
            resolve(player);
        });
    };

    serverInfo.mergePlayerWithServer = function(player){
        return new Promise(function(resolve){
            hunterLeaderboard.rankedInList([player.id], {withMemberData:true}, function(ranked) {
                if (!!ranked[0]){
                    let member = ranked[0];
                    try {
                        let memberData = JSON.parse(member.member_data);
                        for (let key in memberData){
                            if (!player[key] && memberData.hasOwnProperty(key)){
                                player[key] = memberData[key];
                            }
                        }
                        resolve(player);
                    } catch (e) {
                        //console.error(e);
                        resolve(player);
                    }
                }
            });
        });
    };

    serverInfo.updateActivePlayer = function(id, player){
        return new Promise(function(resolve){
            hunterLeaderboard.checkMember(id, function(result){
                if (result){
                    serverInfo.mergePlayerWithServer(player).then(function(mPlayer){
                        serverInfo.activePlayer[mPlayer.id] = mPlayer;
                        resolve(mPlayer);
                    });
                } else {
                    serverInfo._updatePlayerWithDefaults(player).then(function(dPlayer){
                        serverInfo.activePlayer[dPlayer.id] = dPlayer;
                        resolve(dPlayer);
                    });
                }
            });

        })
    };

    /**
     * stores member data in database without modify rank
     * @param player
     */
    serverInfo.syncInDatabase = function(player){
        hunterLeaderboard.scoreFor(player.id, function(memberScore) {
            if (memberScore === null){
                memberScore = 0;
            }

            hunterLeaderboard.rankMember(player.id, memberScore, JSON.stringify(player));
        });
    };

    serverInfo.getFirstRankPage = function(){
        return new Promise(function(resolve){
            hunterLeaderboard.leaders(1, {'withMemberData': true}, function(leaders){
                resolve(leaders);
            });
        });
    };

    serverInfo.removeActivePlayer = function(id){
        delete serverInfo.activePlayer[id];
    };

    serverInfo.getActivePlayers = function(){
        return serverInfo.activePlayer;
    };

    serverInfo.getPlayerByID = function(id){
        return serverInfo.activePlayer[id];
    };

    serverInfo.getTotalPlayers = function(){
        return Object.keys(serverInfo.activePlayer).length;
    };

    serverInfo.storeUserInformation = function(id, information){
        return new Promise(function(resolve){
            let player = serverInfo.getPlayerByID(id);
            for (let key in information) {
                if (information.hasOwnProperty(key)) {
                    player[key] = information[key];
                }
            }
            serverInfo.updateActivePlayer(id, player).then(function(){
                resolve();
            });
        })
    };

    serverInfo.__construct = function(){

    };

    serverInfo.__construct();
};