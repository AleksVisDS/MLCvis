var upsetChart;

var upsetChartFilterMinimumLabelCount = 0;

var UpsetChart = function(div, categories, groundTruth, prediction) {
    this.div = div; //root div
    this.categories = categories;
    this.groundTruth = groundTruth;
    this.prediction = prediction;
    this.width = div.node().offsetWidth;
    this.height = div.node().offsetHeight;
    this.mainDiv = div.append('div').style('border','solid white 1px').style('width',this.width+'px').style('height',this.height+'px').style('overflow-y','scroll').style('overflow-x','scroll');
    this.svg = this.mainDiv.append('svg').style('width', this.width+'px').style('height', this.height+'px');
    
    this.padding = 10;
    
    this.labelSide = this.svg.append('g');
    this.labelSidePadding = 20;
    this.labelSideTextOffsetX = 150;
    this.labelSideTextWidth = 200;
    this.labelSideWidth = this.labelSideTextOffsetX + this.labelSideTextWidth;
    this.labelSideTextHeight = 12
    this.labelFilter = [];
    this.maxCharacters = 25;
    
    this.classSide = this.svg.append('g');
    this.classSideBarMaxHeight = 150;
    this.classSideBarWidth = 12;
    this.classFilter = [];
}

function updateUpsetChartFilters() {
    upsetChart.labelFilter = [];
    upsetChart.classFilter = [];

        /*
    this.labelCounts = 0;
    //Get list of label counts so labels can be sorted by quantity
    for(var i = 0; i < this.prediction.encodedClasses.length; i++)
        this.classFilter.push(this.prediction[i].labelCount);
    this.labelCounts.
    */

    //By default everything is rendered/in the filter
    for(var i = 0; i < this.categories.data.length; i++) {
        upsetChart.labelFilter.push(i);
    }
    //sort labels by max count
    upsetChart.labelFilter = upsetChart.labelFilter.sort(function(x,y) {
        return d3.descending(upsetChart.prediction.labelCount[x] , upsetChart.prediction.labelCount[y]);
    });
    //filter to label count greater 2
    upsetChart.labelFilter = upsetChart.labelFilter.filter(function(x) {
        return upsetChart.prediction.labelCount[x] > upsetChartFilterMinimumLabelCount;
    });

    //pred or ground truth?
    for(var i = 0; i < upsetChart.prediction.encodedClasses.length; i++)
    upsetChart.classFilter.push(i);

    //this.classFilter = this.classFilter.filter(function(x) {
    //    return prediction.encodedClasses[x][1] > 2;
    //});
}

function drawUpsetChart(div, categories, groundTruth, prediction) {
    
    //*TEMPORARY
    //loaderDiv.remove(); // remove later
    //div.style('width','100%');
    //*TEMPORARY

    div.style('background-color',null)
    div.selectAll('*').remove();
    upsetChart = new UpsetChart(div, categories, groundTruth, prediction);
    updateUpsetChartFilters();
    drawUpsetSliders();
    drawUpsetChartLeftSide();
    drawUpsetChartRightSide();
    drawLabelCountHistogram();
    upsetChart.div.append('span').text(upsetChart.classFilter.length + ' classes shown, ');
    upsetChart.div.append('span').text(upsetChart.labelFilter.length + ' labels shown');
}

