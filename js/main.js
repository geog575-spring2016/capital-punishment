//bugs/issues to deal with:
//1) x1 is not defined -- related to the retrievelabel. need to rectify this issue.
//2) figure out how to cycle over time automatically
//3) figure out how to create proportional symbols (raw data for # executions per state in each year)
//4) We aren't moving the retrievelabel around so moveLabel is extraneous, but removing it makes the
//dehighlight function break

//wrap it all in an anonymous function
(function(){
var topicArray = ["allExecutions", "Law"];
//array for law
var arrayLaw = [ "Legal","Not","Moratorium", "Formal Hold", "De Facto Moratorium"];
//array for years
var yearArray = ["1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"];
//deleted other arrays for because we are focusing on law/total # of executions
//if time, go back to earlier commits and grab old arrays for race, method, etc.
var currentColors = [];
var currentArray = [];
yearExpressed = yearArray[yearArray.length-1];
//set up initial attribute
var expressed = arrayLaw[0];
// dimensions of the bar graph = a function of window width
var chartWidth = window.innerWidth * 0.35,
    chartHeight = 300,
    leftPadding = 35,
    rightPadding = 5,
    topBottomPadding = 10,
    chartInnerWidth = chartWidth - leftPadding - rightPadding
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //width is a function of window size
    var width = window.innerWidth * 0.6,
        height = 800;

//when window loads, initiate map
window.onload = setMap();
//set up the choropleth
function setMap() {
    // map variable, an svg element with attributes styled in style.css
    var map = d3.select("#mainmap")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
//set the projection for the US, equal area because choropeth
    var projection = d3.geo.albers()
        .scale(1000)
        .translate([width / 2, height / 2]);
        //path to draw the map
    var path = d3.geo.path()
        .projection(projection);
        //load in the data
    d3_queue.queue()
        .defer(d3.csv, "data/Law.csv")
        .defer(d3.json, "data/continentalUS.topojson")
        .await(callback);
        //retrieve and process json file and data
        function callback(allExecutions, Law, continentalUS){
            //Variable to store the USA json with all attribute data
            joinedJson = topojson.feature(continentalUS, continentalUS.objects.states).features;
            colorize = colorScale(joinedJson);

            //Create an Array with CSV's loaded
            var csvArray = [allExecutions, Law];
            //Names for the overall Label we'd like to assign them
            var attributeNames = ["allExecutions", "Law"];
            //For each CSV in the array, run the LinkData function
            for (csv in csvArray){
                joinData(continentalUS, csvArray[csv], attributeNames[csv]);
            };

            function joinData(topojson, csvData, attribute){
                 var jsonStates = continentalUS.objects.states.geometries;

                //loop through the csv and tie it to the topojson
                 for(var i=0; i<csvData.length; i++){
                    var csvState = csvData[i];
                    var csvLink = csvState.NAME;

                    //loop through states and assign  data
                    for(var a=0; a<jsonStates.length; a++){

                        //check if NAME = NAME, which will join
                        if (jsonStates[a].properties.NAME == csvLink){
                            attrObj = {};
                            console.log("hey"); //fails
                            //loop to assign key/value pairs to json object
                            for(var year in yearArray){
                                var attr = yearArray[year];
                                var val = (csvState[attr]);
                                attrObj[attr] = val;
                                console.log("hi"); //fails
                            };


                        jsonStates[a].properties[attribute] = attrObj;
                        };
                    };
                 };
            };

            //Style the states to be styled according to the data
            var states = map.selectAll(".states")
                .data(joinedJson)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "states " + d.properties.NAME;
                })
                .style("fill", function(d){
                    return choropleth(d, colorize);
                })
                .attr("d", function(d) {
                    return path(d);
                })
                .on("mouseover", highlight)
                .on("mouseout", dehighlight);

            var statesColor = states.append("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
                })
            changeAttribute(yearExpressed, colorize);
        }; //END callback
    }; //END setmap


    function colorScale(data){
    // this if/else statement determines which variable is currently being expressed and assigns the appropriate color scheme to currentColors
        if (expressed === "Law") {
            currentColors = colorArrayOverview;
            currentArray = arrayOverview;
        } else if (expressed === "allExecutions") {
            currentColors = colorArrayConsent;
            currentArray = arrayConsent;
        };

        scale = d3.scale.ordinal()
                    .range(currentColors)
                    .domain(currentArray); //sets the range of colors and domain of values based on the currently selected
        return scale(data[yearExpressed]);
    };

//function to set the enumeration units in the map
function setEnumerationUnits(states, map, path, colorScale) {
  console.log("enum");
    //variable USstates, styled in style.css
    var USstates = map.selectAll(".USstates")
        .data(states)
        .enter()
        .append("path")
        .attr("class", function(d) {
            return "USstates " + d.properties.NAME;
        })
        .attr("d", path)
        //fill the USstates with the choropleth colorScale
        .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        })
        //when the mouse goes over an enumeration unit, call highlight function
        .on("mouseover", function(d){
            highlight(d.properties);
        })
        //when the mouse leaves an emumeration unit, call the dehighlight function
        .on("mouseout", function(d){
            dehighlight(d.properties);
        })
        //when the mouse moves over enumeration units, call moveLabel function
        .on("mousemove", moveLabel);

//set up a variable for the dehighlight function -- what the style will return to on mouseout
    var desc = USstates.append("desc")
        .text('{"stroke": "#faf0e6", "stroke-width": "0.5"}');

};

//create a colorbrewer scale for the choropleth
function makeColorScale(data){
    var colorClasses = [
        "#CF3D96",
        "#EDC1DB",
        "#F4E6ED",
        "#BCDDA1",
        "#50B848"
    ];

    //create color scale generator,
    var colorScale = d3.scale.quantile()
        .range(colorClasses);

    //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return (d[expressed]); }),
        d3.max(data, function(d) { return (d[expressed]); })
    ];
    //assign two-value array as scale domain
    colorScale.domain(minmax);

    return colorScale;
};
//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (val && val != NaN){
        return colorScale(val);
    } else {
        return "#CCC";
  };
};


//function to highlight enumeration units and bars on mouseover
function highlight(props){
    //change stroke on mouseover
    var selected = d3.selectAll("." + props.NAME)
        .style({
            "stroke": "white",
            "stroke-width": "4"
        });
    setLabel(props);
};
function dehighlight(props) {
    var selected = d3.selectAll("." + props.NAME)
        .style({
            "stroke": function(){
                return getStyle(this, "stroke")
            },
            "stroke-width": function(){
                return getStyle(this, "stroke-width")
            }
        });
//grab the style in "desc" to restyle the county after mouseout
    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();
//set up variable styleObject to parse as string as JSON
        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
    d3.select(".retrievelabel")
        .remove();
};
function setLabel(props) {
    //label content
    var labelAttribute = "<h1>" + props[expressed] +
        "</h1><b>" + expressed + "</b>";
    //create info label div
    var retrievelabel = d3.select("body")
        .append("div")
        .attr({
            //set up class named retrievelabel to edit style
            "class": "retrievelabel",
            //use the attribute NAME to label the county
            "id": props.NAME
        })
        .html(labelAttribute);

    var stateName = retrievelabel.append("div")
        .attr("class", "labelname")
        .html(props.NAME);
};
//set up function for label placement as mouse moves
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".retrievelabel")
        .width;

    d3.select(".retrievelabel")
};

})(); //last line of main.js
