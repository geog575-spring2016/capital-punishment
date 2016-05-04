//bugs/issues to deal with:
//1) x1 is not defined -- related to the retrievelabel. need to rectify this issue.
//2) right now, we don't have the legal data so it's all reading as "legal" and the values are NaN
//3) figure out how to cycle over time automatically
//4) figure out how to create proportional symbols (raw data for # executions per state in each year)
//5) some states do not highlight, and VA/WV highlight together :/ WHY


//wrap it all in an anonymous function
(function(){

//array for law (Gaby is working on the data!, categories may need to be altered)
var arrayLaw = [ "Legal","Not","Moratorium", "Formal Hold", "De Facto Moratorium"]; 
//array for years
var yearArray = ["1977", "1978", "1979", "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"];
var executeYR = ["Y1977", "Y1978", "Y1979", "Y1980", "Y1981", "Y1982", "Y1983", "Y1984", "Y1985", "Y1986", "Y1987", "Y1988", "Y1989", "Y1990", "Y1991", "Y1992", "Y1993", "Y1994", "Y1995", "Y1996", "Y1997", "Y1998", "Y1999", "Y2000", "Y2001", "Y2002", "Y2003", "Y2004", "Y2005", "Y2006", "Y2007", "Y2008", "Y2009", "Y2010", "Y2011", "Y2012", "Y2013", "Y2014", "Y2015"];
//deleted other arrays for later because we are focusing on law/total # of executions
//if time, go back to earlier commits and grab old arrays for race, method, etc.

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
        height = 400;

//when window loads, initiate map
window.onload = setMap3();

//set up the choropleth
function setMap() {


    // map variable, an svg element with attributes styled in style.css
    var map = d3.select("#mainmap")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)
        .attr("y", "50");

    // TEST: creating path to trace onto states to obtain centriods
    // map.append("path")
    // .datum({type: "GeometryCollection", geometries: geometries})
    // .attr("d", d3.geo.path());

    //set the projection for the US, equal area because choropeth
    var projection = d3.geo.albers()
        .scale(1000)
        .center([0.00, 39.8333333])
        .rotate ([98.585522, 0, 0])
        //double check these parallels at a later  time
        .parallels([30, 48])
        .translate([width / 2, height / 2]);

    //path to draw the map
    var path = d3.geo.path()
        .projection(projection);

    //load in the data
    d3_queue.queue()
        .defer(d3.csv, "data/Law.csv")
        .defer(d3.json, "data/continentalUS.topojson")
        .await(callback);


//set up callback function with 3 
  function callback(error, csvData, us){
    //translate WI TopoJSON using the topojson.feature() method
    var states = topojson.feature(us, us.objects.continentalUS).features;
    states = joinData(states, csvData);

    // TEST
    map.append("path")
    .attr("d", d3.geo.path().projection(d3.geo.albers()));

    // array to store values of # of executions
    var execute = [];
    var timeline = yearArray.length;

    // function to publish circles 
    // circle(execute, timeline, states, csvData);

    //add color scale
    var colorScale = makeColorScale(csvData);
    //add enumeration units to the map
    setEnumerationUnits(states, map, path, colorScale);
    };
};//end of setMap

function setMap2() {


    // create element to write map into #mainmap container
    var svg = d3.select("#mainmap")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    console.log("TEST");


    d3.json("data/continentalUS.topojson", function(error, us) {
        if (error) return console.error(error);

        console.log("TEST");

        //set the projection for the US, equal area because choropeth
        var mapSpecs = d3.geo.albers()
            .scale(300)
            .center([0.00, 39.8333333])
            .rotate ([98.585522, 0, 0])
            //double check these parallels at a later  time
            .parallels([30, 48])
            .translate([width / 2, height / 2]);

        svg.append("path")
          .datum(topojson.feature(us, us.objects.continentalUS).features)
          .attr("d", d3.geo.path().projection(d3.geo.mercator()));

        console.log(us.objects.continentalUS);

        var projection = d3.geo.mercator()
            .scale(500)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(mapSpecs);

        svg.append("path")
            .datum(us.objects.continentalUS)
            .attr("d", path);

    });

}

function setMap3() {


    var formatNumber = d3.format(",.0f");

    var path = d3.geo.path()
        .projection(null);

    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 15]);

    var svg = d3.select("#mainmap")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")")
      .selectAll("g")
        .data([1e6, 5e6, 1e7])
      .enter().append("g");

    legend.append("circle")
        .attr("cy", function(d) { return -radius(d); })
        .attr("r", radius);

    legend.append("text")
        .attr("y", function(d) { return -2 * radius(d); })
        .attr("dy", "1.3em")
        .text(d3.format(".1s"));

    console.log("TEST");

    d3.json("data/continentalUS.topojson", function(error, us) {
        if (error) throw error;

        svg.append("path")
              .datum(topojson.feature(us, us.objects.continentalUS).properties)
              .attr("class", "land")
              .attr("d", path);


        // TEST code for testing theory
        console.log(us.objects.continentalUS);

        var display = svg.selectAll(".STUSPS")
            .data(us)
            .enter()
            .append("path");

        svg.append("path")
              .datum(topojson.mesh(us, us.objects.continentalUS, function(a, b) { return a !== b; }))
              .attr("class", "border border--state")
              .attr("d", path);

        svg.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
              .data(topojson.feature(us, us.objects.continentalUS).features
                .sort(function(a, b) { return b.properties.population - a.properties.population; }))
            .enter().append("circle")
              .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
              .attr("r", function(d) { return radius(d.properties.population); })
            .append("title")
              .text(function(d) {
                return d.properties.name
                    + "\nPopulation " + formatNumber(d.properties.population);
              });
    });

    d3.select(self.frameElement).style("height", height + "px");


}

