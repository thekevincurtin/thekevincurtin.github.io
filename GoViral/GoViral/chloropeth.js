window.onload = function() {

    var svg = document.getElementById('statesvg');

    //function that draws the tooltip.
    function tooltipHtml(n, d){
        return "<h4>" + n + "</h4><table>"+
            "<tr><td>Vaccinations</td><td>" + d + "%</td></tr>" +
            "</table>";
        }

    //translates state abbreviations to full state names
    function expandState(state) {
        switch(state) {
            case "AL":
                return "Alabama";
            case "AK":
                return "Alaska";
            case "AZ":
                return "Arizona";
            case "AR":
                return "Arkansas";
            case "CA":
                return "California";
            case "CO":
                return "Colorado";
            case "CT":
                return "Connecticut";
            case "DE":
                return "Delaware";
            case "DC":
                return "Dist. of Columbia";
            case "FL":
                return "Florida";
            case "GA":
                return "Georgia";
            case "HI":
                return "Hawaii";
            case "ID":
                return "Idaho";
            case "IL":
                return "Illinois";
            case "IN":
                return "Indiana";
            case "IA":
                return "Iowa";
            case "KS":
                return "Kansas";
            case "KY":
                return "Kentucky";
            case "LS":
                return "Louisiana";
            case "ME":
                return "Maine";
            case "MD":
                return "Maryland";
            case "MA":
                return "Massachusetts";
            case "MI":
                return "Michigan";
            case "MN":
                return "Minnesota";
            case "MS":
                return "Mississippi";
            case "MO":
                return "Missouri";
            case "MT":
                return "Montana";
            case "NE":
                return "Nebraska";
            case "NV":
                return "Nevada";
            case "NH":
                return "New Hampshire";
            case "NJ":
                return "New Jersey";
            case "NM":
                return "New Mexico";
            case "NY":
                return "New York";
            case "NC":
                return "North Carolina";
            case "ND":
                return "North Dakota";
            case "OH":
                return "Ohio";
            case "OK":
                return "Oklahoma";
            case "OR":
                return "Oregon";
            case "PA":
                return "Pennsylvania";
            case "RI":
                return "Rhode Island";
            case "SC":
                return "South Carolina";
            case "SD":
                return "South Dakota";
            case "TN":
                return "Tennessee";
            case "TX":
                return "Texas";
            case "UT":
                return "Utah";
            case "VT":
                return "Vermont";
            case "VA":
                return "Virginia";
            case "WA":
                return "Washington";
            case "WV":
                return "West Virginia";
            case "WI":
                return "Wisconsin";
            case "WY":
                return "Wyoming";
            default:
                return "";

        }
    }

    //returns the color based on the immunization rate
    function calculateColor(num) {
        HIT = initializeHIT();
        if (isNaN(num)) {
            return "grey";
        } else if (num < (HIT - 6)) {
            return "#b2182b";
        } else if (num < (HIT - 3)) {
            return "#ef8a62";
        } else if (num < HIT) {
            return "#fddbc7";
        } else if (num < (HIT + 3)) {
            return "#d1e5f0";
        } else  if (num < (HIT + 6)) {
            return "#67a9cf";
        } else {
            return "#2166ac"
        }
    }


    //returns the color based on what state by calling calculateColor
    function getColor(data, state) {
        var fullState = expandState(state);
        var i;

        for (i = 0; i < 51; i++) {
            if (data[i].state == fullState) {
                var a = calculateColor(data[i].vaccinations);
                return a;
            }
        }
    }

    var HIT = 0;

    //returns the HIT value for the currently selected Disease
    function initializeHIT() {
        switch (disChoice) {
            case "Measles":
                return 92;
            case "Mumps":
                return 86;
            case "Diphtheria":
                return 86;
            case "Haemophilus influenzae":
                return 36;
            case "Hepatitis A":
                return 74;
            case "Hepatitis B":
                return 35;
            case "Human papillomavirus":
                return 90;
            case "Meningococcal disease":
                return 32;
            case "Pertussis":
                return 94;
            case "Pneumococcal disease":
                return 0;
            case "Polio":
                return 86;
            case "Rotavirus":
                return 25;
            case "Rubella":
                return 86;
            case "Tetanus":
                return 0;
            case "Varicella":
                return 90;
        }
        return HIT;
    }

    var states = {};

    function getVacc(data, state) {
        var fullState = expandState(state);
        for (var i = 0; i < 51; i++) {
            if (data[i].state == fullState) {
                return data[i];
            }
        }
    }

    //Strips spaces from state names
    function stripSpaces(state) {
            state = state.replace(/\s+/g, '');
            return state;
        }

    //draws the Choropleth initially, minimally different from update
    function draw() {
        //grab current disease
        disSelect = document.getElementById('disease');
        disChoice = disSelect.options[disSelect.selectedIndex].text;
        //grab current year
        yearSelect = document.getElementById('year');
        yearChoice = yearSelect.options[yearSelect.selectedIndex].text;
        //makes string for query and then runs it
        var string = "http://kenalexandthom.com/cs_4460/getVaccinations.php?year="
            + yearChoice + "&disease=" + disChoice;
        d3.json(string, function(d) {
            var j = 0;
            ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
            "ID", "IL", "IN", "IA", "KS", "KY", "LS", "ME", "MD", "MA", "MI", "MN",
            "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
            "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
            "WI", "WY"]
                .forEach(function(a) {
                    //assigns the data to the map elements
                    states[a] = {
                        color:getColor(d, a),
                        vacc:d[j].vaccinations
                    };
                    j++;
                });
            //draws the states on the map
            uStates.draw("#statesvg", d, tooltipHtml, disChoice);
        });
        var HITshow = document.getElementById('HITshow');
        var HITstr = "Herd Immunity Threshold: " + initializeHIT() + "% (Percentage of the population that must be vaccinated to also prevent the unvaccinated from catching the disease)";
        HITshow.innerHTML = HITstr;
    }

    //makes sure the choropleth gets drawn on window load
    draw();

    //adds the event listener to the filter button to update the choropleth
    document.getElementById('filter').addEventListener('click', ChorUpdate);

    //updates the choropleth
    function ChorUpdate() {

        //gets the current disease choice
        disSelect = document.getElementById('disease');
        disChoice = disSelect.options[disSelect.selectedIndex].text;

        //gets the current year choice
        yearSelect = document.getElementById('year');
        yearChoice = yearSelect.options[yearSelect.selectedIndex].text;
        document.getElementById("hiddenYear").value = yearChoice;
        document.getElementById("hiddenYear").innerHTML = yearChoice;
        //creates the query string
        var string = "http://kenalexandthom.com/cs_4460/getVaccinations.php?year="
            + yearChoice + "&disease=" + disChoice;
        var string2 = string + "&race=White";
        d3.json(string2, function(d) {

        });
        d3.json(string, function(d) {
            var j = 0;
            ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
            "ID", "IL", "IN", "IA", "KS", "KY", "LS", "ME", "MD", "MA", "MI", "MN",
            "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
            "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
            "WI", "WY"]
                .forEach(function(b) {
                    //assigns the data to each state element in the svg
                    var a = document.getElementById(stripSpaces(expandState(b)));
                    states[a] = {
                        color:getColor(d, b),
                        vacc:d[j].vaccinations
                    }
                    //recolors the states
                    d3.select(a)
                      .attr('data-vacc', d[j].vaccinations)
                      .transition()
                      .duration(1000)
                      .delay(function (d, i) { return i * 50; })
                      .style("fill", getColor(d, b));

                    j++;


                });
            //calls the actual function that draws the states on the map
            //for some reason this is necessary on update
            uStates.draw("#statesvg", d, tooltipHtml, disChoice);
        });
        //labels the current HIT value over the legend
        var HITshow = document.getElementById('HITshow');
        var HITstr = "Herd Immunity Threshold: " + initializeHIT() + "% (Percentage of the population that must be vaccinated to also prevent the unvaccinated from catching the disease)";
        HITshow.innerHTML = HITstr;
    }

    document.getElementById('play').addEventListener('click', play);
    function play() {
        //gets the current disease choice
        disSelect = document.getElementById('disease');
        disChoice = disSelect.options[disSelect.selectedIndex].text;

        //gets the current year choice
        yearSelect = document.getElementById('year');
        yearChoice = yearSelect.options[yearSelect.selectedIndex].text;

        var i = parseInt(yearChoice);
        var t = i;
        i++;
        for (i; i < 2015; i++) {
            setTimeout(function(k) {
                if (k[0] == 2014) {
                    k[0] = k[1];
                }
                //document.getElementById('year').value = k[0];
                document.getElementById('year').selectedIndex = k[0] - 2008;
                document.getElementById('hiddenYear').innerHTML = k[0];
                document.getElementById('hiddenYear').value = k[0];
                /*document.getElementById('currentYear').innerHTML = k[0];
                document.getElementById('currentYear').value = k[0];*/
                var string = "http://kenalexandthom.com/cs_4460/getVaccinations.php?year="
                + k[0] + "&disease=" + disChoice;
                d3.json(string, function(d) {
                    var j = 0;
                    ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
                    "ID", "IL", "IN", "IA", "KS", "KY", "LS", "ME", "MD", "MA", "MI", "MN",
                    "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
                    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
                    "WI", "WY"]
                        .forEach(function(b) {
                        //assigns the data to each state element in the svg
                        var a = document.getElementById(stripSpaces(expandState(b)));
                        states[a] = {
                            color:getColor(d, b),
                            vacc:d[j].vaccinations
                        }
                        //recolors the states
                        d3.select(a)
                          .attr('data-vacc', d[j].vaccinations)
                          .transition()
                          .duration(1000)
                          .delay(function (d, i) { return i * 50; })
                          .style("fill", getColor(d, b));

                        j++;
                    });
                    //calls the actual function that draws the states on the map
                    //for some reason this is necessary on update
                    uStates.draw("#statesvg", d, tooltipHtml, disChoice);
                });
                var HITshow = document.getElementById('HITshow');
                var HITstr = "Herd Immunity Threshold: " + initializeHIT() + "% (Percentage of the population that must be vaccinated to also prevent the unvaccinated from catching the disease)";
                HITshow.innerHTML = HITstr;
            }, 1000 * (i - t), [i,t])
        }
    }
}
