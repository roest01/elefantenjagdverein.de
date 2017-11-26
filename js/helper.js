var helperClass = function(){
    var helper = this;

    /**
     * calculating object.length
     * @example var size = Object.size(myObj);
     * @param obj
     * @returns {number}
     */
    helper.size = function(obj){
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    helper.removeArrayElement = function(remove, fromArray){
        if (!!remove){
            var index = fromArray.indexOf(remove);
            if(index!==-1){
                fromArray.splice(index, 1);
            }
        }
        return fromArray;
    };
};