//function to join our data since we brought csv/topo in separately
function joinData(states, csvData) {
    //loop through csv to assign attribute values to the USstates
    for (var i=0; i<csvData.length; i++){
        //variable for the current county in topo
        var csvState = csvData[i]; 
        //variable for the csv primary key
        var csvKey = csvState.NAME;

        //loop through geojson regions to find correct region
        for (var a=0; a<states.length; a++){
            //the current county geojson properties
            var geojsonProps = states[a].properties;
            //the geojson primary key
            var geojsonKey = geojsonProps.NAME;
            //if primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){
                //assign all attributes and values
                arrayLaw.forEach(function(attr){
                    //get csv attribute value, take it in as a string and return as a float
                    var val = (parseFloat(csvState[attr]));
                    //assign the attribute and its value to geojson properties
                    geojsonProps[attr] = val; 
                });
            };
        };
    };
    return states;
};

//function to set the enumeration units in the map 
function setEnumerationUnits(states, map, path, colorScale) {
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
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
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

// //function to join our data since we brought csv/topo in separately
// function circle(pops, length, states, csvData) {
//     for (var mug=0; mug<length; mug++) {
//         var pop = states.features[mug].properties.POPULATION;
//         pops.push(Number(pop));
//     }
// }


//function to highlight enumeration units and bars on mouseover
function highlight(props){
    //change stroke on mouseover
    var selected = d3.selectAll("." + props.NAME)
        .style({
            "stroke": "white",
            "stroke-width": "4"
        });


    // TEST: method for centroid data
    var centroid = path.centroid(selected);
    alert('Centroid at: ' + centroid[0] + ', ' + centroid[1]);


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
        .node()
        .getBoundingClientRect()
        .width;
    //"x is not defined" related to this line, but label disappears without this line
    //how to fix that??
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1;
    d3.select(".retrievelabel")
        .style({
            "left": x + "px",
            "top": y + "px"
        });
};

// TEST function to get centroids of states
function getBoundingBoxCenter(selection) {
    // get the DOM element from a D3 selection
    // you could also use "this" inside .each()
    var element = selection.node(),
        // use the native SVG interface to get the bounding box
        bbox = element.getBBox();
    // return the center of the bounding box
    return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

// TEST: another callback function for circles
function callback2(error, csvData, us){

    // appending paths to map to find centroid
    svg.append("path")
    .datum(topojson.feature(uk, uk.objects.subunits))
    .attr("d", d3.geo.path().projection(d3.geo.mercator()));
}

    // array to store values of # of execu



})(); //last line of main.js