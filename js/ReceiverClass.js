/**
 *
 * @param server
 * @param client clientClass / elephantManager
 */
let ReceiverClass = function(server, client){
    let receiver = this;

    server.on('player updated', function(playerInfo) {
        client.updateActivePlayers(playerInfo);
    });

    server.on('connected', function(clientInfo) {
        console.log("(RC): got clientInfo", clientInfo);
        client.setClientInfo(clientInfo);
    });

    server.on('receive eleModules', function(eleModules){
        client.setElephantModules(eleModules);
    });

};