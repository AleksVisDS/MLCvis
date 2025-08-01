var cbs;

var ComparisonBlocks = function(targetDiv,headerDiv,width,height,categories,title) {
  
  this.div = targetDiv.style("border","solid grey 1px").style("border-style","dotted none none none");

  this.headerDiv = headerDiv;
  this.headerDivHeight = 40
  this.headerDivTextHeight = 11;
  this.filterDivHeight = 20;
  this.filterDiv = headerDiv.append("div").style("font-size",this.headerDivTextHeight+"px").style("height",this.filterDivHeight+"px");
  this.filterDivNoFilter = this.filterDiv.append("span").style("padding","5px").text("No filters");
  this.filterDivText = this.filterDiv.append('span').style("padding","5px").html("Show documents with label").style("visibility","hidden");
  this.filterDivLabel = this.filterDiv.append('span').style("font-family","monospace").style("visibility","hidden");
  this.filterDivIn = this.filterDiv.append("span").style("padding","5px").html("in").style("visibility","hidden");
  this.optionSelect = this.filterDiv.append("select").style("font-size","11px").style("visibility","hidden")
      .on("change",function(d,i) {
          switch(this.value) {
            case "all":
              cbs.FILTER_TYPE = cbs.FILTER_ALL;
              break;
            case "reference":
              cbs.FILTER_TYPE = cbs.FILTER_ONLYREFERENCE;
              break;
            case "predictions":
              cbs.FILTER_TYPE = cbs.FILTER_ONLYPREDICTIONS;
              break;
            default:
              cbs.FILTER_TYPE = cbs.FILTER_ALL;
          }
          filterComparisonBlockClasses(cbs.filterId,true);
      });
  this.optionSelect.append("option").attr("value","all").html("reference or prediction");
  this.optionSelect.append("option").attr("value","reference").html("reference");
  this.optionSelect.append("option").attr("value","predictions").html("prediction");
  this.filterDivRemoveButton = this.filterDiv.append('span').attr("class","button").style("font-size","11px").html("Remove").style("visibility","hidden").style("display","inline-block")
    .on("click", function() {
      removeComparisonBlockFilter();
    });

  this.headerDivSvgHeight = 20;
  this.headerDivSvg = this.headerDiv.append("svg").style("height",this.headerDivSvgHeight+"px").style("width",width+"px");

  this.height = height;
  this.width = width;
  this.topMargin = 5;
  this.leftMargin = 5;
  this.rightMargin = 15;
  this.betweenDocumentMargin = 5;
  this.betweenLabelMargin = 2;

  this.rectGroup = [];
  this.blocks = undefined;
  this.rectGroupWidth = (width-this.leftMargin);

  this.leftTextMargin = 150;
  this.textHeight = 12;
  this.topTextMargin = this.textHeight+this.betweenLabelMargin+5;
  this.circleRadius = 4;
  this.labelBlockWidth = this.circleRadius*5;

  this.documentContentOffset = 0;
  this.documentContentWidth = 0;

  this.blockHeight = [];
  this.accumulatedBlockHeight = [];

  this.filter = [];
  this.filterId = undefined;
  //this.filterActive = false;

  this.pictureShown = false;
  this.pictureId = -1;

  this.headerSvgDocumentCount = this.headerDivSvg.append("text");

  this.div.style("font-size",this.textHeight+"px");

  this.FILTER_ALL = 0;
  this.FILTER_ONLYREFERENCE = 1;
  this.FILTER_ONLYPREDICTIONS = 2;
  this.FILTER_TYPE = this.FILTER_ALL;
};

/*
 * Draw after reference/ground truth file has been loaded and all documents are known
 */
