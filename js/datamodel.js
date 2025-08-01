var categories;
var groundTruth;
var predictions = [];
var numOfCategories = 0;

//Objects that combine everything...
var documentsData = [];

var CategoryData = function(d) {
    this.data = [];
    for (var i=0; i<d.length; i++) {
        this.data.push(d[i]);
    }
}

var GroundTruthData = function(labelVecs,name,titleVec,abstractVec,authorsVec) {
    this.name = name;
    this.data = labelVecs;
    //this.titleVec = titleVec;
    //this.abstractVec = abstractVec;
    //this.authorsVec = authorsVec;
    this.encodedClasses = generateLabelList(this.data);
    this.labelCount = generateLabelCount(this.data);
	this.numberOfOnes = 0;

	for(var i=0; i<labelVecs.length;i++)
		for(var j=0; j<categories.data.length; j++)
			if(labelVecs[i][j] == 1) this.numberOfOnes++;

    this.getLabelCardinality = function() {
    	return this.numberOfOnes/this.data.length;
    }
    
    this.getLabelDensity = function() {
    	return this.getLabelCardinality()/categories.data.length;
    }

    if(titleVec != undefined && abstractVec != undefined && authorsVec != undefined)
    for(i in labelVecs) {
        documentsData.push({
            id: i,
            gt: labelVecs[i],
            gtEncoded: this.encodedClasses[i],
            title: titleVec[i],
            abstract: abstractVec[i],
            authors: authorsVec[i],
            predictions: [],
            predictionsEncoded: []
        })
    }
    else //no title, abstract, authors are given... e.g. audio, image
    for(i in labelVecs) {
        documentsData.push({
            id: i,
            gt: labelVecs[i],
            gtEncoded: this.encodedClasses[i],
            title: "",
            abstract: "",
            authors: "",
            predictions: [],
            predictionsEncoded: []
        })
    }
}

var predictionId = 0;
var PredictionData = function(d, name) {
    this.name = name;
    this.data = d;
    this.id = predictionId++;

    this.tp = createArray(numOfCategories);
    this.tn = createArray(numOfCategories);
    this.fp = createArray(numOfCategories);
    this.fn = createArray(numOfCategories);
    this.numberOfOnes = 0;

    for (var i=0; i<d.length; i++) {
        for (var j=0; j<numOfCategories; j++) {
            if(this.data[i][j] == 1 && groundTruth.data[i][j] == 1)
                {this.tp[j]++; this.numberOfOnes++; }
            if(this.data[i][j] == 1 && groundTruth.data[i][j] == 0)
                {this.fp[j]++; this.numberOfOnes++; }
            if(this.data[i][j] == 0 && groundTruth.data[i][j] == 1)
                this.fn[j]++;
            if(this.data[i][j] == 0 && groundTruth.data[i][j] == 0)
                this.tn[j]++;
        }
    }

    this.precision = function(e) {
        if(this.tp[e]+this.fp[e] == 0) return 1;  //ATTENTION labels do not appear AT ALL
        return this.tp[e]/(this.tp[e]+this.fp[e]);
    }

    this.recall = function(e) {
        if(this.tp[e]+this.fn[e] == 0) return 1; //ATTENTION labels do not appear AT ALL
        return this.tp[e]/(this.tp[e]+this.fn[e]);
    }

    this.fmeasure = function(e) {
        if(this.precision(e)+this.recall(e) == 0) return 0;
        return 2*(this.precision(e)*this.recall(e))/(this.precision(e)+this.recall(e));
    }

    this.getRecallAsList = function() {
        var l = [];
        for(var i=0; i<numOfCategories; i++)
            l.push(this.recall(i));
        return l;
    }
    this.getPrecisionAsList = function() {
        var l = [];
        for(var i=0; i<numOfCategories; i++)
            l.push(this.precision(i));
        return l;
    }

    this.getMeasuresAsList = function() {
        var l = [];
        for(var i=0; i<numOfCategories; i++)
            l.push([this.precision(i),this.recall(i),this.fmeasure(i)]);
        return l;
    }

    this.getFmeasureAsList = function() {
        var l = [];
        for(var i=0; i<numOfCategories; i++)
            l.push(this.fmeasure(i));
        return l;
    }

    this.getMeanPrecision = function() {
        var m = 0;
        for(var i=0; i<numOfCategories; i++)
            m = m + this.precision(i);
        return m/numOfCategories;
    }
    
    this.getMeanRecall = function() {
        var m = 0;
        for(var i=0; i<numOfCategories; i++)
            m = m + this.recall(i);
        return m/numOfCategories;
    }
    
    this.getMeanFmeasure = function() {
        var m = 0;
        for(var i=0; i<numOfCategories; i++)
            m = m + this.fmeasure(i);
        return m/numOfCategories;
    }
    
    this.getLabelCardinality = function() {
    	return this.numberOfOnes/this.data.length;
    }
    
    this.getLabelDensity = function() {
    	return this.getLabelCardinality()/categories.data.length;
    }

    this.encodedClasses = generateLabelList(this.data);
    this.labelCount = generateLabelCount(this.data);
    //console.log(this.labelCount);

    //var labeltotal = 0;
    //for(var i=0; i<this.labelCount.length;i++) labeltotal += this.labelCount[i];
    //console.log(this.name+":"+labeltotal/this.data.length);

    for (var i=0; i<d.length; i++) {
        documentsData[i].predictions[this.id] = this.data[i];
        documentsData[i].predictionsEncoded[this.id] = this.encodedClasses[i];
    }
}

//Turn this format: [1,0,1,1] to this: [0,2,3]
function encodeSample(sample) {
    l = [];
    for (var i=0;i<sample.length; i++) {
        if(sample[i] == 1)
            l.push(i);
    }
    return l;
};
    
    
//Find if a class belongs to in the list of encoded classes.
//and return its index. This is used in order to create a set of
//classes (label combinations) without having to generate all possible
//combinations. Returns -1 if it doesn't exist yet.
function findClassIndex(encodedClasses, sample) {
    var index = -1;
    //compare sample length to all recorded classes
    for (var i=0; i<encodedClasses.length; i++) {
        //if they match then see if they're equal for each label
        if (encodedClasses[i][0].length == sample.length) {
            var equal = true;
            //check if they're equal on each label
            for (var j=0; j<sample.length; j++) {
                if (encodedClasses[i][0][j] != sample[j]) {
                    equal = false;
                    break;
                }
            }
            if (equal) {
                index = i;
                break;
            }
        }
    }
    return index;
}

/*
// Generates classes (combinations of labels) from the samples
function generateLabelCombinations(samples) {
    var encodedClasses = [];
    //Create a SET of all classes, and count quantity
    for (var i=0; i<samples.length; i++) {
        var encodedSample = encodeSample(samples[i]);
        var encodedSampleClassIndex = findClassIndex(encodedClasses, encodedSample);
        if (encodedSampleClassIndex == -1) {
            encodedClasses.push([encodedSample,1]); //count = 1
        } else {
            encodedClasses[encodedSampleClassIndex][1] += 1;
        }
    }
    encodedClasses.sort(function(x,y) {
        return d3.descending(x[1],y[1]);
    });
    return encodedClasses;
}
*/

function generateLabelList(samples) {
    var list = [];
    for (var i=0; i<samples.length; i++) {
        var indices = [];
        for(var j=0; j<samples[i].length; j++) {
            if(samples[i][j] != 0) indices.push(j);
        }
        list.push(indices);
    }
    return list;
}

// Generate number of all label occurrences among all samples in a list where
// index represents the label
function generateLabelCount(samples) {
    var countList = createArray(categories.data.length);
    for (var i = 0; i < samples.length; i++)
        for (var j = 0; j < categories.data.length; j++)
            if (samples[i][j] == 1)
                countList[j] += 1;
    return countList;
}
