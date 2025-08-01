/*
* Krippendorff for BINARY cases and SQUARE multisets/matrices
*/
function krippAlpha(input) {
    var m = transpose2DArray(input);
    //console.log("obs:"+observedKrippDisagreement(m));
    //console.log("exp:"+expectedKrippDisagreement(m));
    var result = 1-observedKrippDisagreement(m)/expectedKrippDisagreement(m);
    
    if (isNaN(result)) return 1; //division by zero should be ok (empty)
    return result;
}

function krippDist(x,y) {
    if(x == y) return 0;
    return 1;
}

function krippV(list) {
    var out = [];
    for(var i=0; i<list.length; i++)
        for(var j=0; j<list[i].length;j++)
            out.push(list[i][j]);
    return out;
}

//unoptimized reference impl.
function krippDisagreement(m) {
    var result = 0;
    for(var c=0; c<=1; c++)
        for(var k=0; k<=1; k++) {
            result += krippDist(c,k) * ((countOnes(m)*countZeros(m)) / (m.length*(m.length-1)));
        }
    return result;
}

function expectedKrippDisagreement(m) {
    return krippDisagreement(krippV(m));
}

function observedKrippDisagreement(m) {
    var result = 0;
    var V = krippV(m).length;
    for(u of m) {
        result += ((u.length/V) * krippDisagreement(u));
    }
    return result;
}

function countOnes(list) {
    return sum(list);
}

function countZeros(list) {
    return list.length-countOnes(list);
}

//var aaa = [[1,0,0],[1,0]];
//var aaa = [[0,0,1,0,1,0],[0,0,1,0,1,0],[0,0,1,0,1,0],[0,0,1,0,1,0],[0,0,1,0,1,0],[0,0,1,0,1,0]];
//console.log(krippAlpha(aaa));
//console.log(observedKrippDisagreement(aaa));
//console.log(expectedKrippDisagreement(aaa));