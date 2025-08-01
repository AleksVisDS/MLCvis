//LineChart removed, just sorting functions
function maxArg(list) {
    var maxIndex = 0;
    var val = -0.5;
    for(var i = 0; i<list.length; i++) {
        if(list[i] > val) {
            val = list[i];
            maxIndex = i;
        }
    }
    return maxIndex;
}

function sortedIndex(prediction,measure) {
    var list = [];

    for(var i=0; i<numOfCategories; i++) {
        if(measure=='precision')
            list.push(prediction.precision(i));
        if(measure=='recall')
            list.push(prediction.recall(i));
        if(measure=='fmeasure')
            list.push(prediction.fmeasure(i));
        if(measure=='all_predictions_fmeasure') {
            let total = 0;
            for(let p=0; p<predictions.length; p++)
                total += predictions[p].fmeasure(i);
            list.push(total);
        }
        if(measure=='label_cardinality') {
            list.push(prediction.labelCount[i]);
        }
    }

    var listIndex = [];

    for(var i=0; i<list.length; i++) {
        var index = maxArg(list);
        listIndex.push(index);
        list[index] = -1;
    }

    return listIndex;
}