function drawComparisonBlocks(targetDiv,headerDiv,width,height,categories,title) {
  cbs = new ComparisonBlocks(targetDiv,headerDiv,width,height,categories,title);

  for(var i=0; i<groundTruth.data.length; i++) cbs.filter[i] = i; //set default filter (= contains everything)

  cbs.blocks = cbs.div.selectAll("div")
    .data(documentsData)
    .enter()
    .append("div")
    .style("border","dotted black 1px")
    .style("border-style","none none dotted none")
    .style("height","100px")
    .style("display","block");
  cbs.blocksLeft = cbs.blocks
    .append("div")
    .style("border","solid black 0px")
    .style("display","inline-block")
    .style("width",(cbs.width/2)+"px")
    .style("height","100%");
  cbs.blocksRight = cbs.blocks
    .append("div")
    .style("display","inline-block")
    .style("width",(cbs.width/2-cbs.rightMargin)+"px")
    .style("height","100%")
    .style("overflow","hidden")
    .style("overflow-wrap","break-word")
    .on("mouseenter", function() {
      if(MODE==TEXT_MODE) {
        d3.select(this).style("overflow-y","scroll").text(function(d,i) {;
          return d.abstract;
        });
      }
      if(MODE==AUDIO_MODE) {
        d3.select(this).html(function(d,i) { return showAudioHTMLCode(d.title); });
      }
    })
    .on("mouseleave", function() {
      if(MODE==TEXT_MODE) {
        d3.select(this).style("overflow-y","hidden");
        d3.select(this).html(function(d,i) {
          output = "";
          if(d.authors=="") output = d.title;
          else output = d.title+" ("+d.authors+")";
          return output;
        });
      }
      if(MODE==AUDIO_MODE) {
        d3.select(this).html(function(d,i) { return d.title; });
      }
    })
    .on("click", function(d) {
      if(MODE==IMAGE_MODE) {
        if(cbs.pictureShown && d.title == cbs.pictureId) {
          drawMouseOverPicture(); //remove pic
          cbs.pictureShown = !cbs.pictureShown;
        } else if(cbs.pictureShown) {
          drawMouseOverPicture(d.title);
          cbs.pictureId = d.title;
        } else {
          drawMouseOverPicture(d.title);
          cbs.pictureId = d.title;
          cbs.pictureShown = !cbs.pictureShown;
        }
      }
    })
    .style("cursor",function() {
      if(MODE==IMAGE_MODE) return "pointer";
    })
  
  cbs.blocksSvg = cbs.blocksLeft.append("svg").style("width",(cbs.width/2)+"px").style("height","100%");
  cbs.blocksSvg.append("text").attr("font-weight","bold").attr("font-size","9px").attr("x",cbs.leftMargin).attr("y",cbs.textHeight).text(function(d) {return "Document #"+d.id;});
  
  //Load sample content depending on type
  cbs.blocksRight.html(function(d,i) {
		output = "";
		if(MODE==IMAGE_MODE) {
      output = showImageHTMLCode(d.title);
    } else if (MODE==AUDIO_MODE) {
      //output = showAudioHTMLCode(d.title);
      output = d.title;
		} else {
			if(d.authors=="") output = d.title;
      else output = d.title+" ("+d.authors+")";
    }
		return output;
  });
}

