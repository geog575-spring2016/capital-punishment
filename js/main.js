//bugs/issues to deal with:
//1) determine how to label states separately (because now we're using the unique field = no spaces)
//2) how to cycle over time automatically
//3) how to create proportional symbols (raw data for # executions per state in each year) = KAI
//4) choropleth for laws... still gotta figure that out = NATALEE & GABY


//****GLOBAL VARIABLES****//
var topicArray = ["Law",
                  "allExecutions"]; //the first item in this array will be the default
//array for law variable
var arrayLaw = [ "Legal",
                  "Illegal",
                  "Moratorium",
                  "Formal Hold",
                  "De Facto Moratorium",
                  "De Facto Momento"];
//array for years
var yearArray = ["1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015"];

//choropleth global variables
var currentColors = [];
var currentArray = [];
var infoArray = ["The Legality of Capital Punishment has varied over the past five decades", "Something about the number of executions over the years blah blah"]
var expressed;
var scale;
var colorize;
var yearExpressed;
var yearExpressedText;
var linkArray = ["<a href = '#Legal'> We used the Death Penalty Information Center to find this information.</a>"];
//Color array for law data -- just threw in some random colors for now
var colorArrayLaw      = [  "red",
                            "orange",
                            "yellow",
                            "green",
                            "blue",
                          "pink" ];
//the map width is a function of window size
var mapWidth = window.innerWidth * 0.7,
mapHeight = 600;
var menuWidth = 200, menuHeight = 300;
var menuInfoWidth = 250, menuInfoHeight = 100;
var joinedJson;

//when window loads, initiate map
window.onload = initialize();

