
/**
 * Constructor for the ElectoralVoteChart
 *
 * @param brushSelection an instance of the BrushSelection class
 */
function ElectoralVoteChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ElectoralVoteChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#electoral-vote").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 150;

    //creates svg element within the div
    self.svg = divelectoralVotes.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
ElectoralVoteChart.prototype.chooseClass = function(party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party == "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */

ElectoralVoteChart.prototype.update = function(electionResult, colorScale){
    var self = this;
    console.log("in")

    // ******* TODO: PART II *******
    //Group the states based on the winning party for the state;
    //then sort them based on the margin of victory
    var republican = [];
    var democrat = [];
    var independent = [];

    electionResult.forEach(function(d) {
        d.R_Percentage = +d.R_Percentage;
        d.D_Percentage = +d.D_Percentage;
        d.I_Percentage = +d.I_Percentage;
    });

    electionResult.forEach(function (d){
        var max = d3.max([d.R_Percentage, d.D_Percentage, d.I_Percentage]);
        if(d.R_Percentage == max){
            d.Party = "R";
            republican.push(d);
        } else if (d.D_Percentage == max){
            d.Party = "D"
            democrat.push(d);
        } else {
            d.Party = "I"
            independent.push(d);
        }
    });

    republican.sort(function(a, b) { return a.R_Percentage - b.R_Percentage });
    democrat.sort(function (a,b){return b.D_Percentage - a.D_Percentage});
    independent.sort(function (a,b){return b.I_Percentage - a.I_Percentage});
    var data = [].concat(independent, democrat, republican);
    console.log(data)


    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .electoralVotes class to style your bars.

    //make scale for width:
    var total = d3.sum(data, d => d.Total_EV);
    console.log(total)
    var soFar = 0;
    var svg = self.svg;
    var groupText = svg.append("g").attr("transform", "translate(" + 15 + "," + self.margin.top / 2 + ")");
    var selection = svg.selectAll("rect").data(data)

    var xFirstRep;
    var flagRep = true;
    var xFirstDe;
    var flagDe = true;

    selection
        .enter().append("rect")
        .merge(selection)
        .attr("y", self.margin.top * 2 )
        .attr("height", 10)
        .transition()
        .duration(3000)
        .attr("class", "electoralVotes")
        .attr("fill", function (d){
            if(d.Party == "D"){
                return colorScale(-d.D_Percentage);
            }
            else if(d.Party == "R"){
                return colorScale(d.R_Percentage);
            } else return "green"
        })
        .attr("width", function (d){return (d.Total_EV / total) * 100 + "%"} )
        .attr("x", function (d) {
            var prev = soFar;
            var current =(d.Total_EV /total) * 100;
            soFar = soFar + current;
            if(d.Party == "R" && flagRep ) {
                xFirstRep = prev + "%";
                flagRep = false;
            }
            if(d.Party == "D" && flagDe ) {
                xFirstDe = prev + "%";
                flagDe = false;
            }

            return prev + "%";

        })



    //exit:

    selection.exit()
        .remove();



    //Display total count of electoral votes won by the Democrat and Republican party
    //on top of the corresponding groups of bars.
    //HINT: Use the .electoralVoteText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary
    var total_I = {"party" : "independent", "total" : d3.sum(independent, d => d.Total_EV), "x" : 0 + "%"}
    var total_D = {"party": "democrat", "total" : d3.sum(democrat, d => d.Total_EV), "x" : xFirstDe}
    var total_R = {"party" : "republican", "total" : d3.sum(republican, d => d.Total_EV), "x": xFirstRep}

    var dataText;
    if(total_I.total > 0){
        dataText = [].concat(total_I, total_D, total_R);
    } else{
        dataText = [].concat(total_D, total_R);
    }

    var selectionText = svg.selectAll("text").data(dataText);
    selectionText
        .enter().append("text")
        .merge(selectionText)
        .attr("y", self.margin.top * 2 - 2)
        .attr("class", function (d){
            return d.Party
        })
        .classed("electoralVoteText", true)
        .transition()
        .duration(3000)
        .text(function (d){return d.total})
        .attr("x",function (d){
                return d.x
            })


    selectionText.exit()
        .remove();



    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.
    svg.append("rect")
        .attr("x", "50%" )
        .attr("class", "middlePoint")
        .attr("width", 1.5)
        .attr("height", 30)
        .attr("y", self.margin.top * 2 - 10 )


    //Just above this, display the text mentioning the total number of electoral votes required
    // to win the elections throughout the country
    //HINT: Use .electoralVotesNote class to style this text element

    svg.append("text")
        .attr("x", "50%" )
        .attr("class", "electoralVotesNote")
        .attr("y", self.margin.top * 2 - 12 )
        .text("Electoral Vote: " + (Math.floor(total / 2) + 1));
    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

    //******* TODO: PART V *******
    //Implement brush on the bar chart created above.
    //Implement a call back method to handle the brush end event.
    //Call the update method of brushSelection and pass the data corresponding to brush selection.
    //HINT: Use the .brush class to style the brush.

};
