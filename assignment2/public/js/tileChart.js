/**
 * Constructor for the TileChart
 */
function TileChart(){

    var self = this;
    self.init();
};

/**
 * Initializes the svg elements required to lay the tiles
 * and to populate the legend.
 */
TileChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divTileChart = d3.select("#tiles").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    var svgBounds = divTileChart.node().getBoundingClientRect();
    self.svgWidth = svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgWidth/2;
    var legendHeight = 150;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + 0 + ",0)")

    self.svg = divTileChart.append("svg")
                        .attr("width",self.svgWidth)
                        .attr("height",self.svgHeight)
                        .attr("transform", "translate(" + self.margin.left + ",0)")
                        .style("bgcolor","green")

};

/**
 * Returns the class that needs to be assigned to an element.
 *
 * @param party an ID for the party that is being referred to.
 */
TileChart.prototype.chooseClass = function (party) {
    var self = this;
    if (party == "R"){
        return "republican";
    }
    else if (party== "D"){
        return "democrat";
    }
    else if (party == "I"){
        return "independent";
    }
}

/**
 * Renders the HTML content for tool tip.
 *
 * @param tooltip_data information that needs to be populated in the tool tip
 * @return text HTML content for tool tip
 */
TileChart.prototype.tooltip_render = function (tooltip_data) {
    var self = this;
    var text = "<h2 class ="  + self.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
    text +=  "Electoral Votes: " + tooltip_data.electoralVotes;
    text += "<ul>"
    tooltip_data.result.forEach(function(row){
        text += "<li class = " + self.chooseClass(row.party)+ ">" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
    });
    text += "</ul>";
    return text;
}

/**
 * Creates tiles and tool tip for each state, legend for encoding the color scale information.
 *
 * @param electionResult election data for the year selected
 * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
TileChart.prototype.update = function(electionResult, colorScale){
    var self = this;

    //Calculates the maximum number of columns to be laid out on the svg
    self.maxColumns = d3.max(electionResult,function(d){
                                return parseInt(d["Space"]);
                            });

    //Calculates the maximum number of rows to be laid out on the svg
    self.maxRows = d3.max(electionResult,function(d){
                                return parseInt(d["Row"]);
                        });
    //for reference:https://github.com/Caged/d3-tip
    //Use this tool tip element to handle any hover over the chart

    electionResult.forEach(function(d) {
        d.totalVotes = d.D_Votes + d.R_Votes + d.I_Votes
    });

    electionResult.forEach(function (d){
        var max = d3.max([d.R_Percentage, d.D_Percentage, d.I_Percentage]);
        if(d.R_Percentage == max){
            d.Party = "R";
            d.State_Winner = d.R_Nominee
        } else if (d.D_Percentage == max){
            d.Party = "D"
            d.State_Winner = d.D_Nominee
        } else {
            d.Party = "I"
            d.State_Winner = d.I_Nominee
        }
    });

    tip = d3.tip().attr('class', 'd3-tip')
        .direction('se')
        .offset(function(event, d) {
            return [0,0];
        })
        .html(function(event, d) {
             tooltip_data = {
             "state": d.State,
             "winner": d.State_Winner,
             "electoralVotes" : d.Total_EV,
             "result":[
             {"nominee": d.D_Nominee,"votecount": d.D_Votes,"percentage": d.D_Percentage,"party":"D"} ,
             {"nominee": d.R_Nominee,"votecount": d.R_Votes,"percentage": d.R_Percentage,"party":"R"} ,
             {"nominee": d.I_Nominee,"votecount": d.I_Votes,"percentage": d.I_Percentage,"party":"I"}
             ]}
            return self.tooltip_render(tooltip_data);
        });



    //Creates a legend element and assigns a scale that needs to be visualized
    self.legendSvg.append("g")
        .attr("class", "legendQuantile")
        .attr("transform", "translate(" + 0 + "," + self.margin.top + ")");

    var legendQuantile = d3.legendColor()
        .shapeWidth(self.svgWidth / 12 - 2)
        .cells(12)
        .orient('horizontal')
        .scale(colorScale);

    // ******* TODO: PART IV *******
    //Tansform the legend element to appear in the center and make a call to this element for it to display.

    this.legendSvg.select("g.legendQuantile").call(legendQuantile)

    //Lay rectangles corresponding to each state according to the 'row' and 'column' information in the data.

    var rowColum = {
        AL: [7,6],
        AK: [0,0],
        AZ: [2,5],
        AR: [5,5],
        CA: [1,4],
        CO: [3,4],
        CT: [10,3],
        DE:[9,5],
        FL:[9,7],
        GA:[8,6],
        HI:[1,7],
        ID: [2,2],
        IL:[6,2],
        IN:[6,3],
        IA:[5,3],
        KS:[4,5],
        KY:[6,4],
        LA:[5,6],
        ME: [0,11],
        MD:[8,3],
        MA:[11,2],
        MI:[8,2],
        MN:[5,2],
        MS:[6,6],
        MO:[5,4],
        MT:[3,2],
        NE:[4,4],
        NV:[2,3],
        NH:[11,1],
        NJ:[9,4],
        NM:[3,5],
        NY:[9,2],
        NC:[7,5],
        ND:[4,2],
        OH:[7,3],
        OK:[4,6],
        OR:[1,3],
        PA:[9,3],
        RI:[10,2],
        SC:[8,5],
        SD:[4,3],
        TN:[6,5],
        TX:[4,7],
        UT:[2,4],
        VT:[10,1],
        VA:[8,4],
        WA: [1,2],
        WV:[7,4],
        WI:[7,2],
        WY:[3,3],
        DC:[10,4],
        ME: [11,0]
    }

    electionResult.forEach(function(d) {
        d.Row = rowColum[d.Abbreviation][0]
        d.Column = rowColum[d.Abbreviation][1]
    });

    var sq = 50;
    var svg = self.svg;
    svg.call(tip);

    var selection = svg.selectAll("rect").data(electionResult)

    selection
        .enter().append("rect")
        .merge(selection)
        .attr("y", function (d){return d.Column * sq} )
        .attr("height", sq)
        .attr("width", sq * 1.3 )
        .attr("x", function (d) {return d.Row * sq * 1.3})
        .attr("class", "electoralVotes")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .duration(3000)
        .attr("fill", function (d){
            if(d.Party == "D"){
                return colorScale(-d.D_Percentage);
            }
            else if(d.Party == "R"){
                return colorScale(d.R_Percentage);
            } else return "green"
        })

    //exit:
    selection.exit()
        .remove();

    var selectionText = svg.selectAll("text.tilestextState").data(electionResult);
    selectionText
        .enter().append("text")
        .merge(selectionText)
        .attr("y", function (d){return d.Column * sq + sq / 2})
        .attr("x",function (d){
            return d.Row * sq * 1.3 + sq / 2;
        })
        .classed("tilestextState", true)
        .text(function (d){return d.Abbreviation})

    selectionText.exit()
        .remove();

    var selectionTextE = svg.selectAll("text.tilestextElectoral").data(electionResult);
    selectionTextE
        .enter().append("text")
        .merge(selectionTextE)
        .attr("y", function (d){return d.Column * sq + sq / 2 + 12})
        .attr("x",function (d){
            return d.Row * sq * 1.3 + sq / 2;
        })
        .classed("tilestextElectoral", true)
        .text(function(d){return parseInt(d.Total_EV)})

    selectionTextE.exit()
        .remove();


    //Call the tool tip on hover over the tiles to display stateName, count of electoral votes
    //then, vote percentage and number of votes won by each party.
    //HINT: Use the .republican, .democrat and .independent classes to style your elements.
};
