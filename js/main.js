var elephantHandle;
var killedElephants = 0;

jQuery(document).ready(function(){
    jQuery( ".ele-wrapper" ).on( "click", function() {
        killElephant(jQuery(this));
    });

    jQuery(".counter").countimator({
        value: 10
    });
});

function domCleanup(){
    jQuery('.ele-wrapper').each(function(){
        if (!jQuery(this).hasClass("alive")){
            jQuery(this).remove();
        }
    });
}

function killElephant(elephant){
    if (elephant.hasClass("alive")){
        elephant.removeClass("alive").addClass("shot");
        console.log(killedElephants);
        killedElephants = killedElephants + 1;
        var countimator = jQuery('.counter-wheel');
        countimator.countimator({
            value: killedElephants,
            complete: function(){
                jQuery(".counter-wheel-highlight").attr('d', '');
            }
        });

        setTimeout(function(){
            elephant.hide('slow', function(){
                domCleanup();
                generateElephant();
            });
        }, 800);
    }
}


function generateElephant(){
    var container = jQuery('.ele-container');
    window.clearTimeout(elephantHandle);

    if (container.children().length < 5){
        var randomSpeed = Math.floor(Math.random() * 5) + 1;
        container.append('<div class="ele-wrapper speed'+randomSpeed+' alive">\n' +
            '            <div class="ele-tail"></div>\n' +
            '            <div class="ele-body">\n' +
            '                <div class="ele-head">\n' +
            '                    <div class="ele-eyebrows"></div>\n' +
            '                    <div class="ele-eyes"></div>\n' +
            '                    <div class="ele-mouth"></div>\n' +
            '                    <div class="ele-fang-front"></div>\n' +
            '                    <div class="ele-fang-back"></div>\n' +
            '                    <div class="ele-ear"></div>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '            <div class="ele-leg-1 ele-leg-back">\n' +
            '                <div class="ele-foot"></div>\n' +
            '            </div>\n' +
            '            <div class="ele-leg-2 ele-leg-front">\n' +
            '                <div class="ele-foot"></div>\n' +
            '            </div>\n' +
            '            <div class="ele-leg-3 ele-leg-back">\n' +
            '                <div class="ele-foot"></div>\n' +
            '            </div>\n' +
            '            <div class="ele-leg-4 ele-leg-front">\n' +
            '                <div class="ele-foot"></div>\n' +
            '            </div>\n' +
            '        </div>');

        jQuery(".ele-wrapper").click(function(){
            killElephant(jQuery(this));
        });

        var rand = Math.floor(Math.random() * 20) + 5;
        var newElephantIn = rand * 1123;
        if (newElephantIn === 0){ //fallback if 0
            newElephantIn = 5000;
        }
        elephantHandle = window.setTimeout(function(){
            generateElephant();
        }, newElephantIn);
    }



}