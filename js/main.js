//they set up some global variables, we'll probably want to do the same for simplicity's sake (even if it's not optimal)
var mapWidth = 750, mapHeight = 410;
//unsure if we'll include 2016 -- we have some data for it, but obviously it is not complete yet
var keyArray = ["1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"];
var Category = ["totalExecuted", "totalOvertime", "method", "race", "age"];
var expressed;
var yearExpressed;
var yearExpressedText;
var colorize;
var scale;
var currentColors = [];
var menuWidth = 200, menuHeight = 300;
var otherMenuWidth = 200, otherMenuHeight = 70;
var menuInfoWidth = 250, menuInfoHeight = 100;
var textArray = ["Total Executions, 1977-2015", "Trends of execution 1977-2015", "Methods of Execution","Race of those executed", "Average age of execution by year", "aaa", "bbb"]
var linkArray = ["<a href = '#overview'> Here is an overview of capital punishment laws over the years.</a>", "<a href = '#method'> What methods are still used? Why?</a>"];
var joinedJson; //Variable to store the USA json combined with all attribute data

//arrays for categories of each variable
    //race array (data is complete!)
    var arrayRace = [   "Black",       
                        "White",       
                        "Latino",          
                        "Asian",
                        "Native American"];     

    //array for method (data is complete!)
    var arrayMethod = [ "Lethal Injection",     
                        "Electrocution",      
                        "Hanging",      
                        "Firing Squad",
                        "Gas Chamber"];
                //array for law (Gaby is working on the data!, categories may need to be altered)
    var arrayLaw = [ "Legal",     
                    "Illegal",      
                    "Moratorium"]; 

//color array with different color values for the overview
    var colorArrayRace = [];    

    //Different hue color array for method
    var colorArrayMethod = [ ];  

    // Color array for legal/illegal/moratorium (three colors, different hues?)
    var colorArrayLaw = [ ];  


//Variables for colorscale and choropleth
var currentColors = [];
var currentArray = [];

//SET UP VARIABLES FOR TIMELINE
var timelineFeatureArray = [];
var colorizeChart; 
var chartHeight = 300;
var chartWidth = 700;
//are squares the best way to represent this for our data? 
// var squareWidth = 10;
// var squareHeight = 10;
var chartRect;
var margin = {top: 80, right: 20, bottom: 30, left:10};
var rectColor;
var axisHeight = 30;

//Global variable end (do we for sure want to use global variables like this? Is that optimal?)

//when the window loads, let's gooo 
window.onload = initialize();

//start function for website
function initialize(){
    expressed = Category[0];
    yearExpressed = keyArray[keyArray.length];
    animateMap(yearExpressed, colorize, yearExpressedText);
    setMap();
    createMenu(arrayOverview, colorArrayOverview, "Race:", textArray[0], linkArray[0]);
    createInset();
    $(".Race").css({'background-color': '#CCCCCC','color': '#ffffff'});
    //this disables buttons on load -- do we want to do this too?
    $('.stepBackward').prop('disabled', true);
    $('.play').prop('disabled', true);
    $('.pause').prop('disabled', true);
    $('.stepForward').prop('disabled', true);
}; //end initialize