//jquery function changes active state of navbar
$(function(){
    $('.nav li a').on('click', function(e){
        var $thisLi = $(this).parent('li');
        var $ul = $thisLi.parent('ul');

        if (!$thisLi.hasClass('active')){
            $ul.find('li.active').removeClass('active');
                $thisLi.addClass('active');
        }
    })
});//end navbar function
//start function for website
function initialize(){
  expressed = topicArray[0];
  yearExpressed = yearArray[yearArray.length-1];
  //call function to animate the map to iterate over the years
  //  animateMap(yearExpressed, colorize, yearExpressedText);
    //call setmap to set up the map
    setMap();
    //function to create the menu, including a blurb about the section and link to source
}; // initialize OUT *mic drop*


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
        .scale(1300)
        .translate([mapWidth / 2, mapHeight / 2]);
        //path to draw the map
    var path = d3.geo.path()
        .projection(projection);
        //load in the data
    d3_queue.queue()
    //the order of these matter! this is brand new information to me... :)
        .defer(d3.csv, "../data/Law.csv")
        .defer(d3.csv,"../data/allExecutions.csv")
        .defer(d3.json, "../data/continentalUS.topojson")
        .await(callback);
        //call the function to create the menu, law choropleth as default on load
        drawMenu();
        //retrieve and process json file and data, same order as the queue function to load data
        function callback(error, Law, allExecutions, continentalUS){
            //variable to store the continentalUS json with all attribute data
            joinedJson = topojson.feature(continentalUS, continentalUS.objects.states).features;
            //colorize is colorscale function called for the joined data
            colorize = colorScale(joinedJson);
            //array for the csvs
            var csvArray = [Law, allExecutions];
            //names for the overall Label we'd like to assign them
            var attributeNames = ["Law", "allExecutions"];

            for (csv in csvArray){
              //csvArray[csv] = actual attribute information
              //attributeNames[csv] = just the names stored
              //for the csvs in the arrays, run the join data function:
              joinData(continentalUS, csvArray[csv], attributeNames[csv]);
            };
            function joinData(topojson, csvData, attribute){
              //a variable that stores all the states
                 var jsonStates = continentalUS.objects.states.geometries;
                 for(var i=0; i<csvData.length; i++){
                    var csvState = csvData[i];
                    //the way we're linking the csv data is using abrev
                    var csvLink = csvState.abrev;
                    //console.log(jsonStates[a]); //fails
                    //for each state in jsonStates, loop through and link it to the csv data
                    for(var a=0; a<jsonStates.length; a++){
                        //check if abrev = abrev, it will join
                      //  console.log(jsonStates);
                        //console.log(jsonStates[a]);
                        //right now, the line below is failing

                        if (jsonStates[a].properties.abrev == csvLink){
                          //if this evaluates to true, join is working:
                          //console.log(jsonStates[a].properties.abrev == csvLink);
                            //attrObj holds all the attributes. so... many... informations
                            attrObj = {};
                            //loop to assign key/value pairs to json object
                            for(var year in yearArray){
                              //console.log(yearArray);
                            //attr variable holds all years as separate objects
                                var attr = yearArray[year];
                                //val variable holds all the values for law and allExecutions
                                var val = (csvState[attr]);
                                //setting this equal to val
                                attrObj[attr] = val;

                            };
                        jsonStates[a].properties[attribute] = attrObj;
                         break;
                        };
                    };
                 };
            };
            //style states according to the data
            var states = map.selectAll(".states")
                .data(joinedJson)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "states " + d.properties.abrev;
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
                //the code does make it to this point:
                //console.log("made it here");
                //right now, commenting this out doesn't matter. why?
            changeAttribute(yearExpressed, colorize);
        }; //callback end
    }; //setmap end

    //for our menu, which will include law, overlay of total executions
    function drawMenu(){
        //click changes on law
        $(".Legal").click(function(){
            expressed = Category[0];
            yearExpressed = yearArray[yearArray.length-1];
            d3.selectAll(".yearExpressedText").remove();
            drawMenuInfo(colorize, yearExpressed);
            $('.stepBackward').prop('disabled', true);
            $('.play').prop('disabled', true);
            $('.pause').prop('disabled', true);
            $('.stepForward').prop('disabled', true);
            d3.selectAll(".menu-options div").style({'background-color': 'orange','color': 'green'});
            d3.selectAll(".states").style("fill", function(d){
                    return choropleth(d, colorize);
                })
                .select("desc")
                    .text(function(d) {
                        return choropleth(d, colorize);
                });
            createMenu(arrayLaw, colorArrayLaw, "Law ", textArray[0], linkArray[0]);
            $(".Legal").css({'background-color': '#CCCCCC','color': '#333333'});
            //removes chart
            var oldChart = d3.selectAll(".chart").remove();
            var oldRects = d3.selectAll(".chartRect").remove();
        });
    };

    function colorScale(data){
      //throwing this in here just to focus excusively on law:
      expressed = "Law";
      //console.log("made it to colorscale");
    // this if/else statement determines which variable is currently being expressed and assigns the appropriate color scheme to currentColors
        if (expressed === "Law") {
          //console.log("expressed = law");
            currentColors = colorArrayLaw;
            currentArray = arrayLaw;
            //console.log(currentArray);
            //console.log(arrayLaw);
           //console.log(colorArrayLaw);
        } else if (expressed === "allExecutions") {
        //  console.log("expressed = all exec");
        //here is where we call the function for the prop symbols??
        };
      //console.log(data);
        //console.log(yearExpressed);
        //ordinal scale = discrete, like names or categories (use for law variable)
        scale = d3.scale.ordinal()
                    .range(currentColors)
                    .domain(currentArray);

        return scale(data);
};

// //function to set the enumeration units in the map
// function setEnumerationUnits(states, map, path, colorScale) {
//   //console.log("enum");
//     //variable USstates, styled in style.css
//     var USstates = map.selectAll(".USstates")
//         .data(states)
//         .enter()
//         .append("path")
//         .attr("class", function(d) {
//             return "USstates " + d.properties.abrev;
//         })
//         .attr("d", path)
//         //fill the USstates with the choropleth colorScale
//         .style("fill", function(d){
//             return choropleth(d.properties, colorScale);
//         })
//         //when the mouse goes over an enumeration unit, call highlight function
//         .on("mouseover", function(d){
//             highlight(d.properties);
//         })
//         //when the mouse leaves an emumeration unit, call the dehighlight function
//         .on("mouseout", function(d){
//             dehighlight(d.properties);
//         })
//         //when the mouse moves over enumeration units, call moveLabel function
//         .on("mousemove", moveLabel);
//
// //set up a variable for the dehighlight function -- what the style will return to on mouseout
//     var desc = USstates.append("desc")
//         .text('{"stroke": "#faf0e6", "stroke-width": "0.5"}');
// };


