import { spike, spikeheight, spikewidth } from "./spike.js";
import { zoompanel } from "./zoompanel.js";
import { mmp } from "../icons/mmp-icon.js";

// Icon
d3.select(".mmp-icon").call(mmp);

// Load data

Promise.all([
    
    d3.json("/assets/data/world_map.json"),
    d3.csv("/assets/data/mmp-2025-03-10.csv"),
    
]).then(function([mapRaw, dataRaw]) {
    
    const map = topojson.feature(mapRaw, mapRaw.objects.countries).features;
    
    const data = dataRaw.map(d => ({ 
        year: d.year,
        n: +d.n, 
        coordinates: [d.lon, d.lat] 
    }));
    
    drawGlobe(map, data); 
});

// Render graphic

function drawGlobe(map, dataAll) {

    const params = {
        width: 1000,
        height: 800,
        scale: 350,
        maxcount: d3.max(dataAll, d => d.n),
        sensitivity: 75
    };

    let rotationOn = true;

    const container = d3.select(".graphic-container");

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("viewBox", [0, 0, params.width, params.height]);

    // Map

    let projection = d3.geoOrthographic()
        .scale(params.scale)
        .center([0, 0])
        .rotate([0, -10])
        .translate([params.width / 2, params.height / 2]);

    let path = d3.geoPath().projection(projection);

    const graticule = d3.geoGraticule();

    let currentScale = projection.scale();
    let rotate = projection.rotate();

    let globe = svg.append("circle")
        .attr("class", "globe")
        .attr("cx", params.width / 2)
        .attr("cy", params.height / 2)
        .attr("r", projection.scale());

    svg.append("g")
        .append("path")
        .datum(graticule())
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("g")
        .selectAll("country")
        .data(map)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", path);

    const spikes = svg.append("g");

    // Pan and zoom
  
    const drag = d3.drag().on("drag", dragged);
    const zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", zoomed);
    svg.call(drag);
    svg.call(zoom);

    // Control panel

    const controlPanel = d3.select(".graphic-container")
        .append("div")
        .attr("class", "control-panel")
    
    const controlPanelSVG = controlPanel.append("svg")
        .attr("width", 100)
        .attr("height", 75);

    controlPanelSVG.append("g")
        .attr("class", "zoom-panel")
        .attr("transform", "translate(65,1)")
        .call(zoompanel);

    controlPanelSVG.select("#buttonplus")
        .on("click", () => {
            rotationOn = false;
            svg.transition().duration(300).call(zoom.scaleBy, 1.5);
            updateSpinButton();
        });
    
    controlPanelSVG.select("#buttonminus")
        .on("click", () => {
            rotationOn = false;
            svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.5);
            updateSpinButton();
        });

    controlPanelSVG.select("#buttonreset")
        .on("click", () => {
            rotationOn = false;
            svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
            updateSpinButton();
        });

    const spinButton = controlPanelSVG.append("g")
        .attr("class", "spin-button")
        .attr("transform", "translate(0,5)")

    spinButton.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("height", 20)
        .attr("width", 55)
        .attr("ry", 2);
        
    const spinText = spinButton.append("text")
        .attr("x", 55 / 2).attr("y", 15)
        .attr("text-anchor", "middle")
        .text("Pause");
    
    controlPanelSVG.append("g")
        .append("rect")
        .attr("transform", "translate(0,5)")
        .attr("x", 0).attr("y", 0)
        .attr("height", 20)
        .attr("width", 55)
        .attr("opacity", 0)
        .style("cursor", d => "pointer")
        .on("mouseover", () => spinText.style("fill-opacity", .8))
        .on("mouseleave", () => spinText.style("fill-opacity", .3))
        .on("click", () => {
            rotationOn = !rotationOn;
            updateSpinButton();
        });

    update();

    // Spin
    
    const revolutionDuration = 30000;
    let t1, dt, steps, xPos, yPos, t0, oldPos;
    t0 = 0;
    oldPos = 0;

    d3.timer((elapsed) => {
        
        if (rotationOn) {

            t1 = elapsed;
            steps = (t0 - elapsed) * 360 / revolutionDuration;
            xPos = rotate[0] - steps
            if (xPos <= -180) {xPos = xPos + 360};

            const scale = projection.scale();
            projection.rotate(rotate);
            
            svg.selectAll("path.land").attr("d", path);    
            svg.selectAll("path.graticule").attr("d", path);

            update();
            
            t0 = t1;
            rotate[0] = xPos;

        } else t0 = elapsed;
    });

    // Functions

    function dragged(event) {

        rotationOn = false;
        updateSpinButton();
        
        rotate = projection.rotate();
        const k = params.sensitivity / projection.scale();
        
        projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
        path = d3.geoPath().projection(projection);
        
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll("path.graticule").attr("d", path);
        update();
    };
      
    function zoomed(event) {

        rotationOn = false;
        updateSpinButton();
        
        projection.scale(currentScale * event.transform.k);
        const newScale = projection.scale();
        path = d3.geoPath().projection(projection);
        
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll("path.graticule").attr("d", path);
        globe.attr("r", newScale);
        update();
    };

    function updateSpinButton() {
        d3.select(".spin-button text").text(rotationOn ? "Pause" : "Spin");
    };

    function update() {
        
        spikes.selectAll(".spike").remove();
        spikes.selectAll(".spike")
            .data(dataAll)
            .join("polyline")
            .attr("class", "spike")
            .classed("hide", d => !path({ type: "Point", coordinates: d.coordinates }))
            .style("fill-opacity", d => opacityScale(d.year))
            .style("stroke-opacity", d => opacityScale(d.year))
            .attr("points", d => {
                const p = projection(d.coordinates);
                const a = geometric.lineAngle([[params.width / 2, params.height / 2], p]);
                return spike()
                    .x(p[0]).y(p[1])
                    .angle(a)
                    .width(spikewidth(projection.scale()))
                    .height(spikeheight(d.n))();
            });
    };
};


const opacityScale = d3.scaleLinear()
    .domain(d3.range(2014, 2024))
    .range([0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.6, 0.6, 0.8, 0.8, 1.0])
