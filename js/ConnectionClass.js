
let ConnectionClass = function(){
    let connection = this;
    let connected = false;

    connection.connect = function(){
        let serverConnection = io('http://localhost:3000', {
            path: '/eleServer'
        });
        connected = true;
        return serverConnection;
    };
};