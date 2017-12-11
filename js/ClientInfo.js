
let ClientInfo = function(){
    let clientInfo = this;
    clientInfo.activePlayer = {};

    clientInfo.user = {};

    clientInfo.updateActivePlayer = function(player){
        clientInfo.activePlayer[player.id] = player;
    };

    clientInfo.removeActivePlayer = function(player){
        delete clientInfo.activePlayer[player.id];
    };

    clientInfo.getActivePlayers = function(player){
        return clientInfo.activePlayer;
    };

    clientInfo.getCurrentPlayer = function(){
        return clientInfo.activePlayer[clientInfo.user.id];
    };

    clientInfo.playerKnown = function(id){
        return (!!clientInfo.activePlayer[id]);
    };



    clientInfo.__construct = function(){

    };

    clientInfo.__construct();
};