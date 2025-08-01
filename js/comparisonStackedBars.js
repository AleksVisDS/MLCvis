var ComparisonStackedBars = function(targetDiv, width, height, categories, name) {

    this.width = width;
    this.height = height;
    this.xPadding = 10;
    this.labelWidth = 150;
    this.scrollbarWidth = 15;
    this.totalBarsWidth = this.width - this.labelWidth - 2*this.xPadding - this.scrollbarWidth;
    this.barHeight = 16;
    this.gap = 1;
    this.title = name; 
    this.numOfCat = categories.data.length;
    this.div = targetDiv;
    this.upperDivHeight = 35;
    this.lowerDivHeight = this.height-this.upperDivHeight+this.barHeight;
    this.upperDiv = this.div.append('div').style("height",this.upperDivHeight+"px").style("border","solid grey 1px").style("border-style","none none dotted none");
    this.lowerDiv = this.div.append('div').style("overflow-x","hidden").style("overflow-y","scroll").style('height',(this.lowerDivHeight)+'px');
    this.svg = this.lowerDiv.append('svg').style('width',width+'px').style('height',(this.xPadding+this.numOfCat*this.barHeight)+'px');
    this.toolbarSvg = this.upperDiv.append('svg').style('width',width+'px').style('height',this.upperDivHeight+'px');
    this.barRects = []; //bar rectangle svg elements, index is prediction
    this.barTexts = []; //text over rectangles
    this.highlightBar = this.svg.append("rect").attr("fill","rgba(255,255,0,0.5)");
    this.predictions = [];
    var barHeight = this.barHeight; //for inner function
    this.generateFmeasureForAllModels = function() {
        var l = [];
        for (var i=0; i<this.predictions.length; i++)
            l.push( predictions[i].getFmeasureAsList() );
        return l;
    };
    this.xScale = d3.scaleLinear().domain([0,1]).range([0,this.totalBarsWidth]);
    this.barsWidth = function() { return this.totalBarsWidth/predictions.length; };

    this.baseIndex = createArray(categories.data.length);
    for(var i=0; i<categories.data.length; i++) {
      this.baseIndex[i] = i;
    }
    this.sIndex = this.baseIndex;
    this.sort = function(i) { return this.sIndex.indexOf(i); };

    this.blockGroup = this.svg.selectAll('g').data(categories.data).enter().append('g');
    this.textHeight = 12;
    var textHeight = this.textHeight;
    var gap = this.gap;
    this.texts = this.blockGroup.append('text')
        .attr('font-size',textHeight+'px')
        .attr('font-family','monospace')
        .attr('cursor','pointer')
        .attr('x', this.xPadding+'px')
        .attr('y', function(d,i) {
            return (i*barHeight + textHeight + gap + barHeight/2 - textHeight/2)+'px';
        })
        .text(function(d,i) {
            return (i)+':'+d;
        })
        .on("mouseenter", function(d,i) {
            d3.select(this).attr("font-weight","bold").attr("text-decoration","none");
            highlightScatterPlotLabel(i);
            drawMouseOverText(true,i+':'+d+"<br/>In reference: "+groundTruth.labelCount[i]);
            //highlightStackedBarRow(i);
        })
        .on("mouseleave", function(d,i) {
            highlightScatterPlotLabel();
            d3.select(this).attr("font-weight",null);
            drawMouseOverText(false);
        })
        .on('click', function(d,i) {
            filterComparisonBlockClasses(i);
        });
    var labelWidth = this.labelWidth;
    this.texts.text(function(d,i) {
        if(this.getComputedTextLength() > labelWidth)
            return ((i)+':'+d).substr(0,17)+'...';
        else
            return ((i)+':'+d);
    });
    this.cumulativeMeasures = [createArray(this.numOfCat)]; //cumulative measures for each
}

