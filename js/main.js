var elephantHandle;

jQuery(document).ready(function(){
    var elephantManager = new elephantManagerClass();

    jQuery( ".ele-wrapper" ).on( "click", function() {
        elephantManager.killElephant(jQuery(this));
    });
});

var elephantManagerClass = function(){
    var elephantManager = this;
    var maximumElephants = 7; //same time
    var helper = new helperClass();

    elephantManager.templateStorage = ["default", "benjamin"];
    elephantManager.alive = {
        starter: {
            id: "starter",
            type: "default"
        }
    };
    elephantManager.killedElephants = 0;
    elephantManager.deadBodies = [];

    elephantManager.killElephant = function(elephant){
        if (elephant.hasClass("alive")){
            elephant.removeClass("alive").addClass("shot");

            var id = elephant.attr('id');
            if (!!elephantManager.alive[id]){
                var elephantInformations = elephantManager.alive[id];
                elephantInformations.classes = elephant.attr('class');
                elephantManager.deadBodies.push(elephantInformations);
                delete elephantManager.alive[id];

                elephantManager.killedElephants++;
                var countimator = jQuery('.counter-wheel');
                countimator.countimator({
                    value: elephantManager.killedElephants,
                    complete: function(){
                        jQuery(".counter-wheel-highlight").attr('d', '');
                    }
                });
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
        var templateStorage = elephantManager.templateStorage.slice(0); //slice to prevent reference
        templateStorage = elephantManager.filterAllowed(templateStorage);
        var templateName = templateStorage[Math.floor(Math.random()*templateStorage.length)];
        var template = Handlebars.templates[templateName+".hbs"];
        return {
            type: templateName,
            template: template({speed: speed})
        };
    };

    /**
     * @public
     */
    elephantManager.generateElephant = function(){
        var elephantManager = this;
        var container = jQuery('.ele-container');
        window.clearTimeout(elephantHandle);

        if (helper.size(elephantManager.alive) < maximumElephants){
            var randomSpeed = elephantManager.getRandomInt(1,5);
            var elephant = elephantManager.getElephant(randomSpeed);
            var id = elephantManager.getUniqueIdForElephant(elephant);

            elephantManager.alive[id] = {
                ID: id,
                type: elephant.type
            };

            container.append(jQuery(elephant.template).attr('id', id));

            jQuery("#"+id).click(function(){
                elephantManager.killElephant(jQuery(this));
            });

            var newElephantIn = elephantManager.getRandomInt(5,20) * 1123; //microtime
            elephantHandle = window.setTimeout(function(){
                elephantManager.generateElephant();
            }, newElephantIn);
        }
    };

    elephantManager.getUniqueIdForElephant = function(elephant){
        return md5(elephant.template+Date.now());
    };

    elephantManager.getRandomInt = function(from,to){
        return Math.floor(Math.random() * to) + from;
    };
};