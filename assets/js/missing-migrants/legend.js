import { spike } from "./spike.js";

const spikeheight = d3.scaleLinear()
    .domain([1, 1022])
    .range([1, 250]);

// Spike height

const legendSpike = d3.select(".legend-spike");

const p = {
    spikewidth: 5, 
    spacing: 15, 
    high: 1022, 
    mid: 500, 
    low: 100
};

addSpikeItem(3, p.low, "dead");
addSpikeItem(2, p.mid, "dead");
addSpikeItem(1, p.high, "dead*");

legendSpike.append("div")
    .attr("class", "legend-text bottom")
    .text("*occurred on 18 April 2015 in the seas between Lampedusa, Italy and Libya")

function addSpikeItem(i, value, unit) {
    
    legendSpike.append("div")
        .attr("class", "legend-text")
        .style("bottom", -spikeheight(value))
        .html("<strong>" + value + "</strong>" + " " + unit)
    
    const spikeItemContainer = legendSpike.append("div")
        .attr("class", "legend-spike-key")
        .append("svg")
        .attr("width", spikeheight(value))
        .attr("height", p.spikewidth)
        .attr("viewBox", [0, 0, spikeheight(value), p.spikewidth]);
    
    spikeItemContainer.append("g")
        // .attr("transform", `translate(${-p.spikewidth}, ${ p.spikewidth / 2 })`)
        .attr("transform", `translate(0, ${ p.spikewidth / 2 })`)
        .append("polyline")
        .attr("class", "legend-spike-spike")
        .attr("points", d => {
            return spike()
                .x(0).y(0)
                .angle(0)
                .width(p.spikewidth)
                .height(spikeheight(value))
                .closed(true)
                ();
            })
};
