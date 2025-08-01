/*
    USE FOR ACADEMIC PURPOSES ONLY
    This file is a part of the web prototype MultiConVis

    Aleksandar Doknic
    University of Vienna
    Faculty for Computer Science
    Last file update: 2020
*/

//==============================================================================

var TEXT_MODE = 0;
var IMAGE_MODE = 1;
var AUDIO_MODE = 2;
var MODE = TEXT_MODE;

var totalHeight = 950;
var totalWidth = 1850;

var body = d3.select('body').style("width",totalWidth+"px").style("height",totalHeight+"px");

var mainDiv = body.append('div')
//.style("border", "solid black 1px")
.style("width",totalWidth+"px")
.style("height",totalHeight+"px");

var loaderDivAll = mainDiv.append("div")
    //.style("border", "solid black 1px")
    .style("width","300px").style("height","900px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis1 = mainDiv.append("div")
    .style("border", "solid grey 1px")
    .style("border-style","solid none solid solid")
    .style("width","500px").style("height","900px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis1a = vis1.append("div")
    //.style("width","500px").style("height","50px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis1b = vis1.append("div")
    .style("width","500px").style("height","854px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","scroll");

var vis2 = mainDiv.append("div")
    .style("border", "solid grey 1px")
    //.style("border-style","solid solid solid none")
    .style("width","500px").style("height","900px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis2a = vis2.append("div")
    //.style("border", "solid black 1px")
    .style("width","500px").style("height","80px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis2b = vis2.append("div")
    //.style("border", "solid black 1px")
    .style("width","500px").style("height","820px");
   // .style("display","inline-block");

var vis3 = mainDiv.append("div")
    //.style("border", "solid black 1px")
    .style("width","500px").style("height","900px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis3a = vis3.append("div")
    //.style("border", "solid black 1px")
    .style("width","500px").style("height","450px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var vis3b = vis3.append("div")
    //.style("border", "solid black 1px")
    .style("width","500px").style("height","450px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var loaderDiv = loaderDivAll.append("div")
    //.style("border", "solid black 1px")
    .style("width","300px").style("height","750px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","auto");
    
var loaderDivB = loaderDivAll.append("div")
    //.style("border", "solid black 1px")
    .style("width","300px").style("height","150px")
    .style("display","inline-block")
    .style("overflow-x","hidden")
    .style("overflow-y","hidden");

var mouseOverBox = body.append('div').attr('id','hiddenmouseovercanvas')
    .style('position','fixed')
    .style('top','0px')
    .style('left','0px')
    .style('z-index','10')
    //.style('width','100%')
    //.style('height','100%')
    .style('pointer-events','none');
mouseOverBox.append('rect');
mouseOverBox.append('text');

var mouseOverDiv = body.append('div').append('div').attr('id','hiddenmouseoverdiv')
    .style('position','fixed')
    .style('top','0px')
    .style('left','0px')
    .style('z-index','10')
    .style('width','100%')
    .style('height','100%')
    .style('pointer-events','none');

var lineColorIterator = 0;
//var lineColors = ['#FF9999','#99FF99','#FFFF99','#9999FF','#dba595','#e5bee9','#bee7e9'];
//var lineColors = ['#AA5555','#3333AA','#AAAA33','#33AA33','#dba595','#e5bee9','#bee7e9'];
//var lineColors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c', '#AA5555','#3333AA','#AAAA33','#33AA33','#dba595','#e5bee9','#bee7e9']; //first 4 are from color brewer, color blind safe
//var lineColors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']; //not colorblind safe, colorbrewer
//var lineColors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']; //original color brewer option
var lineColors = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#bbbb33','#a65628','#f781bf','#999999']; //original color brewer option


//==============================================================================

function initVisualizations() {
    drawComparisonStackedBars(vis2b,500,800,categories, "StackedBars");
    //drawComparisonHeatmap(vis2,500,500,categories, "Heatmap");
    drawComparisonScatterplot(vis3a,450,450,categories, "Scatterplot");
    drawComparisonDistanceMatrix(vis3b,450,450,categories, "DistanceMatrix");
    drawComparisonBlocks(vis1b,vis1a,500,1000,categories, "Blocks");
    drawComparisonHistograms(vis2a,500,100,categories, "Histograms");
}

function updateVisualizations(p) {
    //addComparisonHeatmap(p);
    addComparisonStackedBar(p, lineColors);
    addComparisonScatterplotPoints(p, lineColors);
    updateComparisonDistanceMatrix(lineColors);
    updateComparisonBlocks();
    updateComparisonHistograms();
}

function addPredictionVisualization() {
    
}