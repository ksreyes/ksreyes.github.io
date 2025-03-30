import * as draw from "./draw.js";
import * as forms from "./forms.js";
import * as util from "./util.js";

// Figure 1 /////////////////////////////////////

export function figure1(container) {
    
    const id = d3.randomInt(100000, 1000000)();
    const params = ({ q: null, fc: null, p: null, c: null });
    const axisTitles = { x: "Output", y: "$" };

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-q", "Output", 0, util.max.q, 1, 50);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);
    
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
                draw.addLabel, "Cost", 
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

export function figure2(container) {

    let panelSelect = "ac";
    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-q", "Output", 0, util.max.q, 1, 50);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);
    
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
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Cost", 
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
                draw.addLabel, "AC", 
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
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Cost", 
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
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
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
            .attr("id", `labels-${ id }`)
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
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            );
    }

    return container.node();
}

// Figure 3 /////////////////////////////////////

export function figure3(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-q", "Output", 0, util.max.q, 1, 50);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250, true);
    formsBox.call(forms.addForm, id + "-p", "Price", 0, util.max.p, .1, 17, true);

    params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
    params.p = +formsBox.select('input[name="Price"]').property("value");

    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-800, 800])
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

    render();

    formsBox.select('input[name="Output"]').on("input", render);
    formsBox.select('input[name="Fixed costs"]').on("input", render);

    function render() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        
        const corners = { 
            x1: 0, 
            y1: yScalerBottom(params.p), 
            x2: util.xScaler(params.q), 
            y2: yScalerBottom(util.acFxn(params)) 
        };

        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profit, params, yScalerTop)
            .call(draw.yGuide, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitFxn({ q: 70, p: params.p, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.addArea, id, util.profit, corners)
            .select("path")
            .classed("invert", corners.y1 < corners.y2 ? false : true);
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurve, id, util.ac, params, yScalerBottom)
            .call(draw.addCurve, id, util.avc, params, yScalerBottom)
            .call(draw.addCurve, id, util.mc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.price, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.price, params, yScalerBottom)
            .call(draw.yGuide, util.ac, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            );
    }

    return container.node();
}

// Figure 4 /////////////////////////////////////

export function figure4(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-q", "Output", 0, util.max.q, 1, 50);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250, true);
    formsBox.call(forms.addForm, id + "-p", "Price", 0, util.max.p, .1, 10, true);

    params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
    params.p = +formsBox.select('input[name="Price"]').property("value");
    
    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-800, 800])
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

    render();

    formsBox.select('input[name="Output"]').on("input", render);

    function render() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        
        const corners = { 
            x1: 0, 
            y1: yScalerBottom(params.p), 
            x2: util.xScaler(params.q), 
            y2: yScalerBottom(util.acFxn(params)) 
        };

        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profit, params, yScalerTop)
            .call(draw.yGuide, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitFxn({ q: 70, p: params.p, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.addArea, id, util.profit, corners)
            .select("path")
            .classed("invert", corners.y1 < corners.y2 ? false : true);
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.ac, params, yScalerBottom, util.gray)
            .call(draw.addCurveFull, id, util.avc, params, yScalerBottom, util.gray)
            .call(draw.addCurve, id, util.mc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.price, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.price, params, yScalerBottom)
            .call(draw.yGuide, util.ac, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            );
    }

    return container.node();
}

// Figure 5 /////////////////////////////////////

export function figure5(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-q", "Output", 0, util.max.q, 1, 50, true);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250, true);
    formsBox.call(forms.addForm, id + "-p", "Price", 2.6, util.max.p, .1, 15);

    params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");

    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-800, 800])
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

    render();

    formsBox.select('input[name="Price"]').on("input", render);

    function render() {

        params.p = +formsBox.select('input[name="Price"]').property("value");
        params.q = util.qStar(params.p);

        formsBox.select('input[name="Output"]')
            .node()
            .previousElementSibling
            .textContent = params.q;

        const corners = { 
            x1: 0, 
            y1: yScalerBottom(params.p), 
            x2: util.xScaler(params.q), 
            y2: yScalerBottom(util.acFxn(params)) 
        };

        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profit, params, yScalerTop)
            .call(draw.yGuide, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitFxn({ q: 70, p: params.p, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.addArea, id, util.profit, corners)
            .select("path")
            .classed("invert", corners.y1 < corners.y2 ? false : true);
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.ac, params, yScalerBottom, util.gray)
            .call(draw.addCurveFull, id, util.avc, params, yScalerBottom, util.gray)
            .call(draw.addCurve, id, util.mc, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.price, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.price, params, yScalerBottom)
            .call(draw.yGuide, util.ac, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            );
    }

    return container.node();
}

