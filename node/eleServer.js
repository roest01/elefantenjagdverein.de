const fs = require('fs');

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
        let eleFolder = "elephants/";
        return new Promise(function(resolve, reject){
            let elephants = {};
            const elephantsContent = fs.readFileSync(eleFolder+"elephants.json", "utf-8");
            const activeElephants = JSON.parse(elephantsContent);
            if (!Array.isArray(activeElephants)) {
                reject(new Error("elephants.json malformed"));
            }
            activeElephants.forEach(function(elephantName, index){
                const content = fs.readFileSync(eleFolder+elephantName+"/"+elephantName+".json", "utf-8");
                const config = JSON.parse(content);
                if (config){
                    jQuery.extend(config, {
                        name:  elephantName,
                        template: elephantName+".hbs" // was: Handlebars.templates[elephantName+".hbs"]
                    });
                    elephants[elephantName] = config;

                    if (index === (activeElephants.length - 1)){
                        resolve(elephants);
                    }
                }
            });
        });
    };
};
