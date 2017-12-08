
let TransmitterClass = function(connection){
    let transmitter = this;

    transmitter.initialized = function(){
        connection.emit('initialized');
    };

    transmitter.getElephantModules = function(){
        connection.emit("request eleModules");
    };

    transmitter.killedElephant = function(elephantInformations){
        connection.emit('killed elephant', {
            info: elephantInformations,
            user: transmitter.user
        });
    };

    transmitter.registerWithNickname = function(nickname){
        transmitter.user.name = nickname;
        connection.emit('set nickname', transmitter.user);
    };
};