import * as draw from "./draw.js";
import * as forms from "./forms.js";
import * as util from "./util.js";

export function costCurve(container) {
    
    const id = d3.randomInt(100000, 1000000)();
    const params = ({ q: null, fc: null, p: null, c: null });
    const axisTitles = { x: "Output", y: "$" };

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.outputForm, id + "-q", "Output", 0, util.max.q, 1, 50);
    formsBox.call(forms.outputForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);
    
    formsBox.select('input[name="Output"]').on("input", render);
    formsBox.select('input[name="Fixed costs"]').on("input", render);

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

        params.q = +formsBox.select('input[name="Output"]').property("value");
        params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");

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
     
    // Toggle labels
    
    diagram.call(draw.labelsToggle, id);

    const cb = d3.select(`input#checkbox-${ id }`);
    let isChecked = cb.property("checked");

    cb.on("click", () => {
        d3.selectAll(`#labels-${ id } .curve-label`)
            .classed("hide-label", isChecked);
        isChecked = !isChecked;
    });
    
    return container.node();
}


// Figure 2 /////////////////////////////////////

export function ACAVCMC(container) {

    let panelSelect = "ac";
    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.outputForm, id + "-q", "Output", 0, util.max.q, 1, 50);
    formsBox.call(forms.outputForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);
    
    // Tabset

    const tabset = container.append("div")
        .attr("class", "tabset")

    tabset.append("div")
        .attr("class", "tab-btn active")
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
    
    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([0, util.costFxn({ q: util.max.q, fc: util.max.fc })])
        .range([util.dim.panelHeight, 0]);

    const yScalerBottom = d3.scaleLinear()
        .domain([0, util.acFxn({ q: util.max.q, fc: util.max.fc })])
        .range([util.dim.panelHeight, 0]);

    const diagram = container.append("div")
        .attr("class", "diagram");

    const svg = diagram.append("svg")
        .attr("width", "100%")
        .attr("viewBox", [
            0, 0, 
            util.dim.width + util.margin.left + util.margin.right, 
            util.dim.height + util.margin.top + util.margin.bottom
        ])
        .call(draw.drawBackground);

    const panelTop = svg.append("g")
        .attr("transform", `translate(${ util.margin.left }, ${ util.margin.top })`);

    const panelBottom = svg.append("g")
        .attr("transform", `translate(
            ${ util.margin.left }, 
            ${ util.margin.top + util.dim.panelHeight + util.margin.between }
        )`);
    
    // Toggle labels
    
    diagram.call(draw.labelsToggle, id);

    const cb = d3.select(`input#checkbox-${ id }`);
    let isChecked = cb.property("checked");

    cb.on("click", () => {
        d3.selectAll(`#labels-${ id } .curve-label`)
            .classed("hide-label", isChecked);
        isChecked = !isChecked;
    });

    // Render

    render(panelSelect);

    formsBox.select('input[name="Output"]')
        .on("input", () => render(panelSelect));
    formsBox.select('input[name="Fixed costs"]')
        .on("input", () => render(panelSelect));

    d3.selectAll("#fig-02 .tab-btn").on("click", switchPanel);
    d3.selectAll("#fig-02 .tab-btn").on("keydown", (event) => {
        if (event.key === "Enter") {
            switchPanel();
        }
    });
    
    function switchPanel() {
        d3.selectAll("#fig-02 .tab-btn").classed("active", false);
        d3.select(this).classed("active", true);
        panelSelect = d3.select(this).attr("panel");
        render(panelSelect);
    }

    function render(panelSelect) {
        if (panelSelect == "ac") {
            renderAC();
        } else if (panelSelect == "avc") {
            renderAVC();
        } else if (panelSelect == "mc") {
            renderMC();
        }
    }

    function renderAC() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
        
        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.cost, params, yScalerTop)
            .call(draw.yGuide, util.cost, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxes, axisTitlesTop)
            .call(draw.xGuides, util.cost, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${id}`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, 
                "Cost", 
                util.xScaler(85) + 10, 
                yScalerTop(util.costFxn({ q: 85, fc: params.fc })) + 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurve, id, util.ac, params, yScalerBottom)
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.ac, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, 
                "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            );
    }

    function renderAVC() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
        
        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.cost, params, yScalerTop)
            .call(draw.yGuide, util.cost, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxes, axisTitlesTop)
            .call(draw.xGuides, util.cost, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${id}`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, 
                "Cost", 
                util.xScaler(85) + 10, 
                yScalerTop(util.costFxn({ q: 85, fc: params.fc })) + 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.ac, params, yScalerBottom, util.gray)
            .call(draw.addCurve, id, util.avc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.avc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, 
                "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, 
                "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.acFxn({ q: 95 })) + 10
            );
    }

    function renderMC() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
        
        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.cost, params, yScalerTop)
            .call(draw.yGuide, util.cost, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxes, axisTitlesTop)
            .call(draw.xGuides, util.cost, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${id}`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, 
                "Cost", 
                util.xScaler(85) + 10, 
                yScalerTop(util.costFxn({ q: 85, fc: params.fc })) + 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.ac, params, yScalerBottom, util.gray)
            .call(draw.addCurveFull, id, util.avc, params, yScalerBottom, util.gray)
            .call(draw.addCurve, id, util.mc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.mc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, 
                "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, 
                "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.acFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, 
                "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.acFxn({ q: 63 })) + 10
            );
    }

    return container.node();
}