let elephantHandle;


jQuery(document).ready(function(){
    let connectionClass = new ConnectionClass();
    let connection = connectionClass.connect();

    let transmitter = new TransmitterClass(connection);
    let elephantManager = new ElephantClass(transmitter);
    new ReceiverClass(connection, elephantManager);

    elephantManager._construct(); //go go go
});

let ElephantClass = function(transmitter){
    let elephantManager = this;
    let gamePause = false;
    let maximumElephants = 7; //same time
    let helper = new HelperClass();
    let clientInfo = new ClientInfo();

    elephantManager.elephants = {};
    elephantManager.activePlayer = {};
    elephantManager.alive = {
        starter: {
            id: "starter",
            name: "default"
        }
    };
    elephantManager.killedElephants = 0;
    elephantManager.deadBodies = [];

    /** ### Server Communication ## **/

    elephantManager._construct = function(){
        transmitter.initialized();
        transmitter.getElephantModules();
    };

    elephantManager.setClientInfo = function(user){
        clientInfo.user = user;
    };

    elephantManager.setElephantModules = function(elephants){
        elephantManager.loadEleModules().then(function(eleModules){
            elephantManager.elephants = eleModules;
            elephantManager.startGame(); //@todo wrong logical call position
        });
    };

    elephantManager.clearActivePlayer = function(){
        console.log("clear active player");
        clientInfo.activePlayer = {};
        jQuery('#just_online').html('');
    };

    /** ## Game Code ## **/

    /**
     * @deprecated
     * @returns {Promise}
     */
    elephantManager.loadEleModules = function(){
        let eleFolder = "server/elephants/";
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
        console.log("killElephant", clientInfo);
        if (elephant.hasClass("alive")){
            elephant.removeClass("alive").addClass("shot");

            let id = elephant.attr('id');
            if (!!elephantManager.alive[id]){
                let elephantInformations = elephantManager.alive[id];
                elephantInformations.classes = elephant.attr('class');
                elephantManager.deadBodies.push(elephantInformations);
                delete elephantManager.alive[id];
                elephantManager.killedElephants++;

                transmitter.killedElephant(elephantInformations, clientInfo.user);

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

    /**
     * - update kill count (visual)
     * - ask for username
     */
    elephantManager.handleKill = function(){
        let currentUser = clientInfo.getCurrentPlayer();
        currentUser.kills++; //pre server sync
        console.log("currentUser", currentUser);
        let countimator = jQuery('.counter-wheel');
        countimator.countimator({
            value: currentUser.kills,
            complete: function(){
                jQuery(".counter-wheel-highlight").attr('d', '');
            }
        });

        if (currentUser.kills === 3 || currentUser.kills === 30 && currentUser.name === "anonym"){
            elephantManager.pause();
            swal({
                title: "Eure Lordschaft hat <br />" + currentUser.kills + " Elefanten getötet.",
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
            }).then(function(input) {
                clientInfo.user.name = input.value;
                transmitter.registerWithNickname(clientInfo.user);
                elephantManager.resume();
            });
        }
    };

    elephantManager.filterAllowed = function(elephants){
        if(helper.objectSize(elephantManager.alive) > 0){
            const aLiveCounts = {};
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
            eleFolder: "server/elephants/"+singleElephant.name+"/",
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
            let randomSpeed = helper.getRandomInt(1,5);
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

            let newElephantIn = helper.getRandomInt(5,20) * 1123; //microtime
            console.log("### new elephant in "+newElephantIn / 1000);
            elephantHandle = window.setTimeout(function(){
                elephantManager.generateElephant();
            }, newElephantIn);
        }
    };


    elephantManager.initActivePlayers = function(players){
        jQuery.each(players, function(id, player){
            console.log("set player", player);
            elephantManager.addPlayer(player);
        });
    };

    elephantManager.updateActivePlayers = function(players){
        jQuery.each(players, function(id, player){
            if (clientInfo.playerKnown(player.id)){
                elephantManager.updatePlayer(player); //layout
            } else {
                elephantManager.addPlayer(player); //layout
            }
            clientInfo.updateActivePlayer(player);//dataStore

            if (player.id === clientInfo.user.id){
                jQuery('#'+clientInfo.user.encodedID).addClass('bg-secondary');
            }
        });
    };

    elephantManager.addPlayer = function(player){
        jQuery('#just_online').append('<li class="list-group-item" id="'+player.encodedID+'"><span class="name">'+player.name+'</span> <span class="badge badge-info badge-pill">'+player.kills+'</span></li>');
        return true;
    };

    elephantManager.updatePlayer = function(player){
        let DOMPlayer = jQuery('#'+player.encodedID);
        DOMPlayer.find(".name").html(player.name);
        DOMPlayer.find(".badge").html(player.kills);
        return true;
    };

    elephantManager.updateUsersConnected = function(connected){
        jQuery('#activeNow').html(connected);
    };

    elephantManager.activePlayerDisconnected = function(playerID){
        console.log("activePlayerDisconnected", playerID);
        jQuery('#'+playerID).remove();
    };

    elephantManager.pause = function(){
        jQuery("body").addClass("pause");
        gamePause = true;
    };

    elephantManager.resume = function(){
        jQuery("body").removeClass("pause");
        gamePause = false;
        elephantManager.generateElephant();
    };

    elephantManager.getUniqueIdForElephant = function(elephant){
        return md5(elephant.compiled+Date.now());
    };
};