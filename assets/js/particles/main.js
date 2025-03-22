import { popden } from "../icons/popden-icon.js";
import { addFormsAnnotation, addLegendAnnotation } from "./annotations.js";
import * as colors from "../colors.js";

// Icon ///////////////////////////////////////////////////////////////////////

d3.select(".page-icon").call(popden);

// Dashboard //////////////////////////////////////////////////////////////////

const params = { 
    width: 450, 
    height: 400, 
    formLabelsHeight: 110,
    legendWidth: 450,
    legendHeight: 40,
    rMean: 5
};
params.rSD = params.rMean * .75;
params.velocity = params.rMean * .80;

d3.select("#particles-container .annotation.annotation-forms")
    .call(addFormsAnnotation, params);

const color = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 5])
    .range([
        colors.blue[3],
        colors.green[4],
        colors.yellow[3],
        colors.red[2],
        colors.red[3]
    ]);

const bbox = ([[x1, y1], [x2, y2]]) => [
    { from: { x: x1, y: y1 }, to: { x: x1, y: y2 } },
    { from: { x: x1, y: y2 }, to: { x: x2, y: y2 } },
    { from: { x: x2, y: y2 }, to: { x: x2, y: y1 } },
    { from: { x: x2, y: y1 }, to: { x: x1, y: y1 } }
];

// Render panels //////////////////////////////////////////////////////////////

const panelLeft = d3.select("#particles-container .panel-left")
    .append("svg")
        .attr("width", params.width)
        .attr("height", params.height)
        // .attr("width", 100%)
        // .attr("height", params.height)
        .attr("viewBox", [0, 0, params.width, params.height]);

const panelRight = d3.select("#particles-container .panel-right")
    .append("svg")
        .attr("width", params.width)
        .attr("height", params.height)
        .attr("viewBox", [0, 0, params.width, params.height]);

panelLeft.append("rect")
    .attr("class", "panel-bg")
    .attr("width", params.width)
    .attr("height", params.height);

panelRight.append("rect")
    .attr("class", "panel-bg")
    .attr("width", params.width)
    .attr("height", params.height);

Promise.all([

    d3.csv("./../../assets/data/particles-density.csv"),
    d3.csv("./../../assets/data/particles-group-assign.csv")

]).then(function([density, groupAssign]) {
    
    const densityManila = density.filter(d => d.country === "Philippines");
    const densityOthers = density.filter(d => d.country !== "Philippines");
    
    // Forms
    const formLeft = d3.select("#particles-container .form-left")
        .call(addFormDropdown, densityManila)
    const formRight = d3.select("#particles-container .form-right")
        .call(addFormDropdown, densityOthers)

    // Default values
    formLeft.select("option[value='Manila']").attr("selected", true);
    formRight.select("option[value='New York']").attr("selected", true);

    // Update chart when form changes
    formLeft.select("select").on("input", renderLeft);
    formRight.select("select").on("input", renderRight);
    
    function renderLeft() {
        let cityLeft = formLeft.select("select").property("value");
        panelLeft.selectAll("g").remove();
        panelLeft.call(addParticles, densityManila, groupAssign, cityLeft);
    };

    function renderRight() {
        let cityRight = formRight.select("select").property("value");
        panelRight.selectAll("g").remove();
        panelRight.call(addParticles, densityOthers, groupAssign, cityRight);
    };

    renderLeft();
    renderRight();
})


// Legend /////////////////////////////////////////////////////////////////////

const legend = d3.select("#particles-container .legend")
    .append("svg")
        .attr("width", params.legendWidth)
        .attr("height", params.legendHeight)
        .attr("viewBox", [0, 0, params.legendWidth, params.legendHeight])

legend.call(addLegend);

d3.select("#particles-container .annotation.annotation-legend")
    .call(addLegendAnnotation, params);


// Functions //////////////////////////////////////////////////////////////////

function addFormDropdown(container, data) {
  
    const dropdown = container.append("form")
        .attr("id", "particles-dropdown")
        .attr("class", "select")
        .attr("margin-top", "10px");

    const addOption = (form, name) => {
        form.append("option")
            .text(name)
            .attr("value", name);
    };

    const dropdownOptions = dropdown.append("div").append("select");

    data.forEach(d => dropdownOptions.call(addOption, d.city));

    return container.node();
};

function genpoints(data, assign, city) {

    // Function to generate particles for a given city

    const dataCity = data.filter(d => d.city == city);
    const density = Math.round(dataCity[0].density / 100);
    const groupAssignCity = assign.filter(d => d.city === city);

    const counts = groupAssignCity.map(row => row.points_ingroup);
    const groups = [1, 2, 3, 4, 5];
    const groupArray = counts.flatMap((count, i) =>
        Array.from({ length: count }, () => groups[i])
    );
    
    const points = Array.from(
        { length: density },
        (_, i) => ({
            x: d3.randomUniform((params.width * .15), (params.width * .85))(),
            y: d3.randomUniform(params.height * .15, params.height * .85)(),
            r: Math.max(.1, d3.randomNormal(params.rMean, params.rSD)()),
            vx: d3.randomUniform(-1, 1)() * params.velocity,
            vy: d3.randomUniform(-1, 1)() * params.velocity,
            group: groupArray[i]
        })
    );

    console.log("dataCity.density: " + dataCity.density);

    return points;
}

function addParticles(container, data, assign, city) {

    // Function to generate particles chart

    // Read data
    const dataCity = data.filter(d => d.city == city);
    const nodes = genpoints(data, assign, city).map(Object.create);

    const panel = container.append("g");

    // Bottom label
    const densityStat = d3.format(",.2r")(dataCity.density);
    panel.append("text")
        .attr("id", "chart-text")
        .attr("x", params.width / 2)
        .attr("y", params.height * 1.075)
        .attr("text-anchor", "middle")
        .text(`${ densityStat } people/km²`);

    // Draw particles
    const node = panel.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("fill", (d) => color(d.group));
    
    // Define forces
    d3.forceSimulation(nodes)
        .force("bounce", d3.forceBounce()
            .radius(d => d.r + .5))
        .force("surface", d3.forceSurface()
            .surfaces(bbox([[0, 0], [params.width, params.height]]))
            .oneWay(true)
            .radius(d => d.r + 1))
        .force('limit', d3.forceLimit()
            .x0(0).x1(params.width).y0(0).y1(params.height))
        .alphaDecay(0)
        .velocityDecay(0)
        .on("tick", () => { node.attr("cx", d => d.x).attr("cy", d => d.y) });
}

function addLegend(container) {
    
    const rLegend = .5;
    
    const native = container.append("g")
        .attr("transform", "translate(5, 20)")
    
    native.append("circle")
        .attr("cx", rLegend + "rem")
        .attr("cy", ".5rem")
        .attr("fill", color(1))
        .attr("r", rLegend + "rem");

    native.append("text")
        .attr("x", (rLegend * 3) + "rem")
        .attr("y", ".85rem")
        .attr("text-anchor", "left")
        .text("Native ancestors");

    const foreign = container.append("g")
        .attr("transform", "translate(200, 20)")

    foreign.append("g")
        .selectAll("circle")
        .data([1, 2, 3, 4])
        .join("circle")
        .attr("cx", d => (rLegend + (d - 1) * rLegend * 3) + "rem")
        .attr("cy", ".5rem")
        .attr("fill", d => color(d + 1))
        .attr("r", rLegend + "rem");

    foreign.append("text")
        .attr("x", (rLegend * 3 * 4) + "rem")
        .attr("y", ".85rem")
        .attr("text-anchor", "left")
        .text("Migrant ancestors");
};

