var chg;

var ComparisonHistograms = function(targetDiv,width,height,categories,title) {
    this.div = targetDiv;
    this.height = height;
    this.width = width;
    this.topMargin = 25;
    this.leftMargin = 15;
    this.rightMargin = 15;

    this.blockWidth = (this.width-this.leftMargin-this.rightMargin)/4;
    this.blockHeight = 50;

    this.svg = this.div.append('svg').attr("width",width+'px');
    this.rectGroupWidth = (width-this.leftMargin);
    
    var blockWidth = this.blockWidth;
    var leftMargin = this.leftMargin;
    var topMargin = this.topMargin
    this.rectGroup = this.svg.selectAll('g').data(["Label Cardinality","Mean F1","Mean Precision","Mean Recall"]).enter().append('g').attr("width",this.rectGroupWidth+'px');
    this.rectGroup.attr("transform",function(d,i) { return 'translate('+(leftMargin+i*blockWidth)+' '+topMargin+')'; } );
    this.textHeight = 11;
    this.numOfHistogramClasses = 10;

    this.xScale = d3.scaleLinear().domain([0,1]).range([1,this.blockWidth-1]);
    this.yScale = d3.scaleLinear().domain([0,1]).range([this.blockHeight-1,1]);
    
    this.topTextLabels = this.svg.append('g').attr("transform","translate(0 10)");
    this.topTextLabels.append("text").attr("font-size",this.textHeight+"px")
    .attr("x",this.leftMargin+"px")
    .attr("y",this.textHeight+"px").text("Cardinality");
    this.topTextLabels.append("text").attr("font-size",this.textHeight+"px")
    .attr("x",(this.leftMargin+this.blockWidth)+"px")
    .attr("y",this.textHeight+"px").text("Mean F1");
    this.topTextLabels.append("text").attr("font-size",this.textHeight+"px")
    .attr("x",(this.leftMargin+2*this.blockWidth)+"px")
    .attr("y",this.textHeight+"px").text("Mean Precision");
    this.topTextLabels.append("text").attr("font-size",this.textHeight+"px")
    .attr("x",(this.leftMargin+3*this.blockWidth)+"px")
    .attr("y",this.textHeight+"px").text("Mean Recall");

    for(var i=0; i<4; i++)
    this.svg.append("rect")
    .style("shape-rendering","crispEdges")
    .attr("id","bla")
    .attr("x",(i*this.blockWidth)+"px")
    .attr("y","0px")
    .attr("width",(this.blockWidth)+"px")
    .attr("height",(this.blockHeight)+"px")
    .attr("stroke","lightgrey")
    .attr("fill","none")
    .attr("transform",'translate('+this.leftMargin+' '+this.topMargin+')');

    this.predictorPolylines = [];
};

function drawComparisonHistograms(targetDiv,width,height,categories,title) {
  chg = new ComparisonHistograms(targetDiv,width,height,categories,title);
}

function updateComparisonHistograms() {
  chg.rectGroup.selectAll("*").remove();
  
  chg.rectGroup.each(function(d,i) {
  	var barsData = [];
    if(d=="Label Cardinality") {
    	barsData.push(groundTruth.getLabelCardinality());
    	for(p of predictions) barsData.push(p.getLabelCardinality());
    } else if (d=="Mean F1") {
        	for(p of predictions) barsData.push(p.getMeanFmeasure());
    } else if (d=="Mean Precision") {
        	for(p of predictions) barsData.push(p.getMeanPrecision());
    } else if (d=="Mean Recall") {
        	for(p of predictions) barsData.push(p.getMeanRecall());
  	}
  	drawBars(d3.select(this),chg.blockWidth,chg.blockHeight,barsData,d)
  });
  //chg.svg.attr("height", (chg.blockHeight*(predictions.length+1)+chg.topMargin+predictions.length*2) + "px");

}

function addComparisonHistogram(measuretype,posx,posy) {

}

function highlightPredictorHistogram(predictorId) {

}

function drawBars(target,width,height,data,measureType) {
	var n = data.length;
	var gap = 2.5;
	var padding = 1+gap;
	var barWidth = (width-2*padding)/n;
	var yScale;
	if(measureType=="Label Cardinality")
		yScale = d3.scaleLinear().domain([0,d3.max(data)]).range([height-1,1]);
	else
		yScale = d3.scaleLinear().domain([0,1]).range([height-1,1]);

	if(n<=5) {
		var texts = target.selectAll("text").data(data).enter().append("text")
			.attr("y", function(d,i) {
				return height - gap;
			})
			.attr("font-size",chg.textHeight+"px")
			.text(function(d,i) {
				if(measureType=="Label Cardinality") return formatOutputNumber(d);
				return toPercent(d);
			})
			.style("pointer-events","none");
		texts.attr("x", function(d,i) {
			return (padding + (0.5+i)*barWidth - this.getComputedTextLength()/2 ) + "px";
		});
	}

	target.selectAll("rect").data(data).enter().append("rect")
		.attr("x", function(d,i) {
			return (padding+gap/2 + i*barWidth) + "px";
		})
		.attr("y", function(d,i) {
			return yScale(d);
		})
		.attr("height", function(d,i) {
			return height-yScale(d);
		})
		.attr("width", function(d,i) {
			return (barWidth-gap) + "px";
		})
		.attr("fill", function(d,i) {
			if(measureType=="Label Cardinality") {
				if(i==0)
					return "black"; //ground truth
				else
					return lineColors[i-1];
			} else {
				return lineColors[i];
			}
		})
		.style("opacity", "0.5")
		.on("mouseenter", function(d,i) {
			d3.select(this).style("opacity", "0.8");
			let output = measureType+": "+formatOutputNumber(d);
			if(measureType=="Label Cardinality")
				if(i==0)
					output = "Reference<br/>" + output;
				else
					output = predictions[i-1].name + "<br/>" + output;
			else
				output = predictions[i].name + "<br/>" + output;
			drawMouseOverText(true,output);
		})
		.on("mouseleave", function(d) {
		d3.select(this).style("opacity", "0.5");
			drawMouseOverText(false);
		});

}