//Called after adding 1 predictor
function updateComparisonBlocks() {
  if(cbs.blockLabels != undefined) cbs.blockLabels.remove();
  cbs.blockLabels = cbs.blocksSvg.append("g").style("font-family","monospace");
  cbs.blockHeight = [];
  cbs.documentContentOffset = cbs.leftTextMargin + (predictions.length)*cbs.labelBlockWidth + cbs.circleRadius;

  //For each document / box
  cbs.blockLabels.each(function(ddoc,idoc) {
    let union = unionPredictions(ddoc.gtEncoded, ddoc.predictionsEncoded);
    let localBlockHeight = cbs.topTextMargin+union.length*(cbs.textHeight+cbs.betweenLabelMargin)+cbs.textHeight/2;
    if(localBlockHeight < 100 && MODE!=TEXT_MODE) localBlockHeight = 100;
    cbs.blockHeight.push( localBlockHeight );

    //Add labels per box on the left isde
    var labelTexts = d3.select(this).selectAll("text").data(union).enter().append("text")
      .attr("x",cbs.leftMargin)
      .attr("y",function(d,i) {
        return cbs.topTextMargin+(cbs.textHeight+cbs.betweenLabelMargin)*(i+1);
      })
      .text(function(d,i) {
          return (d+":"+categories.data[d]);
      })
      .attr("fill", function(d) {
        if(!contains(ddoc.gtEncoded,d))
          return "grey";
      })
      .attr("font-style", function(d) {
        if(!contains(ddoc.gtEncoded,d))
          return "italic";
      })
      .style("cursor","pointer")
      .on("mouseenter", function(d) {
        d3.select(this).attr("font-weight","bold");
        drawMouseOverText(true,(d+':'+categories.data[d]));
      })
      .on("mouseleave", function(d) {
        d3.select(this).attr("font-weight",undefined);
        drawMouseOverText(false);
      })
      .on("click", function(d) {
        filterComparisonBlockClasses(d);
        //csb.lowerDiv.node().scrollTop = (csb.barHeight)*csb.sIndex.indexOf(d);
      });
    labelTexts.text(function(d,i) {
      if((d+":"+categories.data[d]).length*(cbs.textHeight*0.75) > cbs.leftTextMargin)
        return (d+":"+categories.data[d]).substr(0,17)+'...';
      else
        return (d+":"+categories.data[d]);
    });
    
    //For each predictor / circle column
    let circleGroup = d3.select(this).selectAll("g").data(ddoc.predictionsEncoded).enter().append("g");

  //Draw similarity bars
   circleGroup.append("rect")
    .attr("x", function(d,i) {
      return cbs.leftTextMargin + i * cbs.labelBlockWidth + cbs.labelBlockWidth/4;
    })
    .attr("y", function(d,i) {
      return (cbs.topTextMargin + cbs.circleRadius/2) - ((cbs.topTextMargin + cbs.circleRadius/2)*jaccardSim(ddoc.gt,ddoc.predictions[i]));
    })
    .attr("width", cbs.labelBlockWidth/2)
    .attr("height", function(d,i) {
      return (cbs.topTextMargin + cbs.circleRadius/2) * jaccardSim(ddoc.gt,ddoc.predictions[i]);
    })
    .attr("fill",function(d,i) { return lineColors[i];} )
    .attr("opacity","0.5")
    .on("mouseenter", function(d,i) {
      d3.select(this).attr("opacity","0.8");
      //circleGroup.selectAll("rect").attr("opacity","0.8");
      drawMouseOverText(true,"Jaccard similarity: "+toPercent(jaccardSim(ddoc.gt,ddoc.predictions[i]))+"%");
    })
    .on("mouseleave", function() {
      d3.select(this).attr("opacity","0.5");
      //circleGroup.selectAll("rect").attr("opacity","0.5");
      drawMouseOverText();
    });

    let circleGroupSeparationLine = d3.select(this).selectAll("line").data(union).enter().append("line")
      .attr("x1",0)
      .attr("y1",function(d,i) {
        return (cbs.topTextMargin + cbs.circleRadius/2 + i*(cbs.textHeight+cbs.betweenLabelMargin))+"px";
      })
      .attr("x2",(cbs.leftTextMargin+cbs.documentContentOffset)+"px")
      .attr("y2",function(d,i) {
        return (cbs.topTextMargin + cbs.circleRadius/2 + i*(cbs.textHeight+cbs.betweenLabelMargin))+"px";
      })
      //.style("shape-rendering","crispEdges")
      .attr("stroke","black")
      .attr("stroke-opacity","0.15");

    //The circles representing the 1 in the original data
    circleGroup.each(function(dCol,iCol) {
      d3.select(this).selectAll("circle").data(dCol).enter().append('circle')
        .attr("r",cbs.circleRadius)
        .attr("cx",function(dRow, iRow) {
          return cbs.leftTextMargin + cbs.labelBlockWidth/2 + iCol * cbs.labelBlockWidth;
        })
        .attr("cy",function(dRow, iRow) {
          return cbs.topTextMargin + (cbs.textHeight+cbs.betweenLabelMargin) * (union.indexOf(dRow) + 1) - cbs.circleRadius;
        })
        .attr("fill", function(dRow) {
          if(!contains(ddoc.gtEncoded,dRow))
            return "grey";
        });
    })
  });

  //Set new div size...
  cbs.blocks.style("height", function(d,i) {
    return cbs.blockHeight[i]+"px";
  });
  cbs.documentContentWidth = cbs.width - cbs.documentContentOffset - cbs.rightMargin;
  cbs.blocksLeft.style("width",cbs.documentContentOffset+"px").style("float","left");
  cbs.blocksRight.style("width",cbs.documentContentWidth+"px").style("float","right");
  cbs.blocksSvg.style("width",cbs.documentContentOffset+"px");

  /*
  cbs.blocksLeft.each(function(d,i) {
    let str = unionPredictions(d.gtEncoded, d.predictionsEncoded);
    //d3.select(this).html(str);
  });*/

  //Add the prediction file names on top
  //cbs.headerDiv.selectAll("*").remove();
  //var headerSvg = cbs.headerDiv.append("svg").attr("width","500px").attr("height","40px");
  cbs.headerDivSvg.selectAll(".predictorText").data(predictions).enter().append("text")
  .attr("class","predictorText")
  .attr("font-size",cbs.headerDivTextHeight+"px")
  .attr("y",cbs.headerDivSvgHeight+"px")
  .attr("fill", function(d,i) {
    return lineColors[i];
  })
  .text(function(d,i) {
    return "P"+i;
  })
  .attr("x",function(d,i) {
    return (cbs.leftTextMargin + cbs.labelBlockWidth/2 + i * cbs.labelBlockWidth - this.getComputedTextLength()/2)+"px";
  });
  cbs.headerSvgDocumentCount
    .attr("id","documentCount")
    .attr("x",cbs.leftMargin)
    .attr("font-size",cbs.headerDivTextHeight+"px")
    .attr("y",cbs.headerDivSvgHeight+"px")
    .attr("fill","black")
    .text(cbs.filter.length + " document(s)");
}

