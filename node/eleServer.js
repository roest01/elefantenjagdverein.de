exports.EleServerClass = function(){
    let eleServer = this;

    /**
     *
     * @param name {String} Elephant Type / Name
     * @returns {number}
     */
    eleServer.getPointsByElephant = function(name){
        switch(name) {
            case "default":
                return 1;
                break;
            case "benjamin":
                return 2;
                break;
            default:
                return 1;
        }
    };

    /**
     * @todo refactor this method to work without jquery
     * @returns {Promise}
     */
    eleServer.loadEleModules = function(){
        return new Promise(function(resolve, reject) {//@todo remove if finished
            resolve({});
        });
        let eleFolder = "elephants/";
        return new Promise(function(resolve, reject){
            let elephants = {};
            jQuery.getJSON(eleFolder+'elephants.json', function(activeElephants){
                jQuery.each(activeElephants, function(index, elephantName){
                    jQuery.getJSON(eleFolder+elephantName+"/"+elephantName+".json", function(config){
                        jQuery.extend(config, {
                            name:  elephantName,
                            template: Handlebars.templates[elephantName+".hbs"]
                        });
                        elephants[elephantName] = config;

                        if (index === (activeElephants.length - 1)){
                            resolve(elephants);
                        }
                    });
                });
            });
        });
    };
};