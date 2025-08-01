var csp;

var ComparisonScatterplot = function(targetDiv, width, height, categories,name) {
    this.div = targetDiv;
    this.width = width;
    this.height = height;
    this.categories = categories;
    this.marginTop = 20;
    this.marginBottom = 30;
    this.marginLeft = 30;
    this.marginRight = 20;
    this.plotWidth = this.width-(this.marginLeft+this.marginRight);
    this.plotHeight = height-(this.marginTop+this.marginBottom);

    //this.div.style('background-color','grey');
    this.svg = this.div.append('svg').attr('width',width+'px').attr('height',height+'px')
    this.highlightCircle = this.svg.append("circle").attr("visibility","hidden").attr('clip-path','url(#scatterplotclip)');

    this.svgAxisX = this.svg.append('g').attr('class','clcAxesGroup');
    this.svgAxisY = this.svg.append('g').attr('class','clcAxesGroup');
    this.xScale = d3.scaleLinear().domain([0,1]).range([0,this.plotWidth]);
    this.yScale = d3.scaleLinear().domain([0,1]).range([this.plotHeight,0]);
    this.svgAxisY.call(d3.axisLeft().scale(this.yScale));
    this.svgAxisY.attr('transform','translate(' + this.marginLeft+ ' '+this.marginTop+')');
    this.svgAxisX.call(d3.axisBottom().scale(this.xScale));
    this.svgAxisX.attr('transform','translate(' + this.marginLeft + ' ' + (this.height - this.marginBottom) +')');
    //this.svgAxisX.selectAll('text').style('display','none');

    this.circleGroups = [];
    this.centroidGroup = [];

    this.svg.append("text")
        .attr("x","50px")
        .attr("y","50px")
        .attr("font-weight","bold")
        .attr("fill","grey")
        .text("Recall");

    this.svg.append("text")
        .attr("x",(this.width - 110) + "px")
        .attr("y",(this.height - 50) + "px")
        .attr("font-weight","bold")
        .attr("fill","grey")
        .text("Precision");

    //Background
    var upperTrianglePoints = "";
    upperTrianglePoints += this.marginLeft + "," + this.marginTop + " ";
    upperTrianglePoints += (this.width-this.marginRight) + "," + this.marginTop + " ";
    upperTrianglePoints += this.marginLeft + "," + (this.width-this.marginBottom);
    var lowerTrianglePoints = "";
    lowerTrianglePoints += (this.width-this.marginRight) + "," + (this.height-this.marginBottom) + " ";
    lowerTrianglePoints += (this.width-this.marginRight) + "," + this.marginTop + " ";
    lowerTrianglePoints += this.marginLeft + "," + (this.width-this.marginBottom);
    this.svg.append("polyline")
        .attr("points",upperTrianglePoints)
        .attr("fill","black")
        .attr("opacity","0.05");
    this.svg.append("polyline")
        .attr("points",lowerTrianglePoints)
        .attr("fill","black")
        .attr("opacity","0.1");

    //upper line
    this.svg.append("g").append("line")
        .attr("x1",this.marginLeft+"px")
        .attr("x2",(this.width-this.marginRight)+"px")
        .attr("y1",this.marginTop+"px")
        .attr("y2",this.marginTop+"px")
        .style("shape-rendering","crispEdges")
        .attr("stroke", "black")
        .attr("stroke-width","1")
        .attr("stroke-dasharray","2");
    
    //right line
    this.svg.append("g").append("line")
        .attr("x1",(this.width-this.marginRight)+"px")
        .attr("x2",(this.width-this.marginRight)+"px")
        .attr("y1",this.marginTop+"px")
        .attr("y2",(this.height-this.marginBottom)+"px")
        .style("shape-rendering","crispEdges")
        .attr("stroke", "black")
        .attr("stroke-width","1")
        .attr("stroke-dasharray","2");
            
    //grid horizontal
    for(var i=1; i<10; i++)
    this.svg.append("g").append("line")
        .attr("x1",this.marginLeft+"px")
        .attr("x2",(this.width-this.marginRight)+"px")
        .attr("y1",(this.marginTop+i*this.plotHeight/10)+"px")
        .attr("y2",(this.marginTop+i*this.plotHeight/10)+"px")
        .style("shape-rendering","crispEdges")
        .attr("stroke", "black")
        .attr("stroke-opacity", "0.1")
        .attr("stroke-width","1");

    //grid vertical
    for(var i=1; i<10; i++)
    this.svg.append("g").append("line")
    .attr("x1",((this.width-this.marginRight)-i*this.plotWidth/10)+"px")
    .attr("x2",((this.width-this.marginRight)-i*this.plotWidth/10)+"px")
    .attr("y1",this.marginTop+"px")
    .attr("y2",(this.height-this.marginBottom)+"px")
    .style("shape-rendering","crispEdges")
    .attr("stroke", "black")
    .attr("stroke-opacity", "0.1")
    .attr("stroke-width","1");

    //this.svgAxisX.selectAll("path").attr("stroke-dasharray","2");
    //this.svgAxisY.selectAll("path").attr("stroke-dasharray","2");

    this.svg.append("clipPath")
        .attr("id","scatterplotclip")
        .append("rect")
        .attr("x",(this.marginLeft+1)+"px")
        .attr("y",(this.marginTop-12)+"px")
        .attr("width",(this.plotWidth+12)+"px")
        .attr("height",(this.plotHeight+12)+"px");
}

function drawComparisonScatterplot(targetDiv, width, height, categories) {
    csp = new ComparisonScatterplot(targetDiv, width, height, categories);
}

