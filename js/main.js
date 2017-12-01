let elephantHandle;


jQuery(document).ready(function(){
    let socketManager = new socketManagerClass();
    let elephantManager = new elephantManagerClass(socketManager);
    elephantManager._construct(); //go go go
});

let elephantManagerClass = function(server){
    let elephantManager = this;
    let gamePause = false;
    let maximumElephants = 7; //same time
    let helper = new helperClass();

    elephantManager.elephants = {};
    elephantManager.alive = {
        starter: {
            id: "starter",
            name: "default"
        }
    };
    elephantManager.killedElephants = 0;
    elephantManager.deadBodies = [];


    elephantManager._construct = function(){
        elephantManager.loadEleModules().then(function(elephants){
            elephantManager.elephants = elephants;
            elephantManager.startGame();
            //server.connect().then(function(){ //@todo implement Server
            //    elephantManager.startGame();
            //});
        });
    };

    elephantManager.loadEleModules = function(){
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

    elephantManager.startGame = function(){
        console.log("#### StartGame ###");

        let firstElephant = jQuery( ".ele-wrapper" );
        firstElephant.addClass("killable");
        firstElephant.on( "click", function() {
            elephantManager.killElephant(jQuery(this));
        });
    };

    elephantManager.killElephant = function(elephant){
        if (elephant.hasClass("alive")){
            elephant.removeClass("alive").addClass("shot");

            let id = elephant.attr('id');
            if (!!elephantManager.alive[id]){
                let elephantInformations = elephantManager.alive[id];
                elephantInformations.classes = elephant.attr('class');
                elephantManager.deadBodies.push(elephantInformations);
                delete elephantManager.alive[id];
                elephantManager.killedElephants++;

                if (server.connected){
                    server.killedElephant(elephantInformations);
                }

                elephantManager.handleKill();
            } else {
                console.info("elephant "+id+" was never alive");
            }

            setTimeout(function(){
                elephant.hide('fast', function(){
                    elephant.remove();
                    elephantManager.generateElephant();
                });
            }, 3000);
        }
    };

    elephantManager.handleKill = function(){
        let countimator = jQuery('.counter-wheel');
        countimator.countimator({
            value: elephantManager.killedElephants,
            complete: function(){
                jQuery(".counter-wheel-highlight").attr('d', '');
            }
        });

        switch(elephantManager.killedElephants) {
            case 1:

                break;
            case -1: //disabled
                elephantManager.pause();
                swal({
                    title: "Eure Lordschaft hat <br />"+elephantManager.killedElephants +" Elefanten getötet.",
                    html: "Dürfte ich ergebenst darum bitten, den Namen eurer Lordschaft zu erfahren um eure Lordschaft auf unserer <br /> 'Tafel der Ewigkeit' zu notieren.",
                    input: 'text',
                    showCancelButton: true,
                    confirmButtonText: 'Mein Name sei dein',
                    cancelButtonText: 'Nein!',
                    showLoaderOnConfirm: true,
                    preConfirm: function (name)  {
                        return new Promise(function (resolve) {
                            if (name === '') {
                                swal.showValidationError(
                                    'Eure Lorschaft möge den Namen nicht leer lassen'
                                )
                            }
                            resolve()
                        })
                    },
                    allowOutsideClick: true
                }).then(function(result) {
                    elephantManager.resume();
                    if (result.value) { //@todo push to server
                        console.log("result",result);
                    }
                });
                break;
        }
    };

    elephantManager.filterAllowed = function(elephants){
        if(helper.objectSize(elephantManager.alive) > 0){
            let aLiveCounts = {};
            jQuery.each(elephantManager.alive, function(id, elephant){
                if (!aLiveCounts[elephant.name]){ //calculate actual state
                    aLiveCounts[elephant.name] = 0;
                }
                aLiveCounts[elephant.name]++;
            });

            jQuery.each(aLiveCounts, function(aLiveName, aLiveCount){
                //remove elephants when active elephants (aLiveCount) breaks with config allowedAtSameTime
                if (!!elephants[aLiveName] && !!elephants[aLiveName].allowedAtSameTime){
                    let allowedAtSameTime = elephants[aLiveName].allowedAtSameTime;

                    if (allowedAtSameTime > 0 && aLiveCount >= allowedAtSameTime){
                        delete elephants[aLiveName];
                    }
                }
            });
        }

        return elephants;
    };

    /**
     *
     * @param speed
     * @returns {Object} Elephant Object
     */
    elephantManager.getElephant = function(speed){
        let elephants = jQuery.extend(true, {}, elephantManager.elephants); // prevent reference
        elephants = elephantManager.filterAllowed(elephants);

        let elevantNames = Object.keys(elephants);
        let randomElephantAttr = elevantNames[Math.floor(Math.random()*elevantNames.length)];
        let singleElephant = elephants[randomElephantAttr];

        singleElephant.compiled = singleElephant.template({
            eleFolder: "elephants/"+singleElephant.name+"/",
            speed: speed
        });
        return singleElephant;
    };

    /**
     * @public
     */
    elephantManager.generateElephant = function(){
        let elephantManager = this;
        let container = jQuery('.ele-container');
        window.clearTimeout(elephantHandle);

        if (helper.objectSize(elephantManager.alive) < maximumElephants && !gamePause){
            let randomSpeed = elephantManager.getRandomInt(1,5);
            let elephant = elephantManager.getElephant(randomSpeed);
            let id = elephantManager.getUniqueIdForElephant(elephant);

            elephantManager.alive[id] = {
                ID: id,
                name: elephant.name
            };

            container.append(jQuery(elephant.compiled).attr('id', id));

            jQuery("#"+id).click(function(){
                elephantManager.killElephant(jQuery(this));
            });

            let newElephantIn = elephantManager.getRandomInt(5,20) * 1123; //microtime
            elephantHandle = window.setTimeout(function(){
                elephantManager.generateElephant();
            }, newElephantIn);
        }
    };

    elephantManager.pause = function(){
        jQuery("body").addClass("pause");
        gamePause = true;
    };

    elephantManager.resume = function(){
        jQuery("body").removeClass("pause");
        gamePause = false;
    };

    elephantManager.getUniqueIdForElephant = function(elephant){
        return md5(elephant.compiled+Date.now());
    };

    elephantManager.getRandomInt = function(from,to){
        return Math.floor(Math.random() * to) + from;
    };
};