function drawUpsetChartLeftSide() {
    upsetChart.svg.style('height', (upsetChart.padding*2 + upsetChart.classSideBarMaxHeight + upsetChart.labelSideTextHeight * upsetChart.labelFilter.length) + 'px');

    var labelGroup = upsetChart.labelSide.selectAll('g')
        .data(upsetChart.labelFilter)
        .enter()
        .append('g');
        
    var labelText = labelGroup.append('text')
        .attr('x', upsetChart.labelSideTextOffsetX + 'px')
        .attr('y', function(d,i) {
            return (upsetChart.padding + upsetChart.classSideBarMaxHeight + (i+1) * upsetChart.labelSideTextHeight) + 'px';
        })
        .attr('font-size', upsetChart.labelSideTextHeight + 'px')
        .attr('font-family', 'monospace')
        .attr('fill', 'white')
        .text( function(d) {
            return upsetChart.categories.data[d];
        });
    labelText.text( function(d) {
            var content = upsetChart.categories.data[d];
            if (this.getComputedTextLength() > upsetChart.labelSideTextWidth || content.length > upsetChart.maxCharacters )
                content = content.substr(0,upsetChart.maxCharacters-3) + '...';
            return content;
        });
    
    var barWidthMultiplier = (upsetChart.labelSideTextOffsetX) / d3.max( upsetChart.prediction.labelCount );
    
    //console.log(upsetChart.prediction);
    var barChart = labelGroup.append('rect')
        .attr('x', function(d,i) {
            return (upsetChart.labelSideTextOffsetX) - (upsetChart.prediction.labelCount[d] * barWidthMultiplier);
        })
        .attr('y', function(d,i) {
            return (upsetChart.padding + upsetChart.classSideBarMaxHeight + i * upsetChart.labelSideTextHeight) + 'px';
        })
        .attr('width', function(d,i) {
            return upsetChart.prediction.labelCount[d] * barWidthMultiplier + 'px';
        })
        .attr('height', function(d,i) {
            return (upsetChart.labelSideTextHeight-1) + 'px';
        })
        .attr('fill','white')
        .on('mouseover', function(d) {
            drawUpsetChartBarMouseOver(true,upsetChart.prediction.labelCount[d] + ' label occurence(s)');
            d3.select(this).style('opacity',0.7);
        })
        .on('mouseleave', function(d) {
            drawUpsetChartBarMouseOver(false);
            d3.select(this).style('opacity',null);
        });
}

function drawUpsetChartRightSide() {
    upsetChart.svg.style('width', (upsetChart.labelSideWidth + upsetChart.classFilter.length * upsetChart.classSideBarWidth + upsetChart.padding) + 'px');

    var labelGroup = upsetChart.classSide.selectAll('g')
        .data(upsetChart.prediction.encodedClasses)
        .enter()
        .append('g');
    
    //since it is already sorted the largest value should be the first one
    var barHeightMultiplier = upsetChart.classSideBarMaxHeight / upsetChart.prediction.encodedClasses[0][1];
    
    var barChart = labelGroup.append('rect')
        .attr('x', function(d,i) {
            return (upsetChart.labelSideWidth + i * upsetChart.classSideBarWidth) + 'px';
        })
        .attr('y', function(d,i) {
            return (upsetChart.classSideBarMaxHeight - (d[1] * barHeightMultiplier)) + 'px';
        })
        .attr('width', function(d,i) {
            return (upsetChart.classSideBarWidth-1) + 'px';
        })
        .attr('height', function(d,i) {
            return (d[1] * barHeightMultiplier) + 'px';
        })
        .attr('fill','white')
        .on('mouseover', function(d) {
            drawUpsetChartBarMouseOver(true,d[1] + ' class occurence(s)');
            d3.select(this).style('opacity',0.7);
        })
        .on('mouseleave', function(d) {
            drawUpsetChartBarMouseOver(false);
            d3.select(this).style('opacity',null);
        });

    var lineGroup = upsetChart.classSide.append('g').attr('pointer-events','none');
    for( var i=0; i < upsetChart.classFilter.length; i++ ) {
        lineGroup.append('line')
            .attr('x1', (upsetChart.labelSideWidth + i * upsetChart.classSideBarWidth + upsetChart.classSideBarWidth/2) + 'px')
            .attr('y1', upsetChart.classSideBarMaxHeight + upsetChart.labelSideTextHeight + 'px')
            .attr('x2', (upsetChart.labelSideWidth + i * upsetChart.classSideBarWidth + upsetChart.classSideBarWidth/2) + 'px')
            .attr('y2', (upsetChart.classSideBarMaxHeight + upsetChart.labelFilter.length * upsetChart.labelSideTextHeight + upsetChart.labelSideTextHeight) + 'px')
            .attr('stroke', 'rgba(255,255,255,0.3)')
            .attr('stroke-width', '3px')
            .attr('id','upsetVerticalLine'+i);
    }
    /*
    for( var i=0; i < upsetChart.labelFilter.length; i++) {
        lineGroup.append('line')
            .attr('x1', upsetChart.labelSideWidth + 'px')
            .attr('y1', (upsetChart.classSideBarMaxHeight + (i+1) * upsetChart.labelSideTextHeight + upsetChart.labelSideTextHeight/2) + 'px')
            .attr('x2', (upsetChart.labelSideWidth + upsetChart.classFilter.length * upsetChart.classSideBarWidth) + 'px' )
            .attr('y2', (upsetChart.classSideBarMaxHeight + (i+1) * upsetChart.labelSideTextHeight + upsetChart.labelSideTextHeight/2) + 'px')
            .attr('stroke', 'rgba(255,255,255,0.3)')
            .attr('stroke-width', '3px');
    }
    */

    var parentIndex = -1; //may have to sort that and use the class Filter and some mapping later
    var circleGroup = labelGroup.selectAll('circle').data( function(d) {
            return d[0];
        }).enter().append('circle')
        .attr('cx', function(d,i) {
            if ( i == 0 ) parentIndex += 1;
            return (upsetChart.labelSideWidth + parentIndex * upsetChart.classSideBarWidth + + upsetChart.classSideBarWidth/2) + 'px';
        })
        .attr('cy', function(d,i) {
            //if(upsetChart.labelFilter.indexOf(d)==-1) return -1000; //invisible since label is filtered
            //labelFilter.indexOf d returns the position of the label in the filtered/sorted array (labelFilter)
            return (upsetChart.classSideBarMaxHeight + (upsetChart.labelFilter.indexOf(d)+1) * upsetChart.labelSideTextHeight + upsetChart.labelSideTextHeight/2) + 'px';
        })
        .attr('r', function(d) {
            if ( upsetChart.labelFilter.indexOf(d)==-1 ) return '2px';
            return '5px';
        })
        .attr('fill','white')
        .on('mouseenter',function(d) {
            if ( upsetChart.labelFilter.indexOf(d)>-1 ) {
                d3.select(this).style('opacity',0.7);
                d3.select(this).attr('r','7px');
                var selectedRow = upsetChart.labelFilter.indexOf(d);
                //d3.select('#upsetVerticalLine' + parentIndex).attr('stroke','red');
                upsetHighlightLineHorizontal(upsetChart.labelFilter.indexOf(d));
            }
        })
        .on('mouseleave', function(d) {
            if ( upsetChart.labelFilter.indexOf(d)>-1 ) {
                d3.select(this).style('opacity',null);
                d3.select(this).attr('r','5px');
                //upsetHighlightLineHorizontal(null);
            }
        });
}