var ComparisonStackedBarsToolbar = function(svg) {
    this.height = csb.upperDivHeight;
    this.svg = svg.style("shape-rendering","crispEdges");
    this.index = 0;
    var index = this.index;
    //var index = this.index;
    var fontSize = 11;
    this.buttonSize = 10;
    let yPos = this.height - fontSize/2;

    var sortByLabelLength = svg.append('text')
    .attr('x',(csb.xPadding)+'px')
    .attr('font-size',fontSize+"px")
    .attr('y',yPos+"px")
    .text("Sort by...").node().getComputedTextLength();

    var optionsTextLength = svg.append('text')
        .attr('x',(csb.xPadding)+'px')
        .attr('font-size',fontSize+"px")
        .attr('y',fontSize +"px")
        .text("Toggle").node().getComputedTextLength();

    this.unstackButton = svg.append('text')
        .attr('x',(csb.xPadding+sortByLabelLength+10)+'px')
        .attr('font-size',fontSize+"px")
        .attr('y',fontSize +"px")
        .style('cursor','pointer')
        .attr('text-decoration','underline')
        .text("Stack")
        .on("click", function(d,i) {
            toggleStackedBars();
            if(barsStacked) {
                d3.select(this).attr("font-weight","bold");
                csbToolbar.flipButton.attr("text-decoration","line-through").style("cursor",undefined);
            } else {
                d3.select(this).attr("font-weight",undefined);
                csbToolbar.flipButton.attr("text-decoration","underline").style("cursor","pointer");
            }
        });
    var unstackButtonLength = this.unstackButton.node().getComputedTextLength();

    this.flipButton = svg.append('text')
        .attr('x',(csb.xPadding + 40 + unstackButtonLength + optionsTextLength)+'px')
        .attr('font-size',fontSize+"px")
        .attr('y',fontSize+"px")
        .style('cursor','pointer')
        .attr('text-decoration','underline')
        .text("Flip")
        .on("click", function(d,i) {
            flipStackedBars();
            if(barsFlipped) {
                d3.select(this).attr("font-weight","bold");
                csbToolbar.unstackButton.attr("text-decoration","line-through").style("cursor",undefined);
            } else {
                d3.select(this).attr("font-weight",undefined);
                csbToolbar.unstackButton.attr("text-decoration","underline").style("cursor","pointer");
            }
            highlightStackedBarRow(cbs.filterId);
        })

    //Sort by ID
    var idLength = svg.append('text')
        .attr('x',(csb.xPadding+sortByLabelLength+10)+'px')
        .attr('font-size',fontSize+"px")
        .attr('y',yPos+"px")
        .text("ID")
        .attr("text-decoration","underline")
        .attr('cursor','pointer')
        .on('mouseenter', function() {
            drawMouseOverText(true,"Sort by ID")
        })
        .on('mouseleave', function() {
            drawMouseOverText();
        })
        .on('click', function() {
            csb.sIndex = csb.baseIndex;
            updateStackedBarsSort();
            highlightStackedBarRow(cbs.filterId);
        }).node().getComputedTextLength();

    //Sort by label cardinality
    var lcLength = svg.append('text')
        .attr('x',(csb.xPadding+sortByLabelLength+idLength+20)+'px')
        .attr('font-size',fontSize+"px")
        .attr('y',yPos+"px")
        .text("LC")
        .attr("text-decoration","underline")
        .attr('cursor','pointer')
        .on('mouseenter', function() {
            drawMouseOverText(true,"Sort by label count in Reference")
        })
        .on('mouseleave', function() {
            drawMouseOverText();
        })
        .on('click', function() {
            csb.sIndex = sortedIndex(groundTruth, 'label_cardinality');
            updateStackedBarsSort();
            highlightStackedBarRow(cbs.filterId);
        }).node().getComputedTextLength();

    //Sort by total fmeasure
    svg.append('text')
        .attr('x',(csb.xPadding+sortByLabelLength+idLength+lcLength+30)+'px')
        .attr('font-size',fontSize+"px")
        .attr('y',yPos+"px")
        .text('Sum')
        .attr("text-decoration","underline")
        .attr('cursor','pointer')
        .on('mouseenter', function() {
            drawMouseOverText(true,"Sort by sum of F1 measures")
        })
        .on('mouseleave', function() {
            drawMouseOverText();
        })
        .on('click', function() {
            csb.sIndex = sortedIndex(undefined, 'all_predictions_fmeasure');
            updateStackedBarsSort();
            highlightStackedBarRow(cbs.filterId);
        });

    //Sort by each predictor fmeasure (per button..)
    this.addButton = function(predictionIndex) {
        svg.selectAll(".stackedBarsSortButton").attr('x',function(d,i) { return (csb.xPadding + csb.labelWidth + csb.xScale(i)) + 'px';});

        svg.append('text')
            //.attr('x',(100+csbToolbar.index*40)+'px')
            .attr('x',(csb.xPadding + csb.labelWidth + csb.xScale(predictionIndex)) + 'px')
            .attr('font-size',fontSize+"px")
            .attr('y',yPos+"px")
            .attr('class','stackedBarsSortButton')
            .text("P"+predictionIndex)
            .attr("text-decoration","underline")
            .attr('cursor','pointer')
            .on('mouseenter', function() {
                drawMouseOverText(true,"Sort by F1 measures in P"+predictionIndex)
            })
            .on('mouseleave', function() {
                drawMouseOverText();
            })
            .on('click', function() {
                csb.sIndex = sortedIndex(predictions[predictionIndex], 'fmeasure');
                updateStackedBarsSort();
                highlightStackedBarRow(cbs.filterId);
            });
        csbToolbar.index += 1;
    }
}

