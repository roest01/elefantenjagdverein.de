
let ConnectionClass = function(){
    let connection = this;

    connection.connect = function(){
        let userid = connection.getUserid();
        let serverConnection = io('http://'+window.location.hostname+':3000?userid='+userid, {
            path: '/eleServer',
            forceNew: false
        });

        serverConnection.on('pong', function(){
            userid = connection.getUserid(); //refresh cookie expire
        });
        return serverConnection;
    };

    connection.getUserid = function() {
        let userid = Cookies.get('userid');

        if (!userid){
            userid = connection.generateGUID();
        }
        let inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);
        Cookies.set('userid', userid, { expires: inFifteenMinutes });
        return userid;
    };

    connection.generateGUID = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
};