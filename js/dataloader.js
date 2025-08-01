function loadCategoryData(files) {
    var reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function(e) {
        var content;
        var labelList = [];

        //===CSV parse with one Label column===
        if(files[0].name.endsWith(".csv")) {
            content = d3.csvParse(e.target.result);
            for(element of content) 
                labelList.push(element[content.columns[0]]); //get elements from first column
        } else {
            content = JSON.parse(e.target.result);
            for(element of content) 
                labelList.push(element[0]); //resolve double brackets
        }
        //=====================================

        //console.log(labelList);
        categories = new CategoryData(labelList);
        categoryLoader.attr('hidden','true');
        numOfCategories = categories.data.length;
        drawLoaderTable('Labels file',files[0].name, numOfCategories, 1)
        showGroundTruthLoadButton();
    }
}

function loadGroundTruthData(files) {
    var reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = function(e) {
        var labelVecs;
        var titleVec;
        var abstractVec;
        var authorsVec
        if(files[0].name.endsWith(".csv")) {
            labelVecs = [];
            var content = d3.csvParse(e.target.result, function(d) {
				if(d.labelVecs == undefined) return [];
                return d.labelVecs;
            });
            titleVec = d3.csvParse(e.target.result, function(d) {
                if(d.Title == undefined) return "";
                if(d.Title.endsWith("jpg")) MODE = IMAGE_MODE;
                if(d.Title.endsWith("wav")) MODE = AUDIO_MODE;
                return d.Title;
            });
            abstractVec = d3.csvParse(e.target.result, function(d) {
				if(d.Abstract == undefined) return "";
                return d.Abstract;
            });
            authorsVec = d3.csvParse(e.target.result, function(d) {
				if(d.Authors == undefined) return "";
                return d.Authors.replace(/;/g,", ");
            });
            for(var i=0; i<content.length; i++) {
                var vec = ''
				//if empty space is used instead of comma, fix it here, othewise leave it
				if(!content[i].includes(",")) vec = JSON.parse(content[i].replace(/\n/g,"").replace(/ /g,","));
				else vec = JSON.parse(content[i]);
                labelVecs.push(vec);
            }
        } else {
            labelVecs = JSON.parse(e.target.result);
        }
        groundTruth = new GroundTruthData(labelVecs,files[0].name,titleVec, abstractVec, authorsVec);
        groundTruthLoader.attr('hidden','true');
        drawLoaderTable('Reference file',files[0].name, groundTruth.data[0].length, groundTruth.data.length)
        showPredictionLoadButton();
        initVisualizations();
    }
}

function loadPredictionData(files) {
    for(var i=0, f; f=files[i]; i++) {
        var reader = new FileReader();
        reader.fileName = f.name;
        reader.readAsText(f);
        reader.onload = function(e) {
            var labelVecs;
            if(files[0].name.endsWith(".csv")) {
                labelVecs = [];
                var content = d3.csvParse(e.target.result, function(d) {
                    return d.labelVecs;
                });
                for(var i=0; i<content.length; i++) {
                    var vec = ''
					//if empty space is used instead of comma, fix it here, othewise leave it
					if(!content[i].includes(",")) vec = JSON.parse(content[i].replace(/\n/g,"").replace(/ /g,","));
					else vec = JSON.parse(content[i]);
                    labelVecs.push(vec);
                }
            } else {
                labelVecs = JSON.parse(e.target.result);
            }
            addPredictionData(labelVecs, e.target.fileName);
        }
    }
}

function addPredictionData(content, name) {
    p = new PredictionData(content, name);
    predictions.push(p);
    predictionLoader.attr('hidden','true');
    drawLoaderTable('Prediction file #'+(prediction_id++),name, p.data[0].length, p.data.length, lineColors[lineColorIterator]);
    showPredictionLoadButton();
    updateVisualizations(p);
    lineColorIterator++;
}

var categoryLoader = loaderDiv.append('label').attr('class','button').attr('for','categoriesUpload').attr('id','categoriesUploadButton').text('Load categories');
loaderDiv.append('input').attr('type','file').attr('id','categoriesUpload').attr('onchange','loadCategoryData(this.files)').attr('hidden','true');
var groundTruthLoader;
var predictionLoader;

function showGroundTruthLoadButton() {
    groundTruthLoader = loaderDiv.append('label').attr('class','button').attr('for','groundTruthUpload').attr('id','groundTruthUploadButton').text('Load ground truth');
    loaderDiv.append('input').attr('type','file').attr('id','groundTruthUpload').attr('onchange','loadGroundTruthData(this.files)').attr('hidden','true');
}

var prediction_id = 0;
function showPredictionLoadButton() {
    predictionLoader = loaderDiv.append('label').attr('class','button').attr('for','predictionUpload'+prediction_id).attr('id','predictionUploadButton'+prediction_id).text('Load predictions');
    loaderDiv.append('input').attr('type','file').attr('id','predictionUpload'+prediction_id).attr('onchange','loadPredictionData(this.files)').attr('hidden','true').attr('multiple','true');
}

