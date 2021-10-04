/**
 * Constructor for the Year Chart
 *
 * @param electoralVoteChart instance of ElectoralVoteChart
 * @param tileChart instance of TileChart
 * @param votePercentageChart instance of Vote Percentage Chart
 * @param electionInfo instance of ElectionInfo
 * @param electionWinners data corresponding to the winning parties over mutiple election years
 */
function YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners) {
    var self = this;

    self.electoralVoteChart = electoralVoteChart;
    self.tileChart = tileChart;
    self.votePercentageChart = votePercentageChart;
    self.electionWinners = electionWinners;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divyearChart = d3.select("#year-chart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
YearChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R") {
        return "yearChart republican";
    }
    else if (party == "D") {
        return "yearChart democrat";
    }
    else if (party == "I") {
        return "yearChart independent";
    }
}


/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
YearChart.prototype.update = function(){
    var self = this;
    var clicked = null;

    //Domain definition for global color scale
    var domain = [-70,-65,-60,-55,-50,-45,0,45,50,55,60,65,70 ];

    //Color range for global color scale
    var range = ["#0066CC", "#0080FF", "#3399FF", "#66B2FF", "#99ccff", "#CCE5FF", "#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#FF0000", "#CC0000"];

    //Global colorScale to be used consistently by all the charts
    self.colorScale = d3.scaleQuantile()
        .domain(domain).range(range);
    
    self.electionWinners.forEach(function(d) {
        d.YEAR = +d.YEAR;
    });

    // ******* TODO: PART I *******

    // Create the chart by adding circle elements representing each election year
    //The circles should be colored based on the winning party for that year
    //HINT: Use the .yearChart class to style your circle elements
    //HINT: Use the chooseClass method to choose the color corresponding to the winning party.

    var svg = self.svg
    var group = svg.append("g").attr("transform", "translate(" + (self.margin.left) + "," + self.margin.top + ")");
    var groupText = svg.append("g").attr("transform", "translate(" + 15 + "," + self.margin.top / 2 + ")");

    group.selectAll("circle")
        .data(self.electionWinners)
        .enter().append("circle")
        .on('click', function(d, i) {

            var circles = document.getElementsByTagName("circle");
            for(var j = 0; j < circles.length; j++){
                circles[j].classList.remove("highlighted");
            }
            this.classList.add("highlighted");

            var address = "data/election-results-" + String(i.YEAR) + ".csv"

            d3.csv(address)
                .then(function(electionResults) {
                    self.electoralVoteChart.update(electionResults, self.colorScale);
                    self.tileChart.update(electionResults, self.colorScale);
                    self.votePercentageChart.update(electionResults);
                });
        })
        .attr("cx", function (d, i){ return i * 50 ; })
        .attr("class", function(d){return String(self.chooseClass(d.PARTY))})
        .classed("yearChart", true)


    //Append text information of each year right below the corresponding circle
    //HINT: Use .yeartext class to style your text elements
    groupText.selectAll("text")
        .data(self.electionWinners)
        .enter().append("text")
        .attr("x", function (d, i){ return i * 50 + self.margin.left - 15 ; })
        .attr("y", 50)
        .classed("yeartext", true)
        .text(function(d){return d.YEAR});

    //Style the chart by adding a dashed line that connects all these years.
    //HINT: Use .lineChart to style this dashed line
    group.selectAll("line")
        .data(self.electionWinners)
        .enter().append("line")
        .attr("x1", function (d, i){ return i * 50 + 3.2; })
        .attr("y1", 5)
        .attr("x2", function (d, i){ return (i + 1) * 50 - 3; })
        .attr("y2", 5)
        .classed("lineChart", true)



    //******* TODO: EXTRA CREDIT *******

    //Implement brush on the year chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.
};