function drawUpsetChartBarMouseOver(highlight,outputtext) {

    var svg = body.select('#hiddenmouseovercanvas');
    var rect = svg.select('rect');
    var text = svg.select('text');
    var padding = 5;

    if (highlight) {
        svg.style('visibility', 'visible');
        var textLength = 0;

        text
            .text(function () {
                return outputtext;
            })
            .each(function () {
                textLength = this.getComputedTextLength();
            });

        rect
            .attr('x', function () {
                var posx = d3.event.clientX + 10;
                //if (posx > db.width() / 2) {
                //    posx -= textLength + 20;
                //}
                return posx - padding;
            })
            .attr('y', function () {
                return d3.event.pageY - upsetChart.labelSideTextHeight / 2 - padding - window.scrollY;
            })
            .attr('width', textLength + 2 * padding)
            .attr('height', upsetChart.labelSideTextHeight + 2 * padding)
            .attr('fill','rgba(0,0,0,0.8)');

        text
            .attr('x', function () {
                var posx = d3.event.clientX + 10;
                //if (posx > db.width() / 2) {
                //    posx -= this.getComputedTextLength() + 20;
                //}
                textLength = this.getComputedTextLength();
                return posx;
            })
            .attr('y', function () {
                return d3.event.pageY + upsetChart.labelSideTextHeight / 2 - window.scrollY;
            })
            .attr('fill','white');

    } else {
        svg.style('visibility', 'hidden');
    }
}

function drawUpsetSliders() {
    drawUpsetClassSlider();
    drawUpsetLabelSlider();
}

function drawUpsetClassSlider() {
    //upsetChart.mainDiv.insert('input',':first-child').attr('type','range').attr('min','0').attr('max','10').attr('value','0');
}

function drawUpsetLabelSlider() {
    upsetChart.mainDiv.insert('label',':first-child').text('label#>'+upsetChartFilterMinimumLabelCount);
    upsetChart.mainDiv.insert('input',':first-child').attr('type','range').attr('min','0').attr('max','100').attr('value',upsetChartFilterMinimumLabelCount)
    .on('change', function(d) {
        upsetChartFilterMinimumLabelCount = this.value;
        drawUpsetChart(upsetChart.div, upsetChart.categories, upsetChart.groundTruth, upsetChart.prediction)
    });
}


