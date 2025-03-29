import * as draw from "./draw.js";
import * as forms from "./forms.js";
import * as util from "./util.js";

export function costCurve(container) {
    
    const id = d3.randomInt(100000, 1000000)();

    const q0 = 70;
    const fc0 = 250;
    const params = ({ q: null, fc: null, p: null, c: null });
    params.q = q0;
    params.fc = fc0;

    const axisTitles = ({ x: "Output", y: "$" });

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.outputForm, id, 70);
    formsBox.call(forms.outputForm, 9798, 80);

    const yScaler = d3.scaleLinear()
        .domain([0, util.costFxn({ q: util.max.q, fc: util.max.fc })])
        .range([util.dim.panelHeight, 0]);
    
    const diagram = container.append("div")
        .attr("class", "diagram");

    const svg = diagram.append("svg")
        .attr("width", "100%")
        .attr("viewBox", [
            0, 0, 
            util.dim.width + util.margin.left + util.margin.right, 
            util.dim.panelHeight + util.margin.top + util.margin.bottom
        ])
        .call(draw.drawBackground);
    
    const panel = svg.append("g")
        .attr("transform", `translate(${ util.margin.left }, ${ util.margin.top })`)
    
    panel.append("g")
        .call(draw.clipWide, id)
        .call(draw.addCurve, id, util.cost, params, yScaler)
        .call(draw.yGuide, util.cost, params, yScaler);
    
    panel.append("g")
        .call(draw.panelAxes, axisTitles)
        .call(draw.xGuides, util.cost, params, yScaler, 1);
    
    panel.append("g")
        .attr("id", `labels-${ id }`)
        .call(draw.clipWide, id)
        .call(
            draw.addLabel, 
            "Cost", 
            util.xScaler(85) + 10, 
            yScaler(util.costFxn({ q: 85, fc: params.fc })) + 10
        );
     
    // Toggle labels ////////////////////////////
    
    diagram.call(draw.labelsToggle, id);

    const cb = d3.select(`input#checkbox-${ id }`);
    let isChecked = cb.property("checked");

    cb.on("click", () => {
        d3.selectAll(`#labels-${ id } .curve-label`)
            .classed("hide-label", isChecked);
        isChecked = !isChecked;
        console.log(isChecked);
    });
    
    return container.node();
}