// Figure 6 /////////////////////////////////////

export function figure6(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-p", "Price", 0, util.max.p, .1, 15);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 250);

    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-800, 800])
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

    render();

    formsBox.select('input[name="Price"]').on("input", render);
    formsBox.select('input[name="Fixed costs"]').on("input", render);

    function render() {

        params.p = +formsBox.select('input[name="Price"]').property("value");
        params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
        params.q = util.q(params.p);

        const corners = { 
            x1: 0, 
            y1: yScalerBottom(params.p), 
            x2: util.xScaler(params.q), 
            y2: yScalerBottom(util.acFxn(params)) 
        };

        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profit, params, yScalerTop)
            .call(draw.yGuide, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitFxn({ q: 70, p: params.p, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.addArea, id, util.profit, corners)
            .select("path")
            .classed("invert", corners.y1 < corners.y2 ? false : true);
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.ac, params, yScalerBottom, util.gray)
            .call(draw.addCurveFull, id, util.avc, params, yScalerBottom, util.gray)
            .call(draw.addCurveFull, id, util.mc, params, yScalerBottom, util.gray);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.price, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.price, params, yScalerBottom)
            .call(draw.addCurve, id, util.supply, params, yScalerBottom)
            .call(draw.yGuide, util.ac, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        // Vertical portion of supply curve

        panelBottom.append("g")
            .attr("id", `${ util.supply.id }-${ id }`)
            .call(draw.clipWide, id)
            .append("path")
            .attr("class", "curve colored")
            .attr("d", util.line([
                [0, util.dim.panelHeight], 
                [0, yScalerBottom(util.avcFxn({ q: util.qShutDown() }))], 
                [1, yScalerBottom(util.avcFxn({ q: util.qShutDown() }))]
            ]))
            .style("stroke", util.supply.scheme.base)
            .on("mousemove", (event) => {
            
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.colored`)
                    .classed("hovered", true)
                    .style("stroke", util.supply.scheme.baseSelect);
    
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.dulled`)
                    .classed("hovered", true)
                    .style("stroke", util.supply.scheme.dullSelect);
    
                util.tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .style("display", "block")
                    .text(util.supply.label);
            })
            .on("mouseleave", (event) => {
            
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.colored`)
                    .classed("hovered", false)
                    .style("stroke", util.supply.scheme.base);
    
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.dulled`)
                    .classed("hovered", false)
                    .style("stroke", util.supply.scheme.dull);
    
                util.tooltip.style("display", "none");
            });

        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, "Supply", 
                util.xScaler(69) + 10, 
                yScalerBottom(util.mcFxn({ q: 69 })) -25, 
                "middle"
            );
    }

    return container.node();
}

// Figure 7 /////////////////////////////////////

export function figure7(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: 46, fc: 0, p: 6.9, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-800, 800])
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

    render();

    function render() {

        // Top panel

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profit, params, yScalerTop)
            // .call(draw.yGuide, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profit, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitFxn({ q: 70, p: params.p, fc: params.fc })) - 10
            );

        panelTop.append("g")
            .attr("class", "guide")
            .append("text")
            .attr("class", "tick tick-y")
            .text(0)
            .attr("x", 0)
            .attr("y", util.data(util.profit.fxn, params, yScalerTop)[params.q][1])
        
        // Bottom panel

        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.ac, params, yScalerBottom, util.gray)
            .call(draw.addCurveFull, id, util.mc, params, yScalerBottom, util.gray);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.price, params, yScalerBottom)
            .call(draw.addCurve, id, util.supply, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.price, params, yScalerBottom)
            .call(draw.yGuide, util.ac, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        // Vertical portion of supply curve

        panelBottom.append("g")
            .attr("id", `${ util.supply.id }-${ id }`)
            .call(draw.clipWide, id)
            .append("path")
            .attr("class", "curve colored")
            .attr("d", util.line([
                [0, util.dim.panelHeight], 
                [0, yScalerBottom(util.avcFxn({ q: util.qShutDown() }))], 
                [1, yScalerBottom(util.avcFxn({ q: util.qShutDown() }))]
            ]))
            .style("stroke", util.supply.scheme.base)
            .on("mousemove", (event) => {
            
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.colored`)
                    .classed("hovered", true)
                    .style("stroke", util.supply.scheme.baseSelect);
    
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.dulled`)
                    .classed("hovered", true)
                    .style("stroke", util.supply.scheme.dullSelect);
    
                util.tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .style("display", "block")
                    .text(util.supply.label);
            })
            .on("mouseleave", (event) => {
            
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.colored`)
                    .classed("hovered", false)
                    .style("stroke", util.supply.scheme.base);
    
                d3.selectAll(`#${ util.supply.id }-${ id } .curve.dulled`)
                    .classed("hovered", false)
                    .style("stroke", util.supply.scheme.dull);
    
                util.tooltip.style("display", "none");
            });

        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AV, AVC", 
                util.xScaler(95) + 10, 
                yScalerBottom(util.avcFxn({ q: 95 })) + 10
            )
            .call(
                draw.addLabel, "Supply", 
                util.xScaler(69) + 10, 
                yScalerBottom(util.mcFxn({ q: 69 })) -25, 
                "middle"
            );
    }

    return container.node();
}

// Figure 8 /////////////////////////////////////

export function figure8(container) {

    let panelSelect = "price-taker";
    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitles = { x: "Output", y: "$" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-q", "Output", 0, util.max.q, 1, 42);
    
    // Tabset

    const tabset = container.append("div")
        .attr("class", "tabset")
    tabset.append("div")
        .attr("class", "tab-btn active")
        .attr("panel", "price-taker")
        .text("Price-taker");
    tabset.append("div")
        .attr("class", "tab-btn")
        .attr("panel", "price-setter")
        .text("Price-setter");
    
    // Diagram

    const yScaler = d3.scaleLinear()
        .domain([0, util.acFxn({ q: util.max.q, fc: util.max.fc })])
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
        .attr("transform", `translate(${ util.margin.left }, ${ util.margin.top })`);
    
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

    d3.selectAll("#fig-08 .tab-btn").on("click", switchPanel);
    d3.selectAll("#fig-08 .tab-btn").on("keydown", (event) => {
        if (event.key === "Enter") {
            switchPanel();
        }
    });
    
    function switchPanel() {
        d3.selectAll("#fig-08 .tab-btn").classed("active", false);
        d3.select(this).classed("active", true);
        panelSelect = d3.select(this).attr("panel");
        render(panelSelect);
    }

    function render(panelSelect) {
        if (panelSelect == "price-taker") {
            renderTaker();
        } else if (panelSelect == "price-setter") {
            renderSetter();
        }
    }

    function renderTaker() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        params.p = 15;
        
        panel.selectAll("g").remove();
            
        panel.append("g")
            .call(draw.panelAxes, axisTitles)
            .call(draw.yGuide, util.mr, params, yScaler)
            .call(draw.xGuides, util.mr, params, yScaler, 1)
            .call(draw.addCurve, id, util.mr, params, yScaler);
        
        panel.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price = Demand = MR", 
                util.xScaler(55), 
                yScaler(params.p) - 20
            );
    }

    function renderSetter() {

        params.q = +formsBox.select('input[name="Output"]').property("value");
        params.p = +util.demandMonoFxn({ q: params.q });
        
        panel.selectAll("g").remove();
            
        panel.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.mrMono, params, yScaler)
            .call(draw.yGuide, util.demandMono, params, yScaler);
        
        panel.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.mr, params, yScaler, util.gray)
            .call(draw.addCurve, id, util.mrMono, params, yScaler)
            .call(draw.addCurve, id, util.demandMono, params, yScaler);

        panel.append("g")
            .call(draw.panelAxes, axisTitles)
            .call(draw.xGuides, util.demandMono, params, yScaler, 1)
        
        panel.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScaler(params.p)
            )
            .call(
                draw.addLabel, "Demand", 
                util.xScaler(66) + 10, 
                yScaler(util.demandMonoFxn({ q: 66 })) - 10
            )
            .call(
                draw.addLabel, "MR", 
                util.xScaler(33) + 10, 
                yScaler(util.mrMonoFxn({ q: 33 })) - 10
            );
            
    }

    return container.node();
}

// Figure 9 /////////////////////////////////////

export function figure9(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-p", "Price", 0, util.max.p, .1, 15);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 180);

    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-1000, 400])
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

    render();

    formsBox.select('input[name="Price"]').on("input", render);
    formsBox.select('input[name="Fixed costs"]').on("input", render);

    function render() {

        params.p = +formsBox.select('input[name="Price"]').property("value");
        params.fc = +formsBox.select('input[name="Fixed costs"]').property("value");
        params.q = util.demandMonoFxnInv({ p: params.p });
        
        const corners = { 
            x1: 0, 
            y1: yScalerBottom(params.p), 
            x2: util.xScaler(params.q), 
            y2: yScalerBottom(util.acFxn(params)) 
        };

        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profitMono, params, yScalerTop)
            .call(draw.yGuide, util.profitMono, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profitMono, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitFxn({ q: 70, p: params.p, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.addArea, id, util.profitMono, corners)
            .select("path")
            .classed("invert", corners.y1 < corners.y2 ? false : true);
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.mr, params, yScalerBottom, util.gray)
            .call(draw.addCurve, id, util.ac, params, yScalerBottom)
            .call(draw.addCurve, id, util.mc, params, yScalerBottom)
            .call(draw.addCurve, id, util.demandMono, params, yScalerBottom)
            .call(draw.addCurve, id, util.mrMono, params, yScalerBottom)
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.ac, params, yScalerBottom)
            .call(draw.yGuide, util.mc, params, yScalerBottom)
            .call(draw.yGuide, util.demandMono, params, yScalerBottom)
            .call(draw.yGuide, util.mrMono, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            )
            .call(
                draw.addLabel, "Demand", 
                util.xScaler(84) + 10, 
                yScalerBottom(util.demandMonoFxn({ q: 84 })) - 10
            )
            .call(
                draw.addLabel, "MR", 
                util.xScaler(45) + 10, 
                yScalerBottom(util.mrMonoFxn({ q: 45 })) - 10
            );
    }

    return container.node();
}

// Figure 10 ////////////////////////////////////

export function figure10(container) {

    let panelSelect = "monopoly-outcome";
    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: 180, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Tabset

    const tabset = container.append("div")
        .attr("class", "tabset")
    tabset.append("div")
        .attr("class", "tab-btn active")
        .attr("panel", "monopoly-outcome")
        .text("Monopoly outcome");
    tabset.append("div")
        .attr("class", "tab-btn")
        .attr("panel", "social-optimum")
        .text("Social optimum");
    
    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-1000, 400])
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

    d3.selectAll("#fig-10 .tab-btn").on("click", switchPanel);
    d3.selectAll("#fig-10 .tab-btn").on("keydown", (event) => {
        if (event.key === "Enter") {
            switchPanel();
        }
    });
    
    function switchPanel() {
        d3.selectAll("#fig-10 .tab-btn").classed("active", false);
        d3.select(this).classed("active", true);
        panelSelect = d3.select(this).attr("panel");
        render(panelSelect);
    }

    function render(panelSelect) {
        if (panelSelect == "monopoly-outcome") {
            renderMonopoly();
        } else if (panelSelect == "social-optimum") {
            renderOptimum();
        }
    }

    function renderMonopoly() {

        params.p = 15.5;
        params.q = util.demandMonoFxnInv({ p: params.p });
        
        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurveFull, id, util.profitMono, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop);
        
        panelTop.append("g")
            .call(draw.yGuide, util.profitMono, params, yScalerTop)
            .call(draw.xGuides, util.profitMono, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitMonoFxn({ q: 70, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.mc, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.demandMono, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.mrMono, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.demandMono, params, yScalerBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            )
            .call(
                draw.addLabel, "Demand", 
                util.xScaler(84) + 10, 
                yScalerBottom(util.demandMonoFxn({ q: 84 })) - 10
            )
            .call(
                draw.addLabel, "MR", 
                util.xScaler(45) + 10, 
                yScalerBottom(util.mrMonoFxn({ q: 45 })) - 10
            );
    }

    function renderOptimum() {

        params.p = 11.5;
        params.q = util.demandMonoFxnInv({ p: params.p });
        
        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurveFull, id, util.profitMono, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop);
        
        panelTop.append("g")
            .call(draw.yGuide, util.profitMono, params, yScalerTop)
            .call(draw.xGuides, util.profitMono, params, yScalerTop);

        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitMonoFxn({ q: 70, fc: params.fc })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.mc, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.demandMono, params, yScalerBottom)
            .call(draw.addCurveFull, id, util.mrMono, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.demandMono, params, yScalerBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            )
            .call(
                draw.addLabel, "Demand", 
                util.xScaler(84) + 10, 
                yScalerBottom(util.demandMonoFxn({ q: 84 })) - 10
            )
            .call(
                draw.addLabel, "MR", 
                util.xScaler(45) + 10, 
                yScalerBottom(util.mrMonoFxn({ q: 45 })) - 10
            );
    }

    return container.node();
}

// Figure 11 /////////////////////////////////////

export function figure11(container) {

    const id = d3.randomInt(100000, 1000000)();
    const params = { q: null, fc: null, p: null, c: null };
    const axisTitlesTop = { x: "Output", y: "$" };
    const axisTitlesBottom = { x: "Output", y: "$/unit" };

    // Forms

    const formsBox = container.append("div").attr("class", "forms");
    formsBox.call(forms.addForm, id + "-c", "Market size", 16.8, util.max.c, .1, 25);
    formsBox.call(forms.addForm, id + "-fc", "Fixed costs", 0, util.max.fc, 1, 0, true);

    // Diagram

    const yScalerTop = d3.scaleLinear()
        .domain([-1000, 400])
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

    render();

    formsBox.select('input[name="Market size"]').on("input", render);

    function render() {

        params.c = +formsBox.select('input[name="Market size"]').property("value");
        params.q = util.qMonoComp(params.c);
        params.p = util.pMonoComp({ q: params.q, c: params.c });
        
        util.demandMonoComp.fxn = util.demandMonoCompFxn;
        util.mrMonoComp.fxn = util.mrMonoCompFxn;
        util.profitMonoComp.fxn = util.profitMonoCompFxn;

        const corners = { 
            x1: 0, 
            y1: yScalerBottom(params.p), 
            x2: util.xScaler(params.q), 
            y2: yScalerBottom(util.acFxn(params)) 
        };

        // Top panel
        
        panelTop.selectAll("g").remove();

        panelTop.append("g")
            .call(draw.clipWide, id)
            .call(draw.addCurve, id, util.profitMonoComp, params, yScalerTop)
            .call(draw.yGuide, util.profitMonoComp, params, yScalerTop);
        
        panelTop.append("g")
            .call(draw.panelAxesT, axisTitlesTop, yScalerTop)
            .call(draw.xGuides, util.profitMonoComp, params, yScalerTop);
        
        panelTop.append("g")
            .attr("id", `labels-${ id }`)
            .call(draw.clipWide, id)
            .call(
                draw.addLabel, "Profit", 
                util.xScaler(70) + 10, 
                yScalerTop(util.profitMonoCompFxn({ q: 70, fc: params.fc, c: params.c })) - 10
            );
        
        // Bottom panel

        panelBottom.selectAll("g").remove();

        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.addArea, id, util.profitMono, corners)
            .select("path")
            .classed("invert", corners.y1 < corners.y2 ? false : true);
        
        panelBottom.append("g")
            .call(draw.clip, id)
            .call(draw.addCurveFull, id, util.price, params, yScalerBottom, util.gray)
            .call(draw.addCurve, id, util.ac, params, yScalerBottom)
            .call(draw.addCurve, id, util.mc, params, yScalerBottom)
            .call(draw.addCurve, id, util.demandMonoComp, params, yScalerBottom)
            .call(draw.addCurve, id, util.mrMonoComp, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.clipWide, id)
            .call(draw.yGuide, util.ac, params, yScalerBottom)
            .call(draw.yGuide, util.demandMonoComp, params, yScalerBottom);
        
        panelBottom.append("g")
            .call(draw.panelAxes, axisTitlesBottom);
        
        panelBottom.append("g")
            .attr("id", `labels-${ id }`)
            .call(
                draw.addLabel, "Price", 
                util.dim.width + 10, 
                yScalerBottom(params.p)
            )
            .call(
                draw.addLabel, "AC", 
                util.xScaler(95) - 10, 
                yScalerBottom(util.acFxn({ q: 95, fc: params.fc })) - 10, 
                "end"
            )
            .call(
                draw.addLabel, "MC", 
                util.xScaler(63) + 10, 
                yScalerBottom(util.mcFxn({ q: 63 })) + 10
            )
            .call(
                draw.addLabel, "Demand", 
                util.xScaler(util.demandMonoCompInvFxn({ dmd: 1, c: params.c })) + 10, 
                yScalerBottom(1) - 10
            )
            .call(
                draw.addLabel, "MR", 
                util.xScaler(util.mrMonoCompInvFxn({ mr: 1, c: params.c })) + 10,
                yScalerBottom(1) - 10
            );
    }

    return container.node();
}