//bugs/issues to deal with:
//1) x1 is not defined -- related to the retrievelabel. need to rectify this issue.
//2) figure out how to cycle over time automatically
//3) figure out how to create proportional symbols (raw data for # executions per state in each year)
//4) We aren't moving the retrievelabel around so moveLabel is extraneous, but removing it makes the
//dehighlight function break
//wrap it all in an anonymous function
(function(){



//****HERE ARE SOME GLOBAL VARIABLES****//
var topicArray = ["allExecutions",
                  "Law"]; //category
//array for law variable
var arrayLaw = [ "Legal",
                  "Not",
                  "Moratorium",
                  "Formal Hold",
                  "De Facto Moratorium"];
//array for years
var yearArray = ["1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"];
//deleted other arrays for because we are focusing on law/total # of executions
//if time, go back to earlier commits and grab old arrays for race, method, etc.
//choropleth global variables
var currentColors = [];
var currentArray = [];
var infoArray = ["The Legality of Capital Punishment has varied over the past five decades", "Something about the number of executions over the years blah blah"]
var expressed;
var colorize;
var yearExpressedText;
var linkArray = ["<a href = '#law'> We used the Death Penalty Information Center to find this information.</a>"];
//Color array for law data -- just threw in some random colors for now
var colorArrayLaw      = [  "#000",
                            "#CCC",
                            "#FFF",
                            "#TTT",
                            "#NNN"   ];
//the map width is a function of window size
var mapWidth = window.innerWidth * 0.6,
mapHeight = 800;
var menuWidth = 200, menuHeight = 300;
var menuInfoWidth = 250, menuInfoHeight = 100;
var joinedJson;

//when window loads, initiate map
window.onload = initialize();

//start function for website
function initialize(){
  expressed = topicArray[0];
  yearExpressed = yearArray[yearArray.length-1];
    animateMap(yearExpressed, colorize, yearExpressedText);
    setMap();
    createMenu(arrayLaw, colorArrayLaw, "Law: ", infoArray[0], linkArray[0]);
    $(".Law").css({'background-color': '#CCCCCC','color': '#333333'});
    //disables buttons on load
    $('.stepBackward').prop('disabled', true);
    $('.play').prop('disabled', true);
    $('.pause').prop('disabled', true);
    $('.stepForward').prop('disabled', true);
}; //End initialize


//set up the choropleth
function setMap() {

    // map variable, an svg element with attributes styled in style.css
    var map = d3.select("#mainmap")
        .append("svg")
        .attr("class", "map")
        .attr("width", mapWidth)
        .attr("height", mapHeight);
//set the projection for the US, equal area because choropeth
    var projection = d3.geo.albers()
        .scale(1000)
        .translate([mapWidth / 2, mapHeight / 2]);
        //path to draw the map
    var path = d3.geo.path()
        .projection(projection);
        //load in the data
    d3_queue.queue()
    .defer(d3.json, "../data/continentalUS.topojson")
        .defer(d3.csv, "../data/Law.csv")
        .defer(d3.csv,"../data/allExecutions.csv")

        .await(callback);
        //retrieve and process json file and data
        function callback(error, continentalUS, allExecutions, Law){
            //Variable to store the continentalUS json with all attribute data
            joinedJson = topojson.feature(continentalUS, continentalUS.objects.states).features;
            colorize = colorScale(joinedJson);

            //Create an Array with CSV's loaded
            var csvArray = [allExecutions, Law];
            //Names for the overall Label we'd like to assign them
            var attributeNames = ["allExecutions", "Law"];
            //For each CSV in the array, run the joinData function
            for (csv in csvArray){
                joinData(continentalUS, csvArray[csv], attributeNames[csv]);
            };
console.log(continentalUS);
            function joinData(topojson, csvData, attribute){
                 var jsonStates = continentalUS.objects.states.geometries;
                //loop through the csv and tie it to the topojson
console.log(csvData.length);
                 for(var i=0; i<csvData.length; i++){
                   console.log(csvData.length);
                    var csvState = csvData[i];
                    var csvLink = csvState.NAME;
                    //loop through states and assign  data
                    for(var a=0; a<jsonStates.length; a++){
                        //check if NAME = NAME, which will join
                        if (jsonStates[a].properties.NAME == csvLink){
                            attrObj = {};
                            //loop to assign key/value pairs to json object
                            for(var year in yearArray){
                                var attr = yearArray[year];
                                var val = (csvState[attr]);
                                attrObj[attr] = val;
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
            currentColors = colorArrayLaw;
            currentArray = arrayLaw
        } else if (expressed === "allExecutions") {
          //call function to activate proportional symbols
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
//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = props[expressed];
    //if attribute value exists, assign a color; otherwise assign gray
    if (val && val != NaN){
        return colorScale(val);
    } else {
        return "#CCC";
  };
};
//menu items function
function drawMenu(){
    //click changes on Overview
    $(".Law").click(function(){
        expressed = Category[0];
        yearExpressed = yearArray[yearArray.length-1];
        d3.selectAll(".yearExpressedText").remove();
        drawMenuInfo(colorize, yearExpressed);
        $('.stepBackward').prop('disabled', true);
        $('.play').prop('disabled', true);
        $('.pause').prop('disabled', true);
        $('.stepForward').prop('disabled', true);
        d3.selectAll(".menu-options div").style({'background-color': '#e1e1e1','color': '#969696'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayLaw, colorArrayLaw, "Law ", textArray[0], linkArray[0]);
        $(".Overview").css({'background-color': '#CCCCCC','color': '#333333'});
        //removes chart
        var oldChart = d3.selectAll(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
    });
};

//creates the menu items
function createMenu(arrayX, arrayY, title, infotext, infolink){
    var yArray = [40, 85, 130, 175, 220, 265];
    var oldItems = d3.selectAll(".menuBox").remove();
    var oldItems2 = d3.selectAll(".menuInfoBox").remove();

    //creates menuBoxes
    menuBox = d3.select(".menu-inset")
            .append("svg")
            .attr("width", menuWidth)
            .attr("height", menuHeight)
            .attr("class", "menuBox");

    //creates Menu Title
    var menuTitle = menuBox.append("text")
        .attr("x", 10)
        .attr("y", 30)
        .attr("class","title")
        .text(title)
        .style("font-size", '16px');

    //draws and shades boxes for menu
    for (b = 0; b < arrayX.length; b++){
       var menuItems = menuBox.selectAll(".items")
            .data(arrayX)
            .enter()
            .append("rect")
            .attr("class", "items")
            .attr("width", 35)
            .attr("height", 35)
            .attr("x", 15);

        menuItems.data(yArray)
            .attr("y", function(d, i){
                return d;
            });

        menuItems.data(arrayY)
            .attr("fill", function(d, i){
                return arrayY[i];
            });
    };
    //creates menulabels
    var menuLabels = menuBox.selectAll(".menuLabels")
        .data(arrayX)
        .enter()
        .append("text")
        .attr("class", "menuLabels")
        .attr("x", 60)
        .text(function(d, i){
            for (var c = 0; c < arrayX.length; c++){
                return arrayX[i]
            }
        })
        .style({'font-size': '14px', 'font-family': 'Open Sans, sans-serif'});

        menuLabels.data(yArray)
            .attr("y", function(d, i){
                return d + 30;
            });

     //creates menuBoxes
    menuInfoBox = d3.select(".menu-info")
        .append("div")
        .attr("width", menuInfoWidth)
        .attr("height", menuInfoHeight)
        .attr("class", "menuInfoBox textBox")
        .html(infotext + infolink);
}; //end createMenu

//vcr controls click events
function animateMap(yearExpressed, colorize, yearExpressedText){
    //step backward functionality
    $(".stepBackward").click(function(){
        if (yearExpressed <= keyArray[keyArray.length-1] && yearExpressed > keyArray[0]){
            yearExpressed--;
            changeAttribute(yearExpressed, colorize);
        } else {
            yearExpressed = keyArray[keyArray.length-1];
            changeAttribute(yearExpressed, colorize);
        };
    });
    //play functionality
    $(".play").click(function(){
        timer.play();
        $('.play').prop('disabled', true);
    });
    //pause functionality
    $(".pause").click(function(){
        timer.pause();
        $('.play').prop('disabled', false);
        changeAttribute(yearExpressed, colorize);
    });
    //step forward functionality
    $(".stepForward").click(function(){
        if (yearExpressed < keyArray[keyArray.length-1]){
            yearExpressed++;
            changeAttribute(yearExpressed, colorize);
        } else {
            yearExpressed = keyArray[0];
            changeAttribute(yearExpressed, colorize);
        };
    });
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