var csb;
var csbToolbar;

function drawComparisonStackedBars(targetDiv, width, height, categories, name) {
    //targetDiv.style('background-color','rgb(230,230,230)');
    csb = new ComparisonStackedBars(targetDiv, width, height, categories, name);
    csbToolbar = new ComparisonStackedBarsToolbar(csb.toolbarSvg);
}

function addComparisonStackedBar(prediction) {
    csb.predictions.push(prediction);
    csb.xScale.domain([0,csb.predictions.length]);
    csb.fmeasures = csb.generateFmeasureForAllModels();
   
    csb.cumulativeMeasures.push(createArray(this.numOfCat));
    for(let i=0; i<csb.numOfCat; i++) csb.cumulativeMeasures[csb.cumulativeMeasures.length-1][i] = 0;

    csb.svg.selectAll('.stackedbar').remove();
    for (let p=0; p<csb.predictions.length; p++) {
        csb.barTexts[p] = csb.blockGroup.append('text');
        csb.barRects[p] = csb.blockGroup.append('rect');
        refreshStackedBarsView(p);
            
        for(var i = 0; i<csb.numOfCat; i++)
                csb.cumulativeMeasures[csb.cumulativeMeasures.length-1][i] += csb.fmeasures[p][i];
    }
    //@todo

    //csb.texts.attr('y', function(d,i) {
    //    return csb.xPadding+(sIndex.indexOf(i)*csb.barHeight + csb.textHeight + csb.gap + csb.barHeight/2 - csb.textHeight/2)+'px';
    //})

    csbToolbar.addButton(csbToolbar.index);
}

function highlightStackedBarRow(row) {
    if(row==undefined) {
        csb.highlightBar.attr("opacity",0);
    } else {
        let y=0;
        if(barsFlipped) {
            y = csb.sort(row)*(csb.barsWidth()+csb.gap)+csb.barsWidth()-csb.barHeight;
        } else {
            y = csb.sort(row)*csb.barHeight;
        }
        csb.highlightBar.attr("opacity",1).attr("x",0).attr("y",y+"px").attr("width",csb.width).attr("height",csb.barHeight+1);
    }
}

var barsStacked = false;
function toggleStackedBars() {
    if(barsFlipped) return;
    barsStacked = !barsStacked;
    updateStackedBarsSort();
    return barsStacked;
}

var barsFlipped = false;
function flipStackedBars() {
    if(barsStacked) return;
    barsFlipped = !barsFlipped;
    updateStackedBarsSort();
    return barsFlipped;
}

function updateStackedBarsSort() {
    if(!barsFlipped)
        for (let p=0; p<csb.predictions.length; p++) refreshStackedBarsView(p)
    else
        for (let p=0; p<csb.predictions.length; p++) refreshFlippedStackedBarsView(p)
}

