(function(exports){

  var ModeEnum = {
    STATE: "State",
    GENDER: "Gender",
    RACE: "Race",
    MONTH: "Month"
  }
  var DiseaseEnum = {
    Diphtheria: "Diphtheria",
    Haemophilus_influenzae: "Haemophilus_influenzae",
    Hepatitis_A: "Hepatitis A",
    Hepatitis_B: "Hepatitis B",
    Human_papillomavirus: "Human papillomavirus",
    Measles: "Measles",
    Meningococcal_disease: "Meningococcal disease",
    Mumps: "Mumps",
    Pertussis: "Pertussis",
    Pneumococcal_disease: "Pneumococcal disease",
    Polio: "Polio",
    Rotavirus: "Rotavirus",
    Rubella: "Rubella",
    Tetanus: "Tetanus",
    Varicella: "Varicella"
  }

//track the hidden divs values with this code
  /*
  * object.watch polyfill
  *
  * 2012-04-03
  *
  * By Eli Grey, http://eligrey.com
  * Public Domain.
  * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
  */
  // object.watch
  if (!Object.prototype.watch) {
    Object.defineProperty(Object.prototype, "watch", {
      enumerable: false
      , configurable: true
      , writable: false
      , value: function (prop, handler) {
        var
        oldval = this[prop]
        , newval = oldval
        , getter = function () {
          return newval;
        }
        , setter = function (val) {
          oldval = newval;
          return newval = handler.call(this, prop, oldval, val);
        }
        ;

        if (delete this[prop]) { // can't watch constants
        Object.defineProperty(this, prop, {
          get: getter
          , set: setter
          , enumerable: true
          , configurable: true
        });
      }
    }
  });
}
// object.unwatch
if (!Object.prototype.unwatch) {
  Object.defineProperty(Object.prototype, "unwatch", {
    enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop) {
      var val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
  });
}

dataObj = null;
//Mode selection
modeSelect = document.getElementById("mode");
currentMode = modeSelect.value;
//Disease selection
diseaseSelect = document.getElementById("disease");
currentDisease = diseaseSelect.value;
//Filter button
document.getElementById('filter').addEventListener('click', HeatUpdate);
//play button
document.getElementById('play').addEventListener('click', HeatUpdate);
//hidden div - for hover state
hoverState = document.getElementById("hoverState");
hoverState.watch("value",function(){
  HeatUpdate();
});
//hidden div - for the year of the chloropleth
hiddenYear = document.getElementById('hiddenYear');
hiddenYear.watch("value", function(){
  HeatUpdate();
});
//div for altering the left margin of the heatmap for different views
heatmapContainer = document.getElementById('heatmap-container');

//Update the heatmap - called on various listeners
function HeatUpdate(){
  currentMode = modeSelect.value;
  currentDisease = diseaseSelect.value;
  $.ajax({
    method: "POST",
    url: "http://kenalexandthom.com/cs_4460/getCases.php",
    data: {
      filter: currentMode,
      disease: currentDisease
    }
  }).done(function(json) {
    // Insert code to process json text string
    dataObj = JSON.parse(json);
    if(currentMode == ModeEnum.STATE){
      drawStateHeatmap();
    } else if (currentMode == ModeEnum.GENDER){
      drawGenderHeatmap();
    } else if (currentMode == ModeEnum.RACE){
      drawRaceHeatmap();
    } else if (currentMode == ModeEnum.MONTH){
      drawMonthHeatmap();
    }
  });
}

var margin = { top: 50, right: 0, bottom: 100, left: 50 },
width = (41*51) - margin.left - margin.right;
buckets = 9,
colors = ['#2c7bb6', '#abd9e9', '#ffffbf', '#fdae61', '#d7191c'],
days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
statesAbbr = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
'VA', 'WA', 'WV', 'WI', 'WY'],

states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
'Dist. of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas',
'Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri',
'Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina',
'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

times = ["2008", "2009", "2010", "2011", "2012", "2013"],
races = ["White", "Black", "Asian or Pacific Islander", "American Indian or Alaska Native", "Other", "Race not stated"],
months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
height = 500 - margin.top - margin.bottom,
gridSize = Math.floor(810 / 24),
legendElementWidth = gridSize * 3,
genders = ["Male", "Female", "Sex not stated"];
genderlabels = ["Male", "Female", "N/A"];

var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function removeLabels(){
  svg.selectAll(".timeLabel").remove();
  svg.selectAll(".genderLabel").remove();
  svg.selectAll(".raceLabel").remove();
  svg.selectAll(".stateLabel").remove();
  svg.selectAll(".monthLabel").remove();
  svg.selectAll(".legendLabel").remove();
}

function drawTimeLabels(){
  var timeLabels = svg.selectAll(".timeLabel")
  	.data(times)
  	.enter().append("text")
  	.text(function(d) { return d; })
  	.attr("stroke",function(d){
      if(d==document.getElementById("year").value){
        return "black";
      }
    })
  	.attr("x", -20)
  	.attr("y", gridSize * 0.6)
  	.attr("dy", function(d, i) { return i * gridSize; })
  	.style("text-anchor", "middle")
  	.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

}

function drawStateLabels(){
  var stateLabels = svg.selectAll(".stateLabel")
  	.attr("transform", "translate( 0, " + gridSize + ")")
  	.data(statesAbbr)
  	.enter().append("text")
  	.text(function (d) { return d; })
  	.attr("x", gridSize/3)
  	.attr("y", gridSize * 6.5)
  	.attr("dx", function (d) {
    var ind = statesAbbr.indexOf(d);
    return ind*(gridSize);})
    	.attr("class", function (d, i) { return ((i >= 0 && i <= statesAbbr.length-1) ? "stateLabel mono axis axis-workweek" : "stateLabel mono axis"); });
  }

  function drawGenderLabels(){
    var genderLabels = svg.selectAll(".genderLabel")
    	.data(genderlabels)
    	.attr("transform", "translate( 0, " + gridSize + ")")
    	.enter().append("text")
    	.text(function (d) { return d; })
    	.attr("transform", "rotate(-90)")
    	.style("text-anchor", "end")
    	.attr("x", - gridSize * 6.1)
    	.attr("y", function(d){
        var ind = genderlabels.indexOf(d);
        return ind*gridSize;})
    	.attr("dy", gridSize/2)
    	.attr("class", function (d, i) { return "genderLabel mono axis"; });
  }

  function drawRaceLabels(){
    var raceLabels = svg.selectAll(".races")
    	.data(races)
    	.attr("transform", "translate( 0, " + gridSize + ")")
    	.enter().append("text")
    	.text(function (d) { return d; })
    	.attr("transform", "rotate(-90)")
    	.style("text-anchor", "end")
    	.attr("x", - gridSize * 6.1)
    	.attr("y", function(d){
        var ind = races.indexOf(d);
        return ind*gridSize;})
    	.attr("dy", gridSize/2)
    	.attr("class", function (d, i) { return "raceLabel mono axis"; });
  }

  function drawMonthLabels(){
    var monthLabels = svg.selectAll(".months")
    	.data(months)
    	.attr("transform", "translate( 0, " + gridSize + ")")
    	.enter().append("text")
    	.text(function (d) { return d; })
    	.attr("transform", "rotate(-90)")
    	.style("text-anchor", "end")
    	.attr("x", - gridSize * 6.1)
    	.attr("y", function(d){
      var ind = months.indexOf(d);
      return ind*gridSize;})
      	.attr("dy", gridSize/2)
      	.attr("class", function (d, i) { return "monthLabel mono axis"; });
  }

  function drawRaceHeatmap(){
    //update left margin
    heatmapContainer.style = "margin-left:410px";
    removeLabels();
    drawRaceLabels();
    drawTimeLabels();
    data = dataObj;
    var colorScale = d3.scale.quantile()
    	.domain([0, buckets - 1, d3.max(data, function (d) { return d.cases; })])
    	.range(colors);

    var cards = svg.selectAll(".hour")
    	.data(data, function(d) {
        return d.year+':'+d.race;
      });
    var xValue = function(d){return d.year};
    cards.append("title");
    cards.enter().append("rect")
    	.filter(function(d){
        if(d.year > 2007){
          return d;
        }
      })
  	.attr("x", function(d){
      var ind = races.indexOf(d.race);
      return ind*gridSize;
    })
  	.attr("y", function(d){
      return (xValue(d)-2008)*gridSize
    })
  	.attr("rx", 4)
  	.attr("ry", 4)
  	.attr("class", "hour bordered")
  	.attr("width", gridSize)
  	.attr("height", gridSize)
  	.style("fill", colors[0]);

    cards.transition().duration(1000)
    	.style("fill", function(d) {
        if(d.cases == "U" || d.cases == "N/A"){
          return "white";
        } else {
          return colorScale(d.cases);
        }
      })
      .style("stroke", function(d){
        if(""+d.year == ""+hiddenYear.innerHTML){
          return "black";
        }
      });

    cards.select("title").text(function(d) { return d.cases; });
    cards.exit().remove();
    drawLegend();
  }

  function drawMonthHeatmap(){
    //update left margin
    heatmapContainer.style = "margin-left:410px";
    removeLabels();
    drawMonthLabels();
    drawTimeLabels();
    data = dataObj.filter(function(d){
      if(d.disease == currentDisease){
        return d;
      }
    });

    var colorScale = d3.scale.quantile()
    	.domain([0, buckets - 1, d3.max(data, function (d) { return d.cases; })])
    	.range(colors);
    
    var cards = svg.selectAll(".hour")
    	.data(data, function(d) {
        var str = String(d.month);
        var res = str.split(" ");
        var year = res[0];
        var month = res[1];
        return year+':'+month;
      });
      var yValue = function(d){
        var res = (d.month).split(" ");
        var year = res[0];
        return year;
      };

    cards.append("title");
    cards.enter().append("rect")
    	.filter(function(d){
        var str = String(d.month);
        var res = str.split(" ");
        var year = res[0];
        if(year > 2007 && d.disease == currentDisease){
          return d;
        }
      })
    	.attr("x", function(d){
        var str = String(d.month);
        var res = str.split(" ");
        var month = res[1];
        var ind = months.indexOf(month);
        return ind*gridSize;
      })
    	.attr("y", function(d){
        return (yValue(d)-2008)*gridSize;
      })
    	.attr("rx", 4)
    	.attr("ry", 4)
    	.attr("class", "hour bordered")
    	.attr("width", gridSize)
    	.attr("height", gridSize)
    	.style("fill", colors[0]);

    cards.transition().duration(1000)
    	.style("fill", function(d) {
        if(d.cases == "U" || d.cases == "N/A"){
          return "Grey";
        }
        else{
          return colorScale(d.cases);
        }
      })
      .style("stroke", function(d){
        var myYear = ""+hiddenYear.innerHTML;
        var myMonth = ""+d.month;
        if(myMonth.includes(myYear)){
          return "black";
        }
      });

    cards.select("title").text(function(d) { return d.cases; });
    cards.exit().remove();
    drawLegend();
  }

  function drawGenderHeatmap(){
    //update left margin
    heatmapContainer.style = "margin-left:410px";
    removeLabels();
    drawGenderLabels();
    drawTimeLabels();
    data = dataObj;
    var colorScale = d3.scale.quantile()
    	.domain([0, buckets - 1, d3.max(data, function (d) { return d.cases; })])
    	.range(colors);

    var cards = svg.selectAll(".hour")
    	.data(data, function(d) {
      return d.year+':'+d.gender;
    });
    var xValue = function(d){return d.year};
    cards.append("title");
    cards.enter().append("rect")
    	.filter(function(d){
        if(d.year > 2007){
          return d;
        }
      })
    	.attr("x", function(d){
        var ind = genders.indexOf(d.gender);
        return ind*gridSize;
      })
    	.attr("y", function(d){
        return (xValue(d)-2008)*gridSize
      })
    	.attr("rx", 4)
    	.attr("ry", 4)
    	.attr("class", "hour bordered")
    	.attr("width", gridSize)
    	.attr("height", gridSize)
    	.style("fill", colors[0]);

    cards.transition().duration(1000)
    	.style("fill", function(d) {
        if(d.cases == "U" || d.cases == "N/A" || d.cases == "---"){
          return "Grey";
        }
        else{
          return colorScale(d.cases);
        }
      })
      .style("stroke", function(d){
        if(""+d.year == ""+hiddenYear.innerHTML){
          return "black";
        }
      });

    cards.select("title").text(function(d) { return d.cases; });
    cards.exit().remove();

    drawLegend();
  }

  function drawStateHeatmap(){
    //reset left margin
    heatmapContainer.style = "margin-left:0px";
    removeLabels();
    drawTimeLabels();
    drawStateLabels();
    data = dataObj;
    
    var colorScale = d3.scale.quantile()
    	.domain([0, buckets - 1, d3.max(data, function (d) {return d.cases; })])
    	.range(colors);

    var cards = svg.selectAll(".hour")
    	.data(data, function(d) {
        return d.state+':'+d.year;
      });
    var xValue = function(d){return d.year};

    cards.append("title");
    cards.enter().append("rect")
    	.attr("x", function(d){
        var ind = states.indexOf(d.state);
        return ind*gridSize;
      })
    	.attr("y", function(d){
        return (xValue(d)-2008)*gridSize;
      })
    	.attr("rx", 4)
    	.attr("ry", 4)
    	.attr("class", "hour bordered")
    	.attr("width", gridSize)
    	.attr("height", gridSize)
    	.style("fill", colors[0])
    	.style("stroke-width", 3);

    cards.transition().duration(1000)
    	.style("fill", function(d) {
        if(d.cases == "U" || d.cases == "N/A"){
          return "Grey";
        } else {
          return colorScale(d.cases);
        }
      })
    	.style("stroke", function(d){
        if(""+d.year == ""+hiddenYear.innerHTML){
          return "black";
        }
      })
    	.style("stroke-width", function(d){
        if(d.state == hoverState.innerHTML && d.year == document.getElementById("year").value){
          return 10;
        }
      });

    cards.select("title").text(function(d) { return d.cases; });
    cards.exit().remove();
    drawLegend();
  }

  function drawLegend(){
    var colorScale = d3.scale.quantile()
    	.domain([0, buckets - 1, d3.max(data, function (d) { return d.cases; })])
    	.range(colors);
    var legend = svg.selectAll(".legend")
    	.data([0].concat(colorScale.quantiles()), function(d) {
        return d;
      });

    legend.enter().append("g")
    	.attr("class", "legend");
      
    var zeroCount = 0;
    for(var i=0;i<colorScale.quantiles().length;i++){
      if(colorScale.quantiles()[i] == 0){       
        zeroCount++;
      }
    }
    if(zeroCount==2){
      document.getElementById("heatmap-description").innerHTML = "No CDC data for this";
    }
    else{
      document.getElementById("heatmap-description").innerHTML = "Number of infections";
    }
    // Coloring
    legend.append("rect")
    	.attr("x", function(d, i) { return legendElementWidth * i; })
    	.attr("y", -gridSize)
    	.attr("width", legendElementWidth)
    	.attr("height", gridSize / 2)
    	.style("fill", function(d, i) {return colors[i];});

    legend.append("text")
    	.attr("class", "legendLabel mono")
    	.text(function(d) {
        return "≥ " + Math.round(d*10)/10;
      })
    	.attr("x", function(d, i) { return legendElementWidth * i; })
    	.attr("y", -gridSize * 1.1)
    	.attr("dx", 5);

    legend.exit().remove();
  }

  $.ajax({
    method: "POST",
    url: "http://kenalexandthom.com/cs_4460/getCases.php",
    data: {
      filter: currentMode,
      disease: currentDisease
    }
  })
  .done(function(json) {
    // Insert code to process json text string
    dataObj = JSON.parse(json);
    if(currentMode == ModeEnum.STATE){
      drawStateHeatmap();
    } else if (currentMode == ModeEnum.GENDER){
      drawGenderHeatmap();
    } else if (currentMode == ModeEnum.RACE){
      drawRaceHeatmap();
    } else if (currentMode == ModeEnum.MONTH){
      drawMonthHeatmap();
    }
  });

})(window);
