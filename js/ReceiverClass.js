/**
 *
 * @param server
 * @param client clientClass / elephantManager
 */
let ReceiverClass = function(server, client){
    let receiver = this;

    server.on('users connected', function(connected){
        client.updateUsersConnected(connected);
    });

    server.on('update active player', function(players) {
        console.log("(RC) update active player", players);
        client.updateActivePlayers(players);
    });

    server.on('connected', function(clientInfo) {
        console.log("(RC): got clientInfo", clientInfo);
        client.setClientInfo(clientInfo);
        client.updateConnectionStatus("verbunden");
        client.updateKillCounter(clientInfo.kills);
    });

    server.on('reconnect_attempt', function(){
        client.updateConnectionStatus("erneut verbinden");
        client.clearActivePlayer();
        client.pause();
    });

    server.on('reconnect', function(){
        client.updateConnectionStatus("verbinde ...");
        client.resume();
    });

    server.on('server ready', function(){
        client._construct();
    });

    server.on('client disconnected', function(id) {
        console.log("(RC): client disconnected", id);
        client.activePlayerDisconnected(id);
    });

    server.on('receive eleModules', function(eleModules){
        console.log("(RC): receive eleModules");
        client.setElephantModules(eleModules);
    });
};