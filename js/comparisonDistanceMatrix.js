var cdm;

var ComparisonDistanceMatrix = function(targetDiv,width,height,categories,title) {
    this.div = targetDiv;
    this.height = 400;
    this.width = 400;
    this.topMargin = 20;
    this.leftMargin = 20;

    this.optionSelectDiv = this.div.append("div").style("font-size","11px");
    this.optionSelectDiv.append("span").html("&nbsp;Compare using ");
    this.optionSelect = this.optionSelectDiv.append("select").style("font-size","11px")
        .on("change",function(d,i) {
            if(this.value=="j") cdm.simFunction = avgJaccardSim;
            else cdm.simFunction = function(a,b) { return krippAlpha([krippV(a),krippV(b)]); };
            updateComparisonDistanceMatrix();
        });
    this.optionSelect.append("option").attr("value","j").html("Jaccard similarity");
    this.optionSelect.append("option").attr("value","k").html("Krippendorff's &alpha;");

    this.svg = this.div.append('svg').attr("width",width+'px').attr("height",height+'px');
    this.rectGroupWidth = (this.width-this.topMargin);
    this.rectGroup = this.svg.append('g').attr("width",this.rectGroupWidth+'px').attr("height",this.rectGroupWidth+'px'+'px');
    this.blockSize = 0;
    this.textHeight = 11;
    this.rectGroup.attr("transform",'translate('+this.leftMargin+' '+this.topMargin+')');
    this.simFunction = function(a,b) {
        return avgJaccardSim(a,b);
    };
    
    /*
    this.svg.on("mouseenter", function() {
        cdm.rectGroup.selectAll("polyline").transition().style("opacity","0.5");
    })
    .on("mouseleave", function() {
        cdm.rectGroup.selectAll("polyline").transition().style("opacity","0");
    });
    */
};

function drawComparisonDistanceMatrix(targetDiv,width,height,categories,title) {
    cdm = new ComparisonDistanceMatrix(targetDiv,width,height,categories,title);
};

function updateComparisonDistanceMatrix() {
    cdm.rectGroup.selectAll("*").remove();
    cdm.svg.selectAll("text").remove();

    cdm.blockSize = cdm.rectGroupWidth/(predictions.length+1);

    //starting from -1: ground truh, 0: first prediction
    for(var i=-1; i<predictions.length; i++) {
        if(i<predictions.length-1) {
            var topPredictionLabels = cdm.svg.append("text")
                .attr("y",cdm.textHeight+"px")
                .attr("font-size",cdm.textHeight+"px")
                .attr("fill", function() {
                    return lineColors[i+1];
                })
                .text("P"+(i+1));
                //.text(predictions[i+1].name.substr(0,12));
                //.attr("x", function() {
                //    return cdm.leftMargin+(i+2)*cdm.blockSize+this.getComputedTextLength()/2;
                //})
            topPredictionLabels.attr('x', function(d) {
                    return (cdm.leftMargin + (i+2)*cdm.blockSize + cdm.blockSize/2 - this.getComputedTextLength()/2)+"px";
            });
        }

        if(i==-1) {
            var topGroundTruthLabel = cdm.svg.append("text")
                .attr("y",cdm.textHeight+"px")
                .attr("font-size",cdm.textHeight+"px")
                //.text(groundTruth.name.substr(0,12))
                .text("Ref");
            topGroundTruthLabel.attr("x", function() {
                    return (cdm.leftMargin + cdm.blockSize/2 - this.getComputedTextLength()/2)+"px";
                });
        }

        if(i<predictions.length-1) {
            var leftPredictionsLabels = cdm.svg.append("text")
                .attr("y","15px")
                .attr("font-size",cdm.textHeight+"px")
                //.text(predictions[i+1].name.substr(0,12))
                .attr("fill", function() {
                    return lineColors[i+1];
                })
                .text("P"+(i+1));
            leftPredictionsLabels.attr("x",function() {
                return (-cdm.leftMargin - cdm.blockSize/2 - this.getComputedTextLength()/2 -(i+2)*cdm.blockSize)+"px" ;
            })
            .attr("transform","rotate(-90)");
        }
        if(i==-1) {
            var leftGroundTruthLabel = cdm.svg.append("text")
                .attr("y","15px")
                .attr("font-size",cdm.textHeight+"px")
                .text("Ref");
            leftGroundTruthLabel.attr("x",function() {
                        return (-cdm.leftMargin-cdm.blockSize/2-this.getComputedTextLength()/2)+"px";
                    })
                    .attr("transform","rotate(-90)");
        }

        for(var j=i; j<predictions.length; j++) {
            var measureVal = 0;

            let circleBar;

            cdm.rectGroup.append('rect')
                .attr('x', (j+1)*cdm.blockSize+"px")
                .attr('y', (i+1)*cdm.blockSize+"px")
                .attr('width', (cdm.blockSize-1)+"px")
                .attr('height', (cdm.blockSize-1)+"px")
                .attr('fill',function() {
                    var c;
                    if(i==-1 && j==-1)
                        c = cdm.simFunction(groundTruth.data,groundTruth.data);
                    else if(i==-1)
                        c = cdm.simFunction(groundTruth.data,predictions[j].data);
                    else if(j==-1)
                        c = cdm.simFunction(groundTruth.data,predictions[i].data);
                    else
                        c = cdm.simFunction(predictions[i].data,predictions[j].data);
                    measureVal = c;
                    c = 255*(1-c);
                    return 'rgba('+c+','+c+','+c+',1)';
                //})
                //.on("mouseenter", function() {
                //    circleBar.attr("opacity",0.5);
                //}).on("mouseleave", function() {
                //    circleBar.attr("opacity",0);
                });
            
            circleBar = cdm.rectGroup.append("polyline")
                .attr("points",generateRadialBarPoints(cdm.textHeight*1.5,measureVal))
                .attr("stroke","yellow")
                .attr("stroke-width","4px")
                .attr('transform', 'translate('+(j+1.5)*cdm.blockSize+','+(i+1.5)*cdm.blockSize+')')
                .attr("fill","none")
                .style("pointer-events","none")
                .attr("opacity","0");

            var contentText = cdm.rectGroup.append('text')
                .attr('y', ((i+1)*cdm.blockSize + cdm.blockSize/2 + cdm.textHeight/2)+"px")
                //.attr("font-size",12+"px")
                .attr('fill','white')
                .style("pointer-events","none")
                .text(function() {
                    var c;
                    if(i==-1 && j==-1)
                        c = cdm.simFunction(groundTruth.data,groundTruth.data);
                    else if(i==-1)
                        c = cdm.simFunction(groundTruth.data,predictions[j].data);
                    else if(j==-1)
                        c = cdm.simFunction(groundTruth.data,predictions[i].data);
                    else
                        c = cdm.simFunction(predictions[i].data,predictions[j].data);
                    return toPercent(c);
                    //return formatOutputNumber(c);
                });
            contentText.attr('x', function(d,i) {
                return ((j+1)*cdm.blockSize + cdm.blockSize/2 - this.getComputedTextLength()/2)+"px";
            });
        }
    }

}

function updateComparisonDistanceMatrixValues() {

}