//creates dropdown menu
function drawMenuInfo(colorize, yearExpressed){
    //creates year for map menu
    yearExpressedText = d3.select(".menu-info")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "yearExpressedText menu-info")
        .text(yearExpressed)
        .style({'font-size':'36px', 'font-weight': 'strong'});
}; //done with drawMenuInfo

// //creates the menu items
// function createMenu(arrayX, arrayY, title, infotext, infolink){
//     var yArray = [40, 85, 130, 175, 220, 265];
//     var oldItems = d3.selectAll(".menuBox").remove();
//     var oldItems2 = d3.selectAll(".menuInfoBox").remove();
//
//     //creates menu boxes
//     menuBox = d3.select(".menu-inset")
//             .append("svg")
//             .attr("width", menuWidth)
//             .attr("height", menuHeight)
//             .attr("class", "menuBox");
//
//     //creates Menu Title
//     var menuTitle = menuBox.append("text")
//         .attr("x", 10)
//         .attr("y", 30)
//         .attr("class","title")
//         .text(title)
//         .style("font-size", '16px');
//
//     //draws and shades boxes for menu
//     for (b = 0; b < arrayX.length; b++){
//        var menuItems = menuBox.selectAll(".items")
//             .data(arrayX)
//             .enter()
//             .append("rect")
//             .attr("class", "items")
//             .attr("width", 35)
//             .attr("height", 35)
//             .attr("x", 15);
//
//         menuItems.data(yArray)
//             .attr("y", function(d, i){
//                 return d;
//             });
//
//         menuItems.data(arrayY)
//             .attr("fill", function(d, i){
//                 return arrayY[i];
//             });
//     };
//     //creates menulabels
//     var menuLabels = menuBox.selectAll(".menuLabels")
//         .data(arrayX)
//         .enter()
//         .append("text")
//         .attr("class", "menuLabels")
//         .attr("x", 60)
//         .text(function(d, i){
//             for (var c = 0; c < arrayX.length; c++){
//                 return arrayX[i]
//             }
//         })
//         .style({'font-size': '14px', 'font-family': 'Open Sans, sans-serif'});
//
//         menuLabels.data(yArray)
//             .attr("y", function(d, i){
//                 return d + 30;
//             });
//
//      //creates menuBoxes
//     menuInfoBox = d3.select(".menu-info")
//         .append("div")
//         .attr("width", menuInfoWidth)
//         .attr("height", menuInfoHeight)
//         .attr("class", "menuInfoBox textBox")
//         .html(infotext + infolink);
// }; //end createMenu
//
// //vcr controls click events
// function animateMap(yearExpressed, colorize, yearExpressedText){
//     //step backward functionality
//     $(".stepBackward").click(function(){
//         if (yearExpressed <= yearArray[yearArray.length-1] && yearExpressed > yearArray[0]){
//             yearExpressed--;
//             changeAttribute(yearExpressed, colorize);
//         } else {
//             yearExpressed = yearArray[yearArray.length-1];
//             changeAttribute(yearExpressed, colorize);
//         };
//     });
//     //play functionality
//     $(".play").click(function(){
//         timer.play();
//         $('.play').prop('disabled', true);
//     });
//     //pause functionality
//     $(".pause").click(function(){
//         timer.pause();
//         $('.play').prop('disabled', false);
//         changeAttribute(yearExpressed, colorize);
//     });
//     //step forward functionality
//     $(".stepForward").click(function(){
//         if (yearExpressed < yearArray[yearArray.length-1]){
//             yearExpressed++;
//             changeAttribute(yearExpressed, colorize);
//         } else {
//             yearExpressed = yearArray[0];
//             changeAttribute(yearExpressed, colorize);
//         };
//     });
// };



