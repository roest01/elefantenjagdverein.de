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

    elephantManager.templateStorage = ["default", "benjamin"];
    elephantManager.alive = {
        starter: {
            id: "starter",
            type: "default"
        }
    };
    elephantManager.killedElephants = 0;
    elephantManager.deadBodies = [];

    elephantManager._construct = function(){
        server.connect().then(function(){
            elephantManager.startGame();
        });
    };

    elephantManager.startGame = function(){
        jQuery( ".ele-wrapper" ).on( "click", function() {
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

                server.killedElephant(elephantInformations);

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
            case 3:
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
                    if (result.value) {
                        console.log("result",result);
                    }
                });
                break;
        }
    };

    elephantManager.filterAllowed = function(templateStorage){
        if(helper.size(elephantManager.alive) > 0){
            jQuery.each(elephantManager.alive, function(id, elephant){
                if (elephant.type === "benjamin"){
                    templateStorage = helper.removeArrayElement("benjamin", templateStorage);
                }
            });
        }
        return templateStorage;
    };

    elephantManager.getElephant = function(speed){
        let templateStorage = elephantManager.templateStorage.slice(0); //slice to prevent reference
        templateStorage = elephantManager.filterAllowed(templateStorage);
        let templateName = templateStorage[Math.floor(Math.random()*templateStorage.length)];
        let template = Handlebars.templates[templateName+".hbs"];
        return {
            type: templateName,
            template: template({speed: speed})
        };
    };

    /**
     * @public
     */
    elephantManager.generateElephant = function(){
        let elephantManager = this;
        let container = jQuery('.ele-container');
        window.clearTimeout(elephantHandle);

        if (helper.size(elephantManager.alive) < maximumElephants && !gamePause){
            let randomSpeed = elephantManager.getRandomInt(1,5);
            let elephant = elephantManager.getElephant(randomSpeed);
            let id = elephantManager.getUniqueIdForElephant(elephant);

            elephantManager.alive[id] = {
                ID: id,
                type: elephant.type
            };

            container.append(jQuery(elephant.template).attr('id', id));

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
        return md5(elephant.template+Date.now());
    };

    elephantManager.getRandomInt = function(from,to){
        return Math.floor(Math.random() * to) + from;
    };
};