function filterComparisonBlockClasses(filterId, noRemove) {
  if(cbs.filterId!=filterId || noRemove) {
    cbs.filterId = filterId;

    if(cbs.FILTER_TYPE==cbs.FILTER_ALL)
      cbs.filter = findDocumentsWithLabel(filterId,true,true);
    if(cbs.FILTER_TYPE==cbs.FILTER_ONLYREFERENCE)
      cbs.filter = findDocumentsWithLabel(filterId,true,false);
    if(cbs.FILTER_TYPE==cbs.FILTER_ONLYPREDICTIONS)
      cbs.filter = findDocumentsWithLabel(filterId,false,true);

    //resetComparisonBlockFilterView();
    applyComparisonBlockFilterView();

    //cbs.filterDiv.selectAll("*").remove();
    cbs.filterDivLabel.html((filterId+":"+categories.data[filterId]).substr(0,7)+"...");
    highlightStackedBarRow(filterId);
    highlightScatterPlotFilterLabel(filterId);
    drawMouseOverText(undefined);
    //csb.div.node().scrollTop = csb.padding + (csb.barHeight)*csb.sIndex.indexOf(filterId);//correct? pls check
  } else {
    removeComparisonBlockFilter();
  }
}

function removeComparisonBlockFilter() {
  cbs.filterId = undefined;
  cbs.filter = [];
  for(var i=0; i<groundTruth.data.length; i++) cbs.filter[i] = i;
  highlightStackedBarRow(undefined);
  highlightScatterPlotFilterLabel(undefined);
  //cbs.filterDiv.selectAll("*").remove();
  resetComparisonBlockFilterView();
}

function unionPredictions(gt,predictions) {
  var pred = new Set([]);
  for(e of gt) pred.add(e);
  for(p of predictions) for (e of p) pred.add(e);
  return Array.from(pred);
}

function resetComparisonBlockFilterView() {
  cbs.blocks.selectAll("text").style("stroke",undefined);
  cbs.blocks.style("display",undefined).transition().style("height", function(d,i) { return cbs.blockHeight[i]+"px"; });
  cbs.headerSvgDocumentCount.text(cbs.filter.length + " document(s)");
  showFilterControl(false); 
}

function applyComparisonBlockFilterView() {
  cbs.blocks.transition().style("height",function(d,i) { return cbs.blockHeight[i]+"px"; }).transition().style("display",undefined);
  var filterSelection = cbs.blocks.filter(function(d,i) { return !contains(cbs.filter,d.id); })
  filterSelection.transition().style("height","0px").transition().style("display","none");
  cbs.blocks.selectAll("text").style("stroke", function(d,i) {
    if(d==cbs.filterId) return "yellow";
  }).style("stroke-width", function(d,i) {
    if(d==cbs.filterId) return "0.5px";
  });
  cbs.headerSvgDocumentCount.text(cbs.filter.length + " document(s)");
  showFilterControl(true);
}

function showImageHTMLCode(fileName, shadow) {
  cbs.blocksRight.style("text-align","center");
  let output;
  output = '<img src="RawData/';
  output += fileName;
  output += '" style="height:100%;';
  if(shadow) output += "box-shadow: 10px 10px 10px grey;"
  output += '"/>';
  return output;
}

function showAudioHTMLCode(fileName) {
  cbs.blocksRight.style("text-align","left");
  let output = "";
  output += fileName+"<br/>"
  output += '<audio controls src="RawData/eval_chunks/';
  output += fileName;
  output += '" type="audio/wav" style="width:100%"';
  output += '"/>';
  return output;
}

function showFilterControl(show) {
  if(show) {
    cbs.filterDivNoFilter.style("display","none");
    cbs.filterDivIn.style("visibility","visible");
    cbs.filterDivLabel.style("visibility","visible");
    cbs.filterDivRemoveButton.style("visibility","visible");
    cbs.filterDivText.style("visibility","visible");
    cbs.optionSelect.style("visibility","visible");
  } else {
    cbs.filterDivNoFilter.style("display",null);
    cbs.filterDivIn.style("visibility","hidden");
    cbs.filterDivRemoveButton.style("visibility","hidden");
    cbs.filterDivLabel.style("visibility","hidden");
    cbs.filterDivText.style("visibility","hidden");
    cbs.optionSelect.style("visibility","hidden");
  }
}