function upsetHighlightLine(row,column) {
    upsetHighlightLineHorizontal(row);
    upsetHighlightLineVertical(column);
}

function upsetHighlightLineHorizontal(row) {
    upsetChart.svg.select('#highlightRectHorizontal').remove();
    if(row!=null) {
        upsetChart.svg.append('rect')
            //.attr('x', upsetChart.labelSideTextOffsetX+upsetChart.labelSideTextWidth+'px')
            .attr('x','0px')
            .attr('y', (upsetChart.classSideBarMaxHeight + (row+1)*upsetChart.labelSideTextHeight )+'px')
            .attr('width',(upsetChart.labelSideWidth + upsetChart.classSideBarWidth * upsetChart.classFilter.length) + 'px')
            .attr('height',upsetChart.labelSideTextHeight)
            .attr('fill','rgba(255,255,0,0.3)')
            .attr('pointer-events','none')
            .attr('id','highlightRectHorizontal');
    }
}

function upsetHighlightLineVertical(column) {
    //console.log('column: '+column);
}

function drawLabelCountHistogram() {
    var padding = 20;
    var width = upsetChart.labelSideWidth;
    var height = upsetChart.classSideBarMaxHeight;

    //*TEMPORARY
    width = visDivMain.node().clientWidth;;
    height = 180;
    //*-----

    var paddedWidth = width-padding;
    var paddedHeight = height-padding;


    var histoGroup = upsetChart.div.insert('div',':first-child').attr('width',width).attr('height',height).append('svg').attr('width',width).attr('height',height).append('g')
    var histoRect = histoGroup.append('rect')
        .attr('x','0px')
        .attr('y','0px')
        .attr('width', width+'px')
        .attr('height', height+'px')
        .attr('stroke','white');
    // get the data?

    var labelCountCount = {};

    for (var i = 0; i < upsetChart.prediction.labelCount.length; i++) {
        if (labelCountCount[upsetChart.prediction.labelCount[i]] == undefined) labelCountCount[upsetChart.prediction.labelCount[i]] = 0;
        labelCountCount[upsetChart.prediction.labelCount[i]] += 1;
    }

    var keys = Object.keys(labelCountCount);
    var values = Object.values(labelCountCount);
    var maxVal = d3.max(values);

    var range = [0];
    var rangeTickWidth = (paddedWidth-padding/2)/(keys.length+1);
    for(var i=1; i<keys.length+1; i++) {
        range.push( range[i-1] + rangeTickWidth );
    }

    var xAxisGroup = histoGroup.append('g').attr('class','clcAxesGroup');
    var yAxisGroup = histoGroup.append('g').attr('class','clcAxesGroup');
    var xScale = d3.scaleOrdinal().domain(keys).range(range);
    var yScale = d3.scaleLinear().domain([maxVal,0]).range([0,(paddedHeight-padding)]);
    xAxisGroup.call(d3.axisBottom().scale(xScale));
    xAxisGroup.attr('transform','translate('+1.5*padding+','+(paddedHeight)+')');
    //xAxisGroup.selectAll('text').remove(); // removed text due to overlap
    xAxisGroup.selectAll('text').attr('transform','translate('+rangeTickWidth+',0)')
    //xAxisGroup.selectAll('text').attr('transform','rotate(-70)');
    yAxisGroup.call(d3.axisLeft().scale(yScale));
    yAxisGroup.attr('transform','translate('+1.5*padding+','+padding+')');

    histoGroup.append('g').selectAll('rect').data(values).enter().append('rect')
        .attr('x', function(d,i) {
            //console.log(d);
            return 1.5*padding + (i+1)*rangeTickWidth - rangeTickWidth/2;
        })
        .attr('y', function(d,i) {
            return (paddedHeight)-yScale(maxVal-d);
        })
        .attr('width', rangeTickWidth-1)
        .attr('height', function(d) {
            return yScale(maxVal-d);
        })
        .attr('fill','rgba(200,255,200,0.8)')
        .on('mouseenter',function(d,i) {
            d3.select(this).style('opacity',0.7);
            drawUpsetChartBarMouseOver(true,d+' label(s) with '+keys[i]+' occurence(s)');
        })
        .on('mouseleave', function(d) {
            d3.select(this).style('opacity',null);
            drawUpsetChartBarMouseOver(null);
        });
}