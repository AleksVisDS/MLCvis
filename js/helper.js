/*
 * General purpose utility functions
 */

var sum = list => list.reduce((a,b) => a+b,0);

function toPercent(value) {
    if(value < 0.001) return 0; //otherwise it would be -0
    return (value * 100).toFixed(0);
    //return (value * 100).toFixed(2);
}

function formatOutputNumber(num) {
    return num.toLocaleString('en-GB', {
        maximumFractionDigits: 2
    });
}

function createArray(size) {
    var a = [];
    a[size-1] = 0;
    a.fill(0);
    return a;
}

function jaccardSim(l1,l2) {
    var intersection = 0;
    var union = 0;
    if(l1.length <= l2.length) {
        for(var i=0; i<l1.length; i++) {
            if(l1[i]==1 && l2[i]==1) intersection = intersection+1;
            if(l1[i]==1 || l2[i]==1) union = union+1;
        }
        if(union == 0 && intersection == 0) return 1;
        if(union == 0) return -1;
        return intersection/union;
    } else {
        console.error("Error: jaccardSim: Lists not same size: "+l1.length+" and "+l2.length);
        return -1;
    }
}

function avgJaccardSim(multidiml1, multidiml2) {
    if(multidiml1.length != multidiml2.length)
        console.error("Warning: List lengths not equal (avgJaccardSim)");

    var jaccardAverage = 0;
    for(var i=0; i<multidiml1.length; i++)
        jaccardAverage = jaccardAverage + jaccardSim(multidiml1[i],multidiml2[i]);
    return jaccardAverage/multidiml1.length;
}

function avgJaccardSimLabels(multidiml1, multidiml2) {
    var m1 = transpose2DArray(multidiml1);
    var m2 = transpose2DArray(multidiml2);
    return avgJaccardSim(m1,m2);
}

function transpose2DArray(array) {
    var length = array.length;
    var width = array[0].length;
    var transposed = createArray(width);
    for(var i=0; i<width; i++) {
        transposed[i] = createArray(length);
        for(var j=0; j<length; j++) {
            transposed[i][j] = array[j][i];
        }
    }
    //console.log(transposed);
    return transposed;
}

function findDocumentsWithLabel(labelId,searchGroundTruth,searchPredictions) {
  documents = new Set([]);
  if(searchGroundTruth)
  for(var i=0; i<groundTruth.encodedClasses.length; i++) {
    for(var j=0; j<groundTruth.encodedClasses[i].length; j++)
      if(groundTruth.encodedClasses[i][j]==labelId)
      documents.add(i);
  }
  if(searchPredictions)
  for(var p=0; p<predictions.length; p++)
   for(var i=0; i<predictions[p].encodedClasses.length; i++)
    for(var j=0; j<predictions[p].encodedClasses[i].length; j++)
      if(predictions[p].encodedClasses[i][j]==labelId)
      documents.add(i);
  return Array.from(documents);
}

function findDocumentsWithThreshold(threshold) {
}

function contains(list,element) {
    for(var i=0; i<list.length; i++)
        if(list[i]==element) return true;
    return false;
}

function drawMouseOverText(highlight,outputtext) {
    var div = body.select('#hiddenmouseovercanvas');
    //var rect = svg.select('rect');
    //var text = svg.select('text');
    var xPadding = 5;

    if (highlight) {
        div.style('visibility', 'visible').style("background-color","rgba(0,0,0,0.8)").style("color","white").style("padding","3px");
        var textLength = 0;

        div
            .style('left', function () {
                var posx = d3.event.clientX + 10;
                return (posx - xPadding)+"px";
            })
            .style('top', function () {
                return (d3.event.pageY - csb.textHeight/2 - xPadding - window.scrollY)+"px";
            })
            .html(function () {
                return outputtext;
            });

            /*
        rect
            .attr('x', function () {
                var posx = d3.event.clientX + 10;
                return posx - xPadding;
            })
            .attr('y', function () {
                return d3.event.pageY - csb.textHeight/2 - xPadding - window.scrollY;
            })
            .attr('width', textLength + 2 * xPadding)
            .attr('height', csb.textHeight + 2 * xPadding)
            .attr('fill','rgba(0,0,0,0.8)');

        text
            .attr('x', function () {
                var posx = d3.event.clientX + 10;
                textLength = this.getComputedTextLength();
                return posx;
            })
            .attr('y', function () {
                return d3.event.pageY + csb.textHeight/2 - window.scrollY;
            })
            .attr('fill','white');*/
    } else {
        div.style('visibility', 'hidden');
    }
}

function generateRadialBarPoints(r,percent,nticks) {
    if(nticks==undefined) nticks = 29;
    
    var pi = 3.1415;
    var phi = 0;
    var step = (2*pi)/nticks;
    var points = "0,"+(-r);
    for(var i=0; i<=nticks; i++) {
        points += " ";
        points += r*Math.sin(-pi-phi);
        points += ",";
        points += r*Math.cos(-pi-phi);
        phi += step;
        if(phi > percent*2*pi) break; 
    };
    return points;
}

function drawMouseOverPicture(fileName) {
    var div = body.select('#hiddenmouseoverdiv');

    if (fileName!=undefined) {
        div.style('visibility', 'visible');
        var textLength = 0;

        div
        //.style('margin-left','100px')
        //.style('margin-top','100px')
        .style('left','800px')
        .style('top','100px')
        .style('width', '500px')
        .style('height', '500px')
        .html(function() {
           return showImageHTMLCode(fileName,true);
        });
        
    } else {
        div.style('visibility', 'hidden');
    }
}