//creates map
function setMap(){
    var map = d3.select(".map")
        .append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .attr("class", "us-map");
    
    //Create a Albers equal area conic projection because choropleth -- that's what we want too :D
    var projection = d3.geo.albersUsa()
        .scale(1100)
        .translate([mapWidth / 2, mapHeight / 2]);
    
    //create svg path generator using the projection
    var path = d3.geo.path()
        .projection(projection);
    
    queue()
    //we have... so many CSVs. omg.
        .defer(d3.csv, "/data/Races/Black.csv") //black executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Races/White.csv") //white executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Races/Asian.csv") //asian executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Races/NativeAmerican.csv") //native american executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Races/Latino.csv") //latino executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Methods/Electrocution.csv") ////electrocution executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Methods/FiringSquad.csv") ////firing squad executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Methods/GasChamber.csv") //gas chamber executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Methods/Hanging.csv") //hanging executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Methods/LethalInjection.csv") //lethal injection executions over time 1977-2016 (DONE)
        .defer(d3.csv, "/data/Laws/Laws.csv") ////law changes about executions over time 1977-2016 (Gaby working on this)
        .defer(d3.csv, "/data/TotalExecutions/TotalOverTime.csv") //total executions over time 1977-2016 (Gaby working on this)
        .defer(d3.csv, "/data/TotalExecutions/Total2015.csv") //total executions 2015 (Not done/assigned, do we want this as default map?)
        .defer(d3.json, "/data/continentalUS.topojson") //generalized topo of the continental US
        .await(callback);
    //create menu 
    drawMenu();
        
    //handy dandy callback function
    function callback(error, overall, overtime, race, method){

        //Variable to store the USA json with all attribute data
        joinedJson = topojson.feature(continentalUS, continentalUS.objects.states).features;
        colorize = colorScale(joinedJson);

        //Create an array with CSVs loaded... update these later when we're sure what we want included
        var csvArray = [overall, overtime, race, method];
        //Names for the overall label we'd like to assign them.. again, edit later when we know what we want
        var attributeNames = ["overall", "overtime", "race", "method"];
        //For each CSV in the array, run the LinkData function
        for (csv in csvArray){
            LinkData(continentalUS, csvArray[csv], attributeNames[csv]);
        };

        function LinkData(topojson, csvData, attribute){
             var jsonStates = continentalUS.objects.states.geometries;

            //loop through the csv and tie it to the json's via the State Abbreviation
             for(var i=0; i<csvData.length; i++){
                var csvState = csvData[i];
                var csvLink = csvState.state;

                //loop through states and assign the data to the rigth state
                for(var a=0; a<jsonStates.length; a++){

                    //check if postal code = link
                    if (jsonStates[a].properties.state == csvLink){
                        attrObj = {};

                        //one more loop to assign key/value pairs to json object
                        for(var key in keyArray){
                            var attr = keyArray[key];
                            var val = (csvState[attr]);
                            attrObj[attr] = val;
                        };

                    jsonStates[a].properties[attribute] = attrObj;
                    break;
                    };
                };
             }; 
        }; //END linkData

        //Style the states to be styled according to the data
        var states = map.selectAll(".states")
            .data(joinedJson)
            .enter()
            .append("path")
            .attr("class", function(d){ 
                return "states " + d.properties.postal; //we don't want postal here -- figure out what we do want
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

        //here is where they did some overlay stuff -- this might be how we do the prop symbols?
        var cpcCount = [];
        for (var a = 0; a < cpc.features.length; a++){
            var cpc_count = cpc.features[a].properties.Count;
            cpcCount.push(Number(cpc_count));
        }
        

        //this part creates the radius -- let's keep this in mind cuz we'll be doing lots of them
        var cpcRadius = d3.scale.sqrt()
            .domain([cpcMin, cpcMax])
            .range([2, 20]);

        changeAttribute(yearExpressed, colorize);
        overlay(path, map, otherthings, someotherthings);
    }; //END callback
}; //END setmap

//menu items function
function drawMenu(){
    //click changes on Overview
    $(".Overview").click(function(){ 
        expressed = Category[0];
        yearExpressed = keyArray[keyArray.length-1];
        d3.selectAll(".yearExpressedText").remove();
        drawMenuInfo(colorize, yearExpressed);
        $('.stepBackward').prop('disabled', true);
        $('.play').prop('disabled', true);
        $('.pause').prop('disabled', true);
        $('.stepForward').prop('disabled', true);
        d3.selectAll(".menu-options div").style({'background-color': '#CCCCCCC','color': '#CCCCCC'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayOverview, colorArrayOverview, "Grading Scale: ", textArray[0], linkArray[0]);
        $(".Overview").css({'background-color': '#CCCCCC','color': '#CCCCCC'});
        //removes chart
        var oldChart = d3.selectAll(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
    });
    
    //a click to change the choropleth displayed with info about the buttons. We'll need something like this too.
     $(".Prohibited").click(function(){ 
        expressed = Category[1];
        $('.stepBackward').prop('disabled', false);
        $('.play').prop('disabled', false);
        $('.pause').prop('disabled', false);
        $('.stepForward').prop('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#CCCCCC','color': '#CCCCCC'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayProhibited, colorArrayProhibited, "blah blah ", textArray[1], linkArray[1]);
        $(".Prohibited").css({'background-color': '#CCCCCC','color': '#333333'});
        //removes and creates correct chart
        var oldChart = d3.select(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
        setChart(yearExpressed);
     });
    
    //another one for counseling, same as above but a different category. We'll need to build something like this too.
    $(".Counseling").click(function(){  
        expressed = Category[2];
        $('.stepBackward').prop('disabled', false);
        $('.play').prop('disabled', false);
        $('.pause').prop('disabled', false);
        $('.stepForward').prop('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#e1e1e1','color': '#969696'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayCounseling, colorArrayCounseling, "Mandated Counseling: ", textArray[2], linkArray[2]);
        $(".Counseling").css({'background-color': '#CCCCCC','color': '#333333'});
        //removes and creates correct chart
        var oldChart = d3.select(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
        setChart(yearExpressed);
        });
    
    //aaaand again. Not sure how many of these we need.
    $(".Waiting").click(function(){ 
        expressed = Category[3];
        $('.stepBackward').prop('disabled', false);
        $('.play').prop('disabled', false);
        $('.pause').prop('disabled', false);
        $('.stepForward').prop('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#CCCCCC','color': '#CCCCCC'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayWaitingPeriod, colorArrayOverview, "Waiting Period: ", textArray[3], linkArray[3]);
        $(".Waiting").css({'background-color': '#CCCCCC','color': '#333333'});
        //removes and creates correct chart
        var oldChart = d3.select(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
        setChart(yearExpressed);
        });
    
}; //END drawMenu

//this creates the dropdowm men
function drawMenuInfo(colorize, yearExpressed){
    //creates year for map menu
    yearExpressedText = d3.select(".menu-info")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "yearExpressedText menu-info")
        .text(yearExpressed)
        .style({'font-size':'36px', 'font-weight': 'strong'}); 
}; //End DrawMenuInfo

//vcr controls click events
function animateMap(yearExpressed, colorize, yearExpressedText){
    //step backward functionality -- do we want to use jQuery for this like they did?
    $(".stepBackward").click(function(){
        if (yearExpressed <= keyArray[keyArray.length-1] && yearExpressed > keyArray[0]){
            yearExpressed--;
            changeAttribute(yearExpressed, colorize);
        } else {
            yearExpressed = keyArray[keyArray.length-1];
            changeAttribute(yearExpressed, colorize);
        }; 
    });
    //here is the play function for the timer -- we'll need something like this as well. how to implement for both prop symbols and choropleth at the same time?
    $(".play").click(function(){
        timer.play();
        $('.play').prop('disabled', true);
    });
    //same as above, but for pausing. we definitely want this.
    $(".pause").click(function(){
        timer.pause();
        $('.play').prop('disabled', false);
        changeAttribute(yearExpressed, colorize);
    });
    //same as above, but forward.
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

//does this sequence the map over time?
function timeMapSequence(yearsExpressed) {
    changeAttribute(yearExpressed, colorize);
    if (yearsExpressed < keyArray[keyArray.length-1]){
        yearExpressed++; 
    };
}; //end timeMapSequence

//this changes year displayed on map, we definitely want to do this as well
function changeAttribute(year, colorize){
    var removeOldYear = d3.selectAll(".yearExpressedText").remove();
    
    for (x = 0; x < keyArray.length; x++){
        if (year == keyArray[x]) {
             yearExpressed = keyArray[x];
        }
    }
    //colorizes state
    d3.selectAll(".states")
        .style("fill", function(year){
            return choropleth(year, colorize);
        })
        .select("desc")
            .text(function(d) {
                return choropleth(d, colorize);
        });
     //alters timeline year text -- this is a nice visualization we might want to employ   
    var timelineYear = d3.select(".timeline")
        .selectAll('g')
        .attr("font-weight", function(d){
            if (year == d.getFullYear()){
                return "bold";
            } else {
                return "normal";
            }
        }).attr("font-size", function(d){
            if (year == d.getFullYear()){
                return "18px";
            } else {
                return "12px";
            }
        }).attr("stroke", function(d){
            if (year == d.getFullYear()){
                return "#ffffff";
            } else {
                return "gray";
            }
         });
    drawMenuInfo(colorize, year);
}; //END changeAttribute


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


//SET UP COLOR ARRAYS
function colorScale(data){
// this if/else statement determines which variable is currently being expressed and assigns the appropriate color scheme to currentColors
    if (expressed === "overallData") {   
        currentColors = colorArrayOverview;
        currentArray = arrayOverview;
    } else if (expressed === "overtimeData") {
        currentColors = colorArrayConsent;
        currentArray = arrayConsent;
    } else if (expressed === "raceData") {
        currentColors = colorArrayProhibited;
        currentArray = arrayProhibited;
    } else if (expressed === "methodData") {
        currentColors = colorArrayCounseling;
        currentArray = arrayCounseling;
    };

    scale = d3.scale.ordinal()
                .range(currentColors)
                .domain(currentArray); //sets the range of colors and domain of values based on the currently selected 
    return scale(data[yearExpressed]);
};
//Sets up color scale for chart
function colorScaleChart(data) {
    if (expressed === "laws") {   
        currentColors = colorArrayOverview;
        currentArray = arrayOverview;
    } else if (expressed === "totalExecuted") {
        currentColors = colorArrayConsent;
        currentArray = arrayConsent;
    } else if (expressed === "totalovertime") {
        currentColors = colorArrayProhibited;
        currentArray = arrayProhibited;
    } else if (expressed === "method") {
        currentColors = colorArrayCounseling;
        currentArray = arrayCounseling;
    } else if (expressed === "race") {
         currentColors = colorArrayOverview;
         currentArray = arrayWaitingPeriod;
    } else if (expressed === "age") {
        currentColors = colorArrayUltrasound;
        currentArray = arrayUltrasound;
    };

    scale = d3.scale.ordinal()
                .range(currentColors)
                .domain(currentArray); 

    return scale(data);
}; //end Colorscale

function choropleth(d, colorize){
    var data = d.properties ? d.properties[expressed] : d;
    return colorScale(data);
};

function choroplethChart(d, colorize) {
    return colorScaleChart(d);
};

//chart functions

// setChart function sets up the timeline chart and calls the updateChart function
function setChart(yearExpressed) {
    // reset the timelineFeatureArray each time setChart is called
    timelineFeatureArray = []; //this will hold the new feature objects that will include a value for which year a law changed
    // colorize is different for the chart since some states have more than one law
    colorizeChart = colorScaleChart(timelineFeatureArray);

    //initial setup of chart
    var chart = d3.select(".graph")
        .append("svg")
        .attr("width", chartWidth+"px")
        .attr("height", chartHeight+"px")
        .attr("class", "chart");
        
    //put all rects in a g element
    var squareContainer = chart.append("g")
        .attr("transform", "translate(" + margin.left + ', ' + margin.top + ')');

    //for-loop creates an array of feature objects that stores three values: thisYear (for the year that a law was implemented), newLaw (the categorization of the new policy) and a feature object (the state that the law changed in)
    for (var feature in joinedJson) {
        var featureObject = joinedJson[feature];
        for (var thisYear = 1; thisYear<=keyArray.length-1; thisYear++){
            var lastYear = thisYear - 1;
            if (featureObject.properties[expressed][keyArray[thisYear]] != featureObject.properties[expressed][keyArray[lastYear]]) { //have to account for the value not being undefined since the grade data is part of the linked data, and that's not relevant for the timeline
                timelineFeatureArray.push({yearChanged: Number(keyArray[thisYear]), newLaw: featureObject.properties[expressed][keyArray[thisYear]], feature: featureObject}); //each time a law is passed in a given year, a new feature object is pushed to the timelineFeatureArray
            };
        };
    };
    var yearObjectArray = []; //will hold a count for how many features should be drawn for each year, the following for-loop does that

    //for-loop determines how many rects will be drawn for each year
    for (key in keyArray) {
        var yearCount = 1;
        for (i = 0; i < timelineFeatureArray.length; i++) {
            //loop through here to see which year it matches and up
            if (timelineFeatureArray[i].yearChanged == keyArray[key]) {
                //countYears++;
                yearObjectArray.push({"year": Number(keyArray[key]), "count":yearCount});
                yearCount = yearCount++;
            };
        };   
    };

    //attach data to the rects and start drawing them
    chartRect = squareContainer.selectAll(".chartRect")
        .data(timelineFeatureArray) //use data from the timelineFeatureArray, which holds all of the states that had some change in law 
        .enter()
        .append("rect") //create a rectangle for each state
        .attr("class", function(d) {
            return "chartRect " + d.feature.properties.postal;
        })
        .attr("width", squareWidth+"px")
        .attr("height", squareHeight+"px");
    
    //determine the x-scale for the rects, determing where along the x-axis they will be drawn according to which year the law changed
    var x = d3.scale.linear()
        .domain([keyArray[0], keyArray[keyArray.length-1]]) //domain is an array of 2 values: the first and last years in the keyArray (1973 and 2014)
        .rangeRound([0, chartWidth - margin.left - margin.right]); //range determines the x value of the square; it is an array of 2 values: the furthest left x value and the furthest right x value (on the screen)

    //set a time scale for drawing the axis; use a separate time scale rather than a linear scale for formatting purposes.
    var timeScale = d3.time.scale()
        .domain([new Date(keyArray[1]), d3.time.year.offset(new Date(keyArray[keyArray.length-1]), 1)]) //domain is an array of 2 values: the first and last years in the keyArray (1973 and 2014)
        .rangeRound([0, chartWidth - margin.left - margin.right]); //range determines the x value of the square; it is an array of 2 values: the furthest left x value and the furthest right x value (on the screen)

    //place the rects on the chart
    var rectStyle = chartRect.attr("transform", function(d) {
            return "translate(" + x(d.yearChanged) + ")"; //this moves the rect along the x axis according to the scale, depending on the corresponding year that the law changed
        })
        //y-value determined by how many rects are being drawn for each year
        .attr("y", function(d,i) {
            var yValue = 0;
            for (i = 0; i < yearObjectArray.length; i++) {
                if (yearObjectArray[i].year == d.yearChanged) {
                    yValue = yearObjectArray[i].count*(squareHeight+1);
                    yearObjectArray[i].count-=1;
                };
            };
            return yValue;
        })
        .style("fill", function(d) {
            return choroplethChart(d.newLaw, colorize); //apply the color according to what the new law is in that year
        })
        .on("mouseover", highlightChart)
        .on("mouseout", dehighlight);

    //save text description of the color applied to each rect to be able to use this for dehighlight
    rectColor = rectStyle.append("desc")
            .text(function(d) {
                return choroplethChart(d.newLaw, colorize);
            })
            .attr("class", "rectColor");

    //Creates the axis function
    var axis = d3.svg.axis()
        .scale(timeScale)
        .orient("bottom")
        .ticks(d3.time.years, 1)
        .tickFormat(d3.time.format('%y'))
        .tickPadding(5) //distance between axis line and labels
        .innerTickSize(50);

    //sets the thickness of the line between the ticks and the corresponding squares in the chart
    var timelineLine = axis.tickSize(1);

    //sets the margins for the timeline transform
    var timelineMargin = {top: 50, right: 20, bottom: 30, left:40};

    //draw the timeline as a g element on the chart
    var timeline = chart.append("g")
        .attr("height", chartHeight)
        .attr("width", chartWidth)
        .attr('transform', 'translate(' + timelineMargin.left + ',' + (chartHeight - timelineMargin.top - timelineMargin.bottom) + ')') //set the starting x,y coordinates for where the axis will be drawn
        .attr("class", "timeline")
        .call(axis); //calls the axis function on the timeline
    
    //adds mouse events
    timeline.selectAll('g') 
        .each(function(d){
            d3.select(this)
             .on("mouseover", function(){
                 d3.select(this)
                    .attr("font-weight", "bold")
                    .attr("cursor", "pointer")
                    .attr("font-size", "18px")
                    .attr("stroke", "#986cb3");
            })
            .on("mouseout", function(){
                    d3.select(this)
                        .attr("font-weight", "normal")
                        .attr("font-size", "12px")
                        .attr("stroke", "gray")
                        .attr("cursor", "pointer");
            })
            .on("click", function(){
                 d3.select(this)
                    .attr("font-weight", "bold")
                    .attr("cursor", "pointer")
                    .attr("font-size", "18px")
                    .attr("stroke", "#986cb3");
                var year = d.getFullYear();
                changeAttribute(year, colorize);
                animateMap(year, colorize, yearExpressedText);
            });
        });
};



/// highlight and label functions

function highlight(data) {
    //holds the currently highlighted feature
    var feature = data.properties ? data.properties : data.feature.properties;
    d3.selectAll("."+feature.postal)
        .style("fill", "#8856A7");

    //set the state name as the label title
    var labelName = feature.name;
    var labelAttribute;

    //set up the text for the dynamic labels for the map
    //labels should match the yearExpressed and the state of the law during that year
    if (expressed == "overallData") {
        labelAttribute = "Report Card: "+feature[expressed][Number(yearExpressed)];
    } else if (expressed == "prohibitedAfter") {
        labelAttribute = yearExpressed+"<br>Prohibited at "+feature[expressed][Number(yearExpressed)];
    } else if (expressed == "counseling") {
        if (feature[expressed][Number(yearExpressed)] == "Yes") {
            labelAttribute = yearExpressed+"<br>"+"Pre-abortion counseling mandated by law";
        } else if (feature[expressed][Number(yearExpressed)] == "No") {
            labelAttribute = yearExpressed+"<br>"+"No mandated counseling";
        };
    } else if (expressed == "waitingPeriod") {
        if (feature[expressed][Number(yearExpressed)] == "None") {
            labelAttribute = yearExpressed+"<br>No mandated waiting period";
        } else {
            labelAttribute = yearExpressed+"<br>Mandated waiting period: "+feature[expressed][Number(yearExpressed)];
        };
    } else if (expressed == "consentData") {
        if (feature[expressed][Number(yearExpressed)] == "none") {
            labelAttribute = yearExpressed+"<br>No law requiring parental consent for minors";
        } else if (feature[expressed][Number(yearExpressed)] == "notice") {
            labelAttribute = yearExpressed+"<br>Minor must notify parents about an abortion";
        } else if (feature[expressed][Number(yearExpressed)] == "consent") {
            labelAttribute = yearExpressed+"<br>Minor's parents must give consent before abortion can be performed";
        };
    } else if (expressed == "ultrasound") {
        if (feature[expressed][Number(yearExpressed)] == "none") {
        labelAttribute = yearExpressed+"<br>No mandatory ultrasound law";
        } else {
            labelAttribute = yearExpressed+"<br>"+feature[expressed][Number(yearExpressed)];
        }
    }

    var infoLabel = d3.select(".map")
        .append("div")
        .attr("class", "infoLabel")
        .attr("id",feature.postal+"label")
        .attr("padding-left", 500+"px");

    var labelTitle = d3.select(".infoLabel")
        .html(labelName)
        .attr("class", "labelTitle");

    var labelAttribute = d3.select(".labelTitle")
        .append("div")
        .html(labelAttribute)
        .attr("class", "labelAttribute")
};

//Function for highlighting the chart and
function highlightChart(data) {
    //holds the currently highlighted feature
    var feature = data.properties ? data.properties : data.feature.properties;
    d3.selectAll("."+feature.postal)
        .style("fill", "red");

    //set the state name as the label title
    var labelName = feature.name;
    var labelAttribute;

    var infoLabel = d3.select(".map")
        .append("div")
        .attr("class", "infoLabel")
        .attr("id",feature.postal+"label")
        .attr("padding-left", 500+"px");

    var labelTitle = d3.select(".infoLabel")
        .html(labelName)
        .attr("class", "labelTitle");

    var labelAttribute = d3.select(".labelTitle")
        .append("div")
        .html(labelAttribute)
        .attr("class", "labelAttribute")
};

//Dehighlight function for map & chart
function dehighlight(data) {
    var feature = data.properties ? data.properties : data.feature.properties;

    var deselect = d3.selectAll("#"+feature.postal+"label").remove();

    //dehighlighting state
    var selection = d3.selectAll("."+feature.postal)
        .filter(".states");    
    var fillColor = selection.select("desc").text();
    selection.style("fill", fillColor);

    //dehighlighting chart
    var chartSelection = d3.selectAll("."+feature.postal)
        .filter(".chartRect");
    var chartFillColor = chartSelection.select("desc").text();
    chartSelection.style("fill", chartFillColor);

};
