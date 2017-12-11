const fs = require('fs');
const Handlebars = require('handlebars');

require('./elephants/elephants.tpl');

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
                return 1;
                break;
            default:
                return 1;
        }
    };

    /**
     * @returns {Promise}
     */
    eleServer.loadEleModules = function(){
        let eleFolder = "server/elephants/";
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
                    let details = {
                        name:  elephantName,
                        template: Handlebars.templates[elephantName+".hbs"]
                    };

                    for (let key in details){
                        if (details.hasOwnProperty(key)){
                            config[key] = details[key];
                        }
                    }

                    elephants[elephantName] = config;

                    if (index === (activeElephants.length - 1)){
                        resolve(elephants);
                    }
                }
            });
        });
    };
};