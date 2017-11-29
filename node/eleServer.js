let eleServerClass = function(){
    let eleServer = this;

    eleServer.getPointsByElephant = function(elephant){
        switch(elephant.type) {
            case "default":
                return 1;
                break;
        }
    }
};