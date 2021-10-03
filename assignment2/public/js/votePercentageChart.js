/**
 * Constructor for the Vote Percentage Chart
 */
function VotePercentageChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
VotePercentageChart.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};
    var divvotesPercentage = d3.select("#votes-percentage").classed("content", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divvotesPercentage.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divvotesPercentage.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
VotePercentageChart.prototype.chooseClass = function (party) {
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
 * Renders the HTML content for tool tip
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for toop tip
 */
VotePercentageChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<ul>";
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });

    return text;
}

/**
 * Creates the stacked bar chart, text content and tool tips for Vote Percentage chart
 *
 * @param electionResult election data for the year selected
 */
VotePercentageChart.prototype.update = function(electionResult){
    var self = this;

    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function() {
            return [0,0];
        })
        .html(function(d) {
            /* populate data in the following format
             * tooltip_data = {
             * "result":[
             * {"nominee": D_Nominee_prop,"votecount": D_Votes_Total,"percentage": D_PopularPercentage,"party":"D"} ,
             * {"nominee": R_Nominee_prop,"votecount": R_Votes_Total,"percentage": R_PopularPercentage,"party":"R"} ,
             * {"nominee": I_Nominee_prop,"votecount": I_Votes_Total,"percentage": I_PopularPercentage,"party":"I"}
             * ]
             * }
             * pass this as an argument to the tooltip_render function then,
             * return the HTML content returned from that method.
             * */
            return ;
        });


    // ******* TODO: PART III *******

    //Create the stacked bar chart.
    //Use the global color scale to color code the rectangles.
    //HINT: Use .votesPercentage class to style your bars.
    var rVotes = 0;
    var dVotes = 0;
    var iVotes = 0;
    electionResult.forEach(function(d) {
        rVotes += +d.R_Votes;
        dVotes += +d.D_Votes;
        iVotes += +d.I_Votes;
    });

    var rep = {party: "republican", votes: rVotes}
    var dem = {party: "democrat", votes: dVotes}
    var ide = {party: "independent", votes: iVotes}

    var data = [].concat(ide, dem, rep);

    var total = d3.sum(data, d => d.votes);
    console.log(total)
    var svg = self.svg;
    var selection = svg.selectAll("rect").data(data)

    var soFar = 0;
    var xFirstRep;
    var flagRep = true;
    var xFirstDe;
    var flagDe = true;

    selection
        .enter().append("rect")
        .merge(selection)
        .attr("y", self.margin.top * 2 )
        .attr("height", 30)
        .transition()
        .duration(3000)
        .attr("class", function (d){ return d.party; })
        .attr("width", function (d, i){
            console.log(d.votes)
            return (d.votes / total) * 100 + "%"} )
        .attr("x", function (d) {
            var prev = soFar;
            var current =(d.votes /total) * 100;
            soFar = soFar + current;
            if(d.party == "republican" && flagRep ) {
                xFirstRep = prev + "%";
                flagRep = false;
            }
            if(d.party == "democrat" && flagDe ) {
                xFirstDe = prev + "%";
                flagDe = false;
            }

            return prev + "%";

        })



    //exit:

    selection.exit()
        .remove();


    //Display the total percentage of votes won by each party
    //on top of the corresponding groups of bars.
    //HINT: Use the .votesPercentageText class to style your text elements;  Use this in combination with
    // chooseClass to get a color based on the party wherever necessary

    dem.x = xFirstDe;
    dem.text = String((dem.votes * 100 / total).toFixed(2)) + "%";
    dem.candidate = electionResult[0].D_Nominee

    rep.x = xFirstRep;
    rep.text = String((rep.votes * 100 / total ).toFixed(2)) + "%";
    rep.candidate = electionResult[0].R_Nominee

    ide.x = "0%";
    ide.text = String((ide.votes * 100 / total).toFixed(2)) + "%";
    ide.candidate = electionResult[0].I_Nominee


    var dataText;
    if(ide.votes > 0){
        dataText = [].concat(ide, dem, rep);
    } else{
        dataText = [].concat(dem, rep);
    }

    var selectionText = svg.selectAll("text.votesPercentageText").data(dataText);
    selectionText
        .enter().append("text")
        .merge(selectionText)
        .attr("y", self.margin.top * 2 - 2)
        .classed("votesPercentageText", true)
        .transition()
        .duration(3000)
        .text(function (d){return d.text})
        .attr("fill", function (d){
            if(d.party == "independent")
                return "green";
            else if(d.party == "republican")
                return "red";
            else  return "blue"
        })
        .attr("x",function (d){
            return d.x
        })


    selectionText.exit()
        .remove();

    var selectionTextC = svg.selectAll("text.candidateText").data(dataText);


    selectionTextC
        .enter().append("text")
        .merge(selectionTextC)
        .attr("y", self.margin.top * 2 - 13)
        .classed("candidateText", true)
        .transition()
        .duration(3000)
        .text(function (d){return d.candidate})
        .attr("fill", function (d){
            if(d.party == "independent")
                return "green";
            else if(d.party == "republican")
                return "red";
            else  return "blue"
        })
        .attr("x",function (d){
            return d.x
        })


    selectionTextC.exit()
        .remove();



    //Display a bar with minimal width in the center of the bar chart to indicate the 50% mark
    //HINT: Use .middlePoint class to style this bar.

    svg.append("rect")
        .attr("x", "50%" )
        .attr("class", "middlePoint")
        .attr("width", 1.5)
        .attr("height", 50)
        .attr("y", self.margin.top * 2 - 10 )

    //Just above this, display the text mentioning details about this mark on top of this bar
    //HINT: Use .votesPercentageNote class to style this text element
    svg.append("text")
        .attr("x", "50%" )
        .attr("class", "votesPercentageNote")
        .attr("y", self.margin.top )
        .text("Popular Vote: 50%");

    //Call the tool tip on hover over the bars to display stateName, count of electoral votes.
    //then, vote percentage and number of votes won by each party.

    //HINT: Use the chooseClass method to style your elements based on party wherever necessary.

};
