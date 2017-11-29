
let socketManagerClass = function(){
    let socketManager = this;
    let serverConnection = io.connect('http://localhost:3000');

    socketManager.user = {
        name: "anonym",
        id: ""
    };

    socketManager.connect = function(){
        return new Promise(function(resolve, reject) {
            serverConnection.on('connected', function(client) {
                console.log("(SM): got client.id", client.id, "starting game");
                socketManager.user.id = client.id;
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