import * as draw from "./draw.js";
import * as forms from "./forms.js";
import * as util from "./util.js";

export function costCurve(container) {
    
    const id = d3.randomInt(100000, 1000000)();

    const axisTitles = ({ x: "Output", y: "$" });

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.outputForm, id + "-q", "Output", 0, util.max.q, 1, 70);
    formsBox.call(forms.outputForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);
    
    formsBox.select('input[name="Output"]').on("input", render);
    formsBox.select('input[name="Fixed costs"]').on("input", render);

    const params = ({ q: null, fc: null, p: null, c: null });
    
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
    
    render();
    
    function render() {

        let q0 = formsBox.select('input[name="Output"]').property("value");
        let fc0 = formsBox.select('input[name="Fixed costs"]').property("value");

        params.q = +q0;
        params.fc = +fc0;

        panel.selectAll("g").remove();

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
    }
     
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


export function ACAVCMC(container) {

    const id = d3.randomInt(100000, 1000000)();

    const axisTitlesTop = ({ x: "Output", y: "$" });
    const axisTitlesBottom = ({ x: "Output", y: "$/unit" });

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.outputForm, id + "-q", "Output", 0, util.max.q, 1, 70);
    formsBox.call(forms.outputForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);
    
    formsBox.select('input[name="Output"]').on("input", render);
    formsBox.select('input[name="Fixed costs"]').on("input", render);

    // Tabset

    const tabset = container.append("div")
        .attr("class", "tabset")

    tabset.append("div")
        .attr("class", "tab-btn")
        .attr("panel", "ac")
        .text("Average cost");
    tabset.append("div")
        .attr("class", "tab-btn")
        .attr("panel", "avc")
        .text("Average variable cost");
    tabset.append("div")
        .attr("class", "tab-btn")
        .attr("panel", "mc")
        .text("Marginal cost");
    

    d3.selectAll("#fig-02 .tab-btn").on("click", switchPanel);
    d3.selectAll("#fig-02 .tab-btn").on("keydown", (event) => {
        if (event.key === "Enter") {
            switchPanel();
        }
    });
    
    function switchPanel() {
        d3.selectAll("#fig-02 .tab-btn").classed("active", false);
        d3.select(this).classed("active", true);
        const panelSelect = d3.select(this).attr("panel");
        render(panelSelect);
    }

    function render(panel) {
        console.log(panel);
    }

//     const params = ({ q: null, fc: null, p: null, c: null });
    
//     const yScaler = d3.scaleLinear()
//         .domain([0, util.costFxn({ q: util.max.q, fc: util.max.fc })])
//         .range([util.dim.panelHeight, 0]);
    
//     const diagram = container.append("div")
//         .attr("class", "diagram");

//     const svg = diagram.append("svg")
//         .attr("width", "100%")
//         .attr("viewBox", [
//             0, 0, 
//             util.dim.width + util.margin.left + util.margin.right, 
//             util.dim.panelHeight + util.margin.top + util.margin.bottom
//         ])
//         .call(draw.drawBackground);
    
//     const panel = svg.append("g")
//         .attr("transform", `translate(${ util.margin.left }, ${ util.margin.top })`)



// }

// {
//     const params = ({ q: null, fc: null, p: null, c: null });
//     params.q = q1;
//     params.fc = fc1;
//     const id = d3.randomInt(100000, 1000000)();
//     const axisTitlesTop = ({ x: "Output", y: "$" });
//     const axisTitlesBottom = ({ x: "Output", y: "$/unit" });
    
//     const yScalerTop = d3.scaleLinear()
//       .domain([0, costFxn({ q: qMax, fc: fcMax })])
//       .range([panelHeight, 0]);
      
//     const yScalerBottom = d3.scaleLinear()
//       .domain([0, acFxn({ q: qMax, fc: fcMax })])
//       .range([panelHeight, 0]);
    
//     const container = d3.create("div")
//           .attr("style", "display: flex; justify-content: center");
          
//     const svg = container.append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
//       .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
//       .call(background)
//       .call(labelsToggle, id);
    
//     // Top panel ////////////////////////////////////////////////////////////////////////////////////
    
//     const panelTop = svg.append("g")
//       .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
//     panelTop.append("g")
//       .call(clipWide, id)
//       .call(addCurve, id, cost, params, yScalerTop)
//       .call(yGuide, cost, params, yScalerTop);
    
//     panelTop.append("g")
//       .call(panelAxes, axisTitlesTop)
//       .call(xGuides, cost, params, yScalerTop);
    
//     panelTop.append("g")
//       .attr("id", `labels-${id}`)
//       .call(clipWide, id)
//       .call(addLabel, "Cost", xScaler(85) + 10, yScalerTop(costFxn({ q: 85, fc: params.fc })) + 10);
      
//     // Bottom panel /////////////////////////////////////////////////////////////////////////////////
    
//     const panelBottom = svg.append("g")
//       .attr("transform", `translate(${margin.left}, ${margin.top + panelHeight + margin.between})`);
    
//     panelBottom.append("g")
//       .call(clip, id)
//       .call(addCurve, id, ac, params, yScalerBottom)
      
//     panelBottom.append("g")
//       .call(clipWide, id)
//       .call(yGuide, ac, params, yScalerBottom);
    
//     panelBottom.append("g")
//       .call(panelAxes, axisTitlesBottom);
    
//     panelBottom.append("g")
//       .attr("id", `labels-${id}`)
//       .call(addLabel, "AC", xScaler(95) - 10, yScalerBottom(acFxn({ q: 95, fc: params.fc })) - 10, "end");
    
//     // Toggle event listener ////////////////////////////////////////////////////////////////////////
    
//     const cb = svg.select("foreignObject").select(`input#checkbox-${id}`);
    
//     cb.on("click", () => {
//       const isChecked = cb.property("checked");
//       const chartLabels = svg.selectAll(`g#labels-${id}`);
//       isChecked ? chartLabels.style("visibility", "visible") : chartLabels.style("visibility", "hidden");
//     });
    
    return container.node();
  }