//changes year displayed on map
function changeAttribute(year, colorize){
  console.log("made it to changeAttribute");
  //this stuff removes the old year info
    for (y = 0; y < yearArray.length; y++){
        if (year == yearArray[y]) {
          //y represents the year
             yearExpressed = yearArray[y];
            // console.log(yearExpressed = yearArray[y]);
        }
    }
    //colorizes the states
console.log("made it to d3.selectAll states")
    d3.selectAll(".states")
        .style("fill", function(year){
        //console.log("makes it to styling states");
            return choropleth(year, colorize);
        })
        .select("desc")
            .text(function(d) {
                return choropleth(d, colorize);
        });
     //timeline year text stuff: not important yet
    // var timelineYear = d3.select(".timeline")
    //     .selectAll('g')
    //     .attr("font-weight", function(d){
    //         if (year == d.getFullYear()){
    //             return "bold";
    //         } else {
    //             return "normal";
    //         }
    //     }).attr("font-size", function(d){
    //         if (year == d.getFullYear()){
    //             return "18px";
    //         } else {
    //             return "12px";
    //         }
    //     }).attr("stroke", function(d){
    //         if (year == d.getFullYear()){
    //             return "orange";
    //         } else {
    //             return "blue";
    //         }
    //      });
    // drawMenuInfo(colorize, year);
  //  console.log(timelineYear);
}; //end of changeAttribute

function choropleth(d, year, colorize){
//  console.log("in choropleth function");
//conditional statement, setting data equal to
console.log("made it to choropleth");
var data = d.properties ? d.properties[expressed] : d;
//console.log(data = d);
//console.log(data = d.properties[expressed]);
//console.log(d.properties = d.properties[expressed])
//console.log(d.properties[expressed]);
//console.log(d);
//console.log(data);
//console.log(d.properties[expressed]);
//console.log(colorScale(data));
//console.log(data[yearExpressed]);
return colorScale(data);
};


function highlight(data) {
    //this is a conditional statement, holds the currently highlighted feature
    var feature = data.properties ? data.properties : data.feature.properties;
    d3.selectAll("."+feature.abrev)
        .style("fill", "#800000");

    //set the state name as the label title
    var labelName = feature.abrev;
    var labelAttribute;
    console.log("made it to highlight function");
    //set up the text for the dynamic labels for the map
    //labels should match the yearExpressed and the state of the law during that year
    if (expressed == "Law") {
      console.log("highlight function law expressed");
        labelAttribute = "Legal Status: "+feature[expressed][Number(yearExpressed)];
    } else if (expressed == "allExecutions") {
      console.log("highlight function exec expressed")
        labelAttribute = yearExpressed+"Number of executions: "+feature[expressed][Number(yearExpressed)];
    }
    var retrievelabel = d3.select(".map")
        .append("div")
        .attr("class", "retrievelabel")
        .attr("id",feature.abrev+"label")

    var labelTitle = d3.select(".retrievelabel")
        .html(labelName)
        .attr("class", "labelTitle");

    var labelAttribute = d3.select(".labelTitle")
        .append("div")
        .html(labelAttribute)
        .attr("class", "labelAttribute")
};
//Dehlighting for the map & chart
function dehighlight(data) {
    var feature = data.properties ? data.properties : data.feature.properties;

    var deselect = d3.selectAll("#"+feature.abrev+"label").remove();

    //dehighlighting the states
    var selection = d3.selectAll("."+feature.abrev)
        .filter(".states");
    var fillColor = selection.select("desc").text();
    selection.style("fill", fillColor);

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
            "id": props.abrev
        })
        .html(labelAttribute);

    var stateName = retrievelabel.append("div")
        .attr("class", "labelname")
        .html(props.abrev);
};
//set up function for label placement as mouse moves
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".retrievelabel")
        .width;

    d3.select(".retrievelabel")
};
