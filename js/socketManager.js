
let socketManagerClass = function(){
    let socketManager = this;
    let serverConnection;

    socketManager.connected = false;
    socketManager.user = {
        name: "anonym",
        id: ""
    };

    socketManager.connect = function(){
        socketManager.serverConnection = io.connect('http://localhost:3000');
        return new Promise(function(resolve, reject) {
            serverConnection.on('connected', function(client) {
                console.log("(SM): got client.id", client.id, "starting game");
                socketManager.user.id = client.id;
                socketManager.connected = true;
                resolve();
            });

        });
    };

    socketManager.killedElephant = function(elephantInformations){
        serverConnection.emit('killed elephant', {
            info: elephantInformations,
            user: socketManager.user
        });
    };
};