let HelperClass = function(){
    let helper = this;

    /**
     * calculating object.length
     * @example let objectSize = Object.objectSize(myObj);
     * @param obj
     * @returns {number}
     */
    helper.objectSize = function(obj){
        let size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    helper.removeArrayElement = function(remove, fromArray){
        if (!!remove){
            let index = fromArray.indexOf(remove);
            if(index!==-1){
                fromArray.splice(index, 1);
            }
        }
        return fromArray;
    };

    helper.getRandomInt = function(from,to){
        return Math.floor(Math.random() * to) + from;
    };
};