function drawLoaderTable(typeDesc, filename, numOfCat, numOfSamples, color) {

    var table = loaderDiv.append('table').style('width','100%').style('background-color','rgba(255,255,255,0.2').style('font-family','monospace').style('table-layout','fixed').style('word-wrap','break-word').on('mouseenter', function(d) { d3.select(this).style('background-color','rgba(255,255,255,0.4)')}).on('mouseleave',function(d) { d3.select(this).style('background-color','rgba(255,255,255,0.2)')});
    table.append('tr').append('td').attr('colspan','2').style("border", "dotted grey 1px").style("border-style","none none dotted none").style('font-weight','bold').style("font-size","10px").style('text-align','left').text(typeDesc);
    var catRow = table.append('tr')
    catRow.append('td').text('File name');
    var fileNameField = catRow.append('td').text(filename);

    if(color!=undefined)
        fileNameField.style('color',color);

    var catRow = table.append('tr')
    catRow.append('td').text('Labels');
    var numOfCatField = catRow.append('td').text(numOfCat);

    if(categories!=undefined)
        if(categories.data.length < numOfCat)
            numOfCatField.style('color','red').style('font-weight','bold');

    var catRow = table.append('tr')
    catRow.append('td').text('Documents');
    catRow.append('td').text(numOfSamples);
    
    /*
    table.on('click', function() {
        for(var i=0; i<predictions.length; i++)
            if(predictions[i].name == filename) {
                visDivMain.selectAll('*').remove();
                drawUpsetChart(visDivMain, categories, groundTruth, predictions[i]);
                body.selectAll('table').style('border',null);
                d3.select(this).style('border','dotted white 1px');
            }
        if ( typeDesc == 'Reference file' ) {
                visDivMain.selectAll('*').remove();
                drawUpsetChart(vis2, categories, groundTruth, groundTruth);
                body.selectAll('table').style('border',null);
                d3.select(this).style('border','dotted white 1px');
        }
        if ( typeDesc == 'Labels file' ) {
            //upsetChart.div.remove();
            //body.selectAll('table').style('border',null);
            //visDivMain.selectAll('*').style('hidden','false');
        }
    });
    */
}

function loadDataFromServerTestFunction1() {
    d3.json("ChristophDaten/categories.json", function(error,data) {
        content = data;
        categories = new CategoryData(data);
        categoryLoader.attr('hidden','true');
        numOfCategories = categories.data.length;
        drawLoaderTable('Labels file','categories.json', numOfCategories, 1)
        showGroundTruthLoadButton();

        d3.json("ChristophDaten/ground_truth_labels.json", function(error,data) {
            groundTruth = new GroundTruthData(data,"ground_truth_labels.json");
            groundTruthLoader.attr('hidden','true');
            initVisualizations();
            drawLoaderTable('Reference file','ground_truth_labels.json', groundTruth.data[0].length, groundTruth.data.length)
            showPredictionLoadButton();

            d3.json("ChristophDaten/pred_1.json", function(error,data) {
                addPredictionData(data,"pred_1.json");
            });
            d3.json("ChristophDaten/pred_2.json", function(error,data) {
                addPredictionData(data,"pred_2.json");
            });
            //d3.json("ChristophDaten/pred_3.json", function(error,data) {
            //    addPredictionData(data,"pred_3.json");
            //});
        });
    });
}
//loadDataFromServerTestFunction1();

function loadDataFromServerTestFunction2() {
    d3.csv("UseCases/ChristophDaten2020/labels.csv", function(error,content) {

        var labelList = [];
        for(element of content) 
            labelList.push(element[content.columns[0]]); //get elements from first column

        categories = new CategoryData(labelList);
        categoryLoader.attr('hidden','true');
        numOfCategories = categories.data.length;
        drawLoaderTable('Labels file',"labels.csv", numOfCategories, 1)
        showGroundTruthLoadButton();

        d3.csv("UseCases/ChristophDaten2020/truth.csv", function(error,content) {

            var labelVecs = parseMultilabelVector(content);
            var titleVec = [];
            var abstractVec = [];
            var authorsVec = [];
            for(e of content) { titleVec.push(e.Title); abstractVec.push(e.Abstract); authorsVec.push(e.Authors.replace(/;/g,", "));}

            groundTruth = new GroundTruthData(labelVecs,"truth.csv",titleVec,abstractVec,authorsVec);
            groundTruthLoader.attr('hidden','true');
            initVisualizations();
            drawLoaderTable('Reference file','truth.csv', groundTruth.data[0].length, groundTruth.data.length)
            showPredictionLoadButton();

            for(let i=1; i<=5; i++)
            d3.csv("UseCases/ChristophDaten2020/labeler"+i+".csv", function(error,data) {
                addPredictionData(parseMultilabelVector(data),"labeler"+i+".csv");
            });
        });
    });
}
loadDataFromServerTestFunction2();


/** Takes post-CSV parsed object and returns labelVecs column */
function parseMultilabelVector(input) {
    var labelVecs = [];
    for(var i=0; i<input.length; i++) {
        var vec = ''
		//if empty space is used instead of comma, fix it here, othewise leave it
		if(!input[i].labelVecs.includes(",")) vec = JSON.parse(input[i].labelVecs.replace(/\n/g,"").replace(/ /g,","));
		else vec = JSON.parse(content[i]);
        labelVecs.push(vec);
    }
    return labelVecs;
}