function addComparisonScatterplotPoints(prediction,colors) {
    csp.circleGroups[prediction.id] = csp.svg.append('g').attr('clip-path','url(#scatterplotclip)');
    csp.circleGroups[prediction.id].selectAll("circle").data(prediction.getMeasuresAsList()).enter()
        .append("circle")
        .style("cursor","pointer")
        .attr("stroke",colors[prediction.id])
        .attr("stroke-width","1.5px")
        .attr("stroke-opacity","0.8")
        .attr("fill-opacity","0.1")
        .attr("fill", "white")
        .attr("r","3px")
        .attr("cx", function(d,i) {//randomize to prevent too much overlapping
            return ((csp.marginLeft + csp.xScale(d[0])) + (Math.random()*5)-2.5) +"px";
        })
        .attr("cy", function(d) {
            return ((csp.marginTop + csp.yScale(d[1])) + (Math.random()*5)-2.5) +"px";
        })
        .on("mouseenter", function(d,i) {
          for(var p=0; p<predictions.length; p++) if(prediction.id!=predictions[p].id) csp.circleGroups[p].transition().style("opacity","0");
          d3.select(this).attr("r","6px").style("opacity","1");
          drawMouseOverText(true,(i)+":"+categories.data[i].substr(0,4)+"... ("+formatOutputNumber(d[0])+","+formatOutputNumber(d[1])+")");
          highlightPredictorHistogram(prediction.id);
        })
        .on("mouseleave", function(d,i) {
          for(var p=0; p<predictions.length; p++) csp.circleGroups[p].transition().style("opacity",undefined); //reset opacity
          d3.select(this).attr("r","3px").style("opacity",null);
          drawMouseOverText(false);
          highlightPredictorHistogram();
        })
        .on("click", function(d,i) {
          filterComparisonBlockClasses(i);
          //csb.lowerDiv.node().scrollTop = (csb.barHeight)*csb.sort(i);
        });
        
    csp.centroidGroup[prediction.id] = csp.svg.append('g');
    csp.centroidGroup[prediction.id].append("circle")
    .attr("fill",colors[prediction.id])
    .attr("stroke","black")
    .attr("r","6px")
    .attr("cx", csp.marginLeft + csp.xScale(prediction.getMeanPrecision())+"px")
    .attr("cy", csp.marginTop + csp.yScale(prediction.getMeanRecall())+"px")
    .on("mouseenter", function(d,i) {
        for(var p=0; p<predictions.length; p++) if(prediction.id!=predictions[p].id) csp.circleGroups[p].transition().style("opacity","0");
        d3.select(this).attr("r","12px").style("opacity","0.5");
        drawMouseOverText(true,predictions[prediction.id].name+" mean:("+formatOutputNumber(prediction.getMeanPrecision())+","+formatOutputNumber(prediction.getMeanRecall())+")");
        highlightPredictorHistogram(prediction.id);
      })
   .on("mouseleave", function(d,i) {
        for(var p=0; p<predictions.length; p++) csp.circleGroups[p].transition().style("opacity",undefined); //reset opacity
        d3.select(this).attr("r","6px").style("opacity",null);
        drawMouseOverText(false);
        highlightPredictorHistogram();
      });
}

function highlightScatterplotPosition(color,pr,rc) {
    if(color==undefined)
        csp.highlightCircle.attr("visibility","hidden");
    else {
	var c = csp.highlightCircle
        .attr("visibility","visible")
        .attr("stroke","black")
        .attr("pointer-events","none")
        .attr("fill",color)
        .attr("r","12px")
        .attr("cx", csp.marginLeft + csp.xScale(pr)+"px")
        .attr("cy", csp.marginTop + csp.yScale(rc)+"px")
        .attr("opacity","0.0");
        c.transition().attr("opacity","0.5");
    }
}

function highlightScatterPlotLabel(labelId) {
    csp.svg.selectAll(".scatterHighlight").remove();
    if(labelId==undefined) {

    } else {
        for(var i=0; i<predictions.length; i++) {
            var pr = predictions[i].precision(labelId);
            var rc = predictions[i].recall(labelId);
            var color = lineColors[i];

            var c = csp.svg.append("circle").attr('clip-path','url(#scatterplotclip)')
                .attr("class","scatterHighlight")
                .attr("visibility","visible")
                .attr("pointer-events","none")
                .attr("stroke","black")
                .attr("fill",color)
                .attr("r","12px")
                .attr("cx", csp.marginLeft + csp.xScale(pr)+"px")
                .attr("cy", csp.marginTop + csp.yScale(rc)+"px")
		.attr("opacity","0.0");
            c.transition().attr("opacity","0.5");
        }
    }
}

function highlightScatterPlotFilterLabel(labelId) {
    csp.svg.selectAll(".scatterFilterHighlight").remove();
    if(labelId==undefined) {

    } else {
        for(var i=0; i<predictions.length; i++) {
            var pr = predictions[i].precision(labelId);
            var rc = predictions[i].recall(labelId);
            var color = lineColors[i];

            var c = csp.svg.append("circle").attr('clip-path','url(#scatterplotclip)')
                .attr("class","scatterFilterHighlight")
                .attr("visibility","visible")
                .attr("pointer-events","none")
                .attr("stroke",color)
                .attr("stroke-width","3px")
                //.attr("stroke-opacity","0.8")
                .attr("fill","yellow")
                .attr("r","9px")
                .attr("cx", csp.marginLeft + csp.xScale(pr)+"px")
                .attr("cy", csp.marginTop + csp.yScale(rc)+"px")
		.attr("opacity","0.0");
            c.transition().attr("opacity","0.5");
        }
    }
}
