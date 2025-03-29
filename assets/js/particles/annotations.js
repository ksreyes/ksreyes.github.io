const params = {
    formsWidth: 150,
    formsHeight: 70,
    legendWidth: 300,
    legendHeight: 85
};

// Forms

const annotLeft = d3.select(".annot-forms-container .annot-left")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", [0, 0, params.formsWidth, params.formsHeight]);

annotLeft.call(addArrow)

annotLeft.append("g")
    .attr("transform", "translate(0, 0)")
    .attr("class", "annot-arrow")
    .attr("marker-end", "url(#arrow)")
    .call(g => g.append("path")
    .attr("d", () => {
        const path = d3.path();
        path.moveTo(40, 30);
        path.quadraticCurveTo(0, 35, 10, 65);
        return path;
    }))

const textLeft = annotLeft.append("g")
    .attr("transform", "translate(50, 20)")
    .append("text")
    .attr("class", "annot-text left")
    .attr("x", 0).attr("y", 0);
textLeft.append("tspan")
    .text("Pick a")
    .attr("x", 0).attr("y", 0).attr("dx", 10);
textLeft.append("tspan")
    .text("Metro Manila")
    .attr("x", 0).attr("y", 0).attr("dy", 17);
textLeft.append("tspan")
    .text("city...")
    .attr("x", 0).attr("y", 0).attr("dx", 10).attr("dy", 17 * 2);


const annotRight = d3.select(".annot-forms-container .annot-right")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", [0, 0, params.formsWidth, params.formsHeight]);

annotRight.call(addArrow)

const textRight = annotRight.append("g")
    .attr("transform", "translate(110, 20)")
    .append("text")
    .attr("class", "annot-text right")
    .attr("x", 0).attr("y", 0);
textRight.append("tspan")
    .text("...and")
    .attr("x", 0).attr("y", 0).attr("dx", -10);
textRight.append("tspan")
    .text("compare with")
    .attr("x", 0).attr("y", 0).attr("dy", 17);
textRight.append("tspan")
    .text("a global city")
    .attr("x", 0).attr("y", 0).attr("dy", 17 * 2);

annotRight.append("g")
    .attr("transform", "translate(120,30)")
    .attr("class", "annot-arrow")
    .attr("marker-end", "url(#arrow)")
    .call(g => g.append("path")
    .attr("d", () => {
        const path = d3.path();
        path.moveTo(0, 0);
        path.quadraticCurveTo(25, 0, 20, 35);
        return path;
    }))

// Legend

const annotLegend = d3.select(".annot-legend")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", [0, 0, params.legendWidth, params.legendHeight]);

annotLegend.call(addArrow);

annotLegend.append("g")
    .attr("transform", "translate(25, 40)")
    .attr("class", "annot-arrow")
    .attr("marker-end", "url(#arrow)")
    .call(g => g.append("path")
    .attr("d", () => {
        const path = d3.path();
        path.moveTo(5, 10);
        path.quadraticCurveTo(-40, 10, -10, -35);
        return path;
    }))

const label = annotLegend.append("g")
    .attr("transform", "translate(45, 44)")
    .append("text")
    .attr("class", "annot-text")
    .attr("x", 0).attr("y", 0);
label.append("tspan")
    .text('Your ancestors are "native" if')
    .attr("x", 0).attr("y", 0);
label.append("tspan")
    .text("they had been living in your")
    .attr("x", 0).attr("y", 0).attr("dy", 17);
label.append("tspan")
    .text("country since the year 1500")
    .attr("x", 0).attr("y", 0).attr("dy", 17 * 2);

// Add arrow

function addArrow(container) {

    container.append("defs")
        .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8).attr("refY", 5)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
        .append("path")
            .attr("d", "M0,1 L9,5 L0,9");

    return container.node();
};