function refreshStackedBarsView(p) {
    csb.blockGroup.selectAll(".sepline").remove();
    csb.svg.style('height',(csb.xPadding+csb.numOfCat*csb.barHeight)+'px');
    csb.texts.transition().attr('y', function(d,i) {
        return (csb.sort(i)*csb.barHeight + csb.textHeight + csb.gap + csb.barHeight/2 - csb.textHeight/2)+'px';
    });
    csb.barTexts[p]
        .attr('class','stackedbar')
        .style("pointer-events","none")
        .attr('fill','black')
        .attr('font-size',10+'px')
        .text(function(d,i) {
            return toPercent(csb.fmeasures[p][i]);
          })
        .transition()
        .attr('x', function(d,i) {
            return csb.xPadding + csb.labelWidth + csb.xScale(p) + 'px'; //stacked bars parallel
        })
        .attr('y', function(d,i) {
            return (csb.sort(i)*csb.barHeight + csb.textHeight + csb.gap)+'px';
        });

    csb.barRects[p]
        .attr('class','stackedbar')
        //.attr('cursor','pointer')
        .attr('fill',lineColors[p])
        .attr('opacity',0.6)
        .on('mouseenter', function(d,i) {
            drawMouseOverText(true,'F1 in '+csb.predictions[p].name+': '+toPercent(csb.fmeasures[p][i])+'%');
            d3.select(this).style('opacity',0.8); 
            highlightScatterplotPosition(lineColors[p],csb.predictions[p].precision(i),csb.predictions[p].recall(i));
            highlightPredictorHistogram(p);
        })
        .on('mouseleave', function(d,i) {
            d3.select(this).style('opacity',0.6);
            drawMouseOverText(false);
            highlightScatterplotPosition();
            highlightPredictorHistogram();
        });

    csb.barRects[p].transition()
        .style("transform","rotate(0)")
        .transition()
        .attr('x', function(d,i) {
            if(barsStacked)
                return (csb.xPadding + csb.labelWidth + csb.xScale(csb.cumulativeMeasures[p][i]))+'px'
            else
                return csb.xPadding + csb.labelWidth + csb.xScale(p) + 'px'; //stacked bars parallel
        })
        .attr('y', function(d,i) {
            return (csb.sort(i)*csb.barHeight + csb.gap)+'px';
        })
        .attr('width', function(d,i) {
            return csb.xScale(csb.fmeasures[p][i]);
        })
        .attr('height', csb.barHeight - csb.gap)
}

function refreshFlippedStackedBarsView(p) {
    csb.svg.style('height',(csb.xPadding+csb.numOfCat*(csb.barsWidth()+csb.gap))+'px');

    let xPosition = csb.xPadding + csb.labelWidth + csb.xScale(p) + csb.barsWidth()/2;
    let yPosition = function(i) { return csb.sort(i)*(csb.barsWidth() + csb.gap) + csb.barsWidth(); }
    csb.texts.transition().attr("y", function(d,i) {
        return (yPosition(i)-csb.gap)+"px";
    });
    csb.barTexts[p].transition()
        .attr("x", function() { return (xPosition-this.getComputedTextLength())+"px";})
        .attr("y", function(d,i) {
            return (yPosition(i)-csb.gap)+"px";
        });
    csb.barRects[p].each(function(d,i) {
        let x = xPosition;
        let y = yPosition(i);
        d3.select(this)
        .transition()
        .attr("x", x+"px")
        .attr("y", y+"px")
        .style("transform-origin",function(d,i) { return x+"px "+y+"px"; })
        .transition()
        .style("transform","rotate(-90deg)")
    });
    csb.blockGroup.append("line")
        .attr("class","sepline")
        .attr("x1", 0+"px")
        .attr("y1", function(d,i) { return yPosition(i)+"px"; })
        .attr("x2", csb.width+"px")
        .attr("y2", function(d,i) { return yPosition(i)+"px"; })
        .attr("stroke-dasharray","1")
        .attr("stroke-width","1px")
        .attr("stroke","grey")
        .style("shape-rendering","crispEdges");
}