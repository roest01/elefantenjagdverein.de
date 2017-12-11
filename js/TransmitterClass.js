
let TransmitterClass = function(connection){
    let transmitter = this;

    transmitter.initialized = function(){
        connection.emit('initialized');
    };

    transmitter.getElephantModules = function(){
        connection.emit("request eleModules");
    };

    transmitter.killedElephant = function(elephantInformations, user){
        console.log("transmitter killed elephant");
        connection.emit('killed elephant', {
            info: elephantInformations,
            user: user
        });
    };

    transmitter.registerWithNickname = function(user){
        connection.emit('register with nickname', user);
    };
};