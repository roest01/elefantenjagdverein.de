
let socketManagerClass = function(){
    let socketManager = this;
    let serverConnection;

    socketManager.connected = false;
    socketManager.user = {
        name: "anonym",
        id: ""
    };

    socketManager.connect = function(){
        serverConnection = io('http://localhost:3000', {
            path: '/eleServer'
        });
        return new Promise(function(resolve, reject) {
            serverConnection.on('connected', function(clientInfo) {
                console.log("(SM): got clientInfo.id", clientInfo.id, "starting game");
                socketManager.user.id = clientInfo.id;
                socketManager.connected = true;
                resolve();
            });

        });
    };

    socketManager.getElephantModules = function(){
        return new Promise(function(resolve, reject){
            serverConnection.emit("request eleModules", {}, function(eleModules){
                console.log("gotEleModules", eleModules);
                resolve(eleModules);
            })
        });
    };

    socketManager.killedElephant = function(elephantInformations){
        serverConnection.emit('killed elephant', {
            info: elephantInformations,
            user: socketManager.user
        });
    };

    socketManager.registerWithNickname = function(nickname){
        serverConnection.emit('set nickname', nickname);
    };
};