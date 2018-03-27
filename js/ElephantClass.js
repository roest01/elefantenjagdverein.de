jQuery(document).ready(function(){
    let connectionClass = new ConnectionClass();
    let connection = connectionClass.connect();

    let transmitter = new TransmitterClass(connection);
    let elephantManager = new ElephantClass(transmitter);
    new ReceiverClass(connection, elephantManager);
});

let ElephantClass = function(transmitter){
    let elephantManager = this;
    let gamePause = false;
    let maximumElephants = 7; //same time
    let maximumElephantsReserve = 2; //there are x slots for "special" one
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

    elephantManager.updateConnectionStatus = function(status){
        jQuery('#connectionInfo').find('.info').text(status);
    };

    elephantManager.reconnect = function(){
        elephantManager._construct();
    };

    elephantManager.clearActivePlayer = function(){
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
        if (gamePause){
            return;
        }
        if (!elephantManager.gameStarted()){
            jQuery("body").addClass("gameStarted");
        }
        if (elephant.hasClass("alive")){
            elephant.removeClass("alive").addClass("shot");

            let id = elephant.attr('id');
            if (!!elephantManager.alive[id]){
                let elephantInformations = elephantManager.alive[id];
                let eleModuleInfo = elephantManager.getEleModuleInfo(elephantInformations.name);
                elephantInformations.classes = elephant.attr('class');
                elephantManager.deadBodies.push(elephantInformations);
                delete elephantManager.alive[id];

                transmitter.killedElephant(elephantInformations, clientInfo.user);

                if (!!eleModuleInfo.killable){
                    elephantManager.handleKill();
                }

                setTimeout(function(){
                    elephant.hide('fast', function(){
                        elephant.remove();

                        if (!!eleModuleInfo.killable){
                            //deploy new elephant only if removed one was a system generated and not swayed by other players
                            elephantManager.generateElephant();
                        }
                    });
                }, 2500);
            } else {
                console.info("elephant "+id+" was never alive");
                elephant.remove();
            }
        }
    };

    elephantManager.updateKillCounter = function(kills){
        let countimator = jQuery('.counter-wheel');
        countimator.countimator({
            value: kills,
            complete: function(){
                jQuery(".counter-wheel-highlight").attr('d', '');
            }
        });
    };

    /**
     * - update kill count (visual)
     * - ask for username
     */
    elephantManager.handleKill = function(){
        let currentUser = clientInfo.getCurrentPlayer();
        if (currentUser){
            currentUser.kills++; //pre server sync
            elephantManager.updateKillCounter(currentUser.kills);

            if (currentUser.kills === 3 && currentUser.name === "anonym" ){
                elephantManager.displayNameInput();
            }
        }
    };

    elephantManager.displayNameInput = function(){
        let currentUser = clientInfo.getCurrentPlayer();
        elephantManager.pause();
        swal({
            title: "Eure Lordschaft hat <br />" + currentUser.kills + " Elefanten getötet.",
            html: "Dürfte ich ergebenst darum bitten, den Namen eurer Lordschaft zu erfahren um eure Lordschaft auf unserer <br /> 'Tafel der Ewigkeit' zu notieren.",
            input: 'text',
            inputValue: currentUser.name,
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

                    if (name.length > 14) {
                        swal.showInputError("Bitte wähle einen Namen mit maximal 14 Buchstaben. Du hast aktuell "+name.length+" Buchstaben verwendet.");
                    }
                    resolve()
                })
            },
            allowOutsideClick: true
        }).then(function(input) {
            if (!input.value){
                elephantManager.resume();
                return;
            }

            clientInfo.user.name = input.value;

            transmitter.registerWithNickname(clientInfo.user);
            elephantManager.resume();
        });
    };

    elephantManager.getEleModuleInfo = function(type){
      if (!!elephantManager.elephants[type]){
          return elephantManager.elephants[type];
      }
    };

    /**
     *
     * @param elephants array of elephant modules
     * @param requestedType string (optional) request a specific elephant
     * @returns {*}
     */
    elephantManager.filterAllowed = function(elephants, requestedType){
        if (!!requestedType && !!elephants[requestedType]){
            //a specific type is requested, proceed with him
            elephants = [elephants[requestedType]];
        } else {
            //a random elephant is requested. remove "manually" type
            jQuery.each(elephants, function(name, elephant){
                if (elephant.spawn !== "automatically"){
                    delete elephants[name];
                }
            });
        }


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
     * @param type string (optional) request specific module
     * @param additionalInfo object (optional) further informations required by elephant module
     * @returns {Object} Elephant Object
     */
    elephantManager.getElephant = function(speed, type, additionalInfo){
        let elephants = jQuery.extend(true, {}, elephantManager.elephants); // prevent reference
        elephants = elephantManager.filterAllowed(elephants, type);

        let elevantNames = Object.keys(elephants);
        let randomElephantAttr = elevantNames[Math.floor(Math.random()*elevantNames.length)];
        let singleElephant = elephants[randomElephantAttr];

        singleElephant.compiled = singleElephant.template({
            eleFolder: "server/elephants/"+singleElephant.name+"/",
            speed: speed,
            additionalInfo: additionalInfo
        });
        return singleElephant;
    };

    /**
     * @public
     */
    elephantManager.generateElephant = function(type, additionalInfo){
        let elephantManager = this;
        let container = jQuery('.ele-container');

        let aliveElephants = helper.objectSize(elephantManager.alive);

        if (
            (aliveElephants < maximumElephants ||
                (aliveElephants < maximumElephants + maximumElephantsReserve && !!type)) //2 slots for explicit requested elephants
            && !gamePause
        ){
            let randomSpeed = helper.getRandomInt(1,5);
            let elephant = elephantManager.getElephant(randomSpeed, type, additionalInfo);
            let id = elephantManager.getUniqueIdForElephant(elephant);

            elephantManager.alive[id] = {
                ID: id,
                name: elephant.name
            };

            container.append(jQuery(elephant.compiled).attr('id', id));

            if (!!elephant.killable){
                jQuery("#"+id).click(function(){
                    elephantManager.killElephant(jQuery(this));
                });
            } else {
                window.setTimeout(function(){
                    elephantManager.killElephant(jQuery("#"+id));
                }, ((8*randomSpeed) * 1000) - 2500);
                //5 sec basic time (see scss code) * speed in microsecounds minus animation time to hide
            }

            let newElephantIn = helper.getRandomInt(5,20) * 1123; //microtime
            console.log("### new elephant in "+newElephantIn / 1000);
            window.setTimeout(function(){
                elephantManager.generateElephant();
            }, newElephantIn);
        }
    };


    /**
     * @param players
     */
    elephantManager.updateRankTab = function(players){
        let rank = jQuery('#rank_list');
        rank.html('');
        jQuery.each(players, function(id, player){
            let playerData = JSON.parse(player.member_data);
            rank.append('<li class="list-group-item" id="'+playerData.encodedID+'"><span class="badge badge-success badge-pill">'+player.rank+'</span> <span class="name">'+playerData.name+'</span> ('+playerData.kills+')</li>');
        });
    };

    elephantManager.updateActivePlayers = function(players){
        jQuery.each(players, function(id, player){
            if (clientInfo.playerKnown(player.id)){
                elephantManager.updatePlayer(player); //layout
            } else {
                elephantManager.addPlayer(player); //layout
            }
            if (player.id === clientInfo.user.id){
                let userInDom = jQuery('#'+clientInfo.user.encodedID);
                userInDom.addClass('bg-secondary');

                if (!clientInfo.playerKnown(player.id)){
                    userInDom.on('click', function(){
                        elephantManager.displayNameInput();
                    });
                }
            }

            clientInfo.updateActivePlayer(player);//dataStore
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
        if (elephantManager.gameStarted()){
            jQuery("body").addClass("pause");
        }
        gamePause = true;
    };

    elephantManager.resume = function(){
        jQuery("body").removeClass("pause");
        gamePause = false;
        if (elephantManager.gameStarted()) {
            elephantManager.generateElephant();
        }
    };

    elephantManager.gameStarted = function(){
        let body = jQuery("body");
        return body.hasClass("gameStarted");
    };

    elephantManager.getUniqueIdForElephant = function(elephant){
        return md5(elephant.compiled+Date.now());
    };
};