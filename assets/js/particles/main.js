import { popden } from "../icons/popden-icon.js";
import * as colors from "../colors.js";

d3.select(".page-icon").call(popden);

// Dashboard ////////////////////////////////////

const params = { 
    width: 475, 
    height: 400, 
    rMean: 5
};
params.rSD = params.rMean * .75;
params.velocity = params.rMean * .80;

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

// Render panels ////////////////////////////////

const panelLeft = d3.select(".graphic-container .panel-left")
    .append("svg")
    .attr("viewBox", [0, 0, params.width, params.height]);

const panelRight = d3.select(".graphic-container .panel-right")
    .append("svg")
    .attr("viewBox", [0, 0, params.width, params.height]);

Promise.all([

    d3.csv("./../../assets/data/particles-density.csv"),
    d3.csv("./../../assets/data/particles-group-assign.csv")

]).then(function([density, groupAssign]) {
    
    const densityManila = density.filter(d => d.country === "Philippines");
    const densityOthers = density.filter(d => d.country !== "Philippines");
    
    // Forms
    const formLeft = d3.select(".graphic-container .form-left")
        .call(addFormDropdown, densityManila)
    const formRight = d3.select(".graphic-container .form-right")
        .call(addFormDropdown, densityOthers)

    // Default values
    formLeft.select("option[value='Manila']").attr("selected", true);
    formRight.select("option[value='New York']").attr("selected", true);
    
    // Update chart when form changes
    formLeft.select("select").on("input", renderLeft);
    formRight.select("select").on("input", renderRight);
    
    function renderLeft() {

        let city = formLeft.select("select").property("value");
        let density = densityManila.filter(d => d.city == city)[0].density;
        let stat = d3.format(",.2r")(density);

        panelLeft.selectAll("g").remove();
        panelLeft.call(addParticles, density, groupAssign, city);

        d3.select(".statistic-left")
            .style("opacity", 0)
            .html(`<strong>${ stat }</strong> people/km²`)
            .transition().duration(400)
            .style("opacity", 1)
    };

    function renderRight() {

        let city = formRight.select("select").property("value");
        let density = densityOthers.filter(d => d.city == city)[0].density;
        let stat = d3.format(",.2r")(density);

        panelRight.selectAll("g").remove();
        panelRight.call(addParticles, density, groupAssign, city);

        d3.select(".statistic-right")
            .style("opacity", 0)
            .html(`<strong>${ stat }</strong> people/km²`)
            .transition().duration(400)
            .style("opacity", 1);
    };

    renderLeft();
    renderRight();
});

// Functions ////////////////////////////////////

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

function genpoints(density, assign, city) {

    // Function to generate particles for a given city

    const densityRound = Math.round(density / 100);
    const groupAssignCity = assign.filter(d => d.city === city);

    const counts = groupAssignCity.map(row => row.points_ingroup);
    const groups = [1, 2, 3, 4, 5];
    const groupArray = counts.flatMap((count, i) =>
        Array.from({ length: count }, () => groups[i])
    );
    
    const points = Array.from(
        { length: densityRound },
        (_, i) => ({
            x: d3.randomUniform((params.width * .15), (params.width * .85))(),
            y: d3.randomUniform(params.height * .15, params.height * .85)(),
            r: Math.max(.1, d3.randomNormal(params.rMean, params.rSD)()),
            vx: d3.randomUniform(-1, 1)() * params.velocity,
            vy: d3.randomUniform(-1, 1)() * params.velocity,
            group: groupArray[i]
        })
    );

    return points;
}

function addParticles(container, density, assign, city) {

    // Function to generate particles chart

    const nodes = genpoints(density, assign, city).map(Object.create);

    const panel = container.append("g");
;
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
        .force("limit", d3.forceLimit()
            .x0(0).x1(params.width).y0(0).y1(params.height))
        .alphaDecay(0)
        .velocityDecay(0)
        .on("tick", () => { node.attr("cx", d => d.x).attr("cy", d => d.y) });
}
