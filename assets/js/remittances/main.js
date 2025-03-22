import * as colors from "../colors.js";
import { remittancesIcon } from "../icons/remittances-icon.js";

// Render elements //////////////////////////////

d3.select(".remittances-icon").call(remittancesIcon);
// d3.select(".graphic-container").call(remittances);
d3.select(".network-container").call(remittancesNetwork);

// // Load data ////////////////////////////////////

export function remittancesNetwork(container) {
    
    Promise.all([
        
        d3.csv("/assets/data/remt-nodes-icon.csv"),
        d3.csv("/assets/data/remt-links-icon.csv"),
        d3.json("/assets/data/world_map.json")
        
    ]).then(function([nodesRaw, linksRaw, mapRaw]) {
        
        const links = linksRaw.map(d => ({
            source: d.from,
            target: d.to,
            share: d.share
        }));

        const nodes = nodesRaw.map(d => ({
            iso: d.iso,
            size: +d.size,
            coords: [+d.longitude, +d.latitude]
        }));

        const map = topojson.feature(mapRaw, mapRaw.objects.countries).features;
        
        drawNetwork(container, nodes, links, map);  
    });
};

function drawNetwork(container, nodes, links, map) {

    const dim = { width: 1000, height: 600 };
    const params = { 
        scale: 220, 
        pushleft: 180,
        pushdown: -50,
        linkWidthMin: 1,
        linkWidthMax: 20, 
        linkStrengthMin: 1,
        linkStrengthMin: 20, 
        radiusMin: 2, 
        radiusMax: 40
    };

    // Data

    // console.log(nodes);

    const minLinkValue = d3.min(links, d => 100 * +d.share);
    const maxLinkValue = d3.max(links, d => 100 * +d.share);
    const minNodeValue = d3.min(nodes, d => +d.size);
    const maxNodeValue = d3.max(nodes, d => +d.size);

    const strokeScaler = d3.scaleLinear()
        .domain([minLinkValue, maxLinkValue])
        .range([params.linkWidthMin, params.linkWidthMax]);

    const rScaler = d3.scaleLinear()
        .domain([minNodeValue, maxNodeValue])
        .range([params.radiusMin, params.radiusMax]);

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("viewBox", [-dim.width / 2, -dim.height / 2, dim.width, dim.height])
        
    svg.append("rect")
        .attr("class", "bg")
        .attr("x", -dim.width / 2)
        .attr("y", -dim.height / 2)
        .attr("width", dim.width)
        .attr("height", dim.height);
    
    // Map

    const projection = d3.geoNaturalEarth1()
        .scale(params.scale)
        .center([params.pushleft, params.pushdown]);

    const path = d3.geoPath().projection(projection);

    const countries = svg.append("g")
        .selectAll("country")
        .data(map)
        .join("path")
        .attr("class", "border")
        .attr("d", path);

    // Forces

    const forceNode = d3.forceManyBody().strength(-50);
    const forceLink = d3.forceLink(links).id(d => d.iso);
    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center",  d3.forceCenter());

    console.log(links)

    // Nodes and links

    const link = svg.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => strokeScaler(100 * d.share))
        .attr("x1", d => projection(nodes.find((node) => node.iso == d.source.iso).coords)[0])
        .attr("x2", d => projection(nodes.find((node) => node.iso == d.target.iso).coords)[0])
        .attr("y1", d => projection(nodes.find((node) => node.iso == d.source.iso).coords)[1])
        .attr("y2", d => projection(nodes.find((node) => node.iso == d.target.iso).coords)[1]);  

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("class", "node")
        .attr("r", d => rScaler(d.size))
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1]);

    // Toggle

    let toggleMap = false;

    const button = d3.select("#remittances-container button");
    
    button.on("click", () => {
        if (toggleMap) {
            renderMap();
            button.text("Force-directed");
        } else {
            renderNetwork();
            button.text("Geospatial");
        }
        toggleMap = !toggleMap;
    })

    // Render functions

    function renderMap() {

        simulation.stop();
        countries.transition().ease(d3.easeLinear).style("opacity", 1);

        node.transition().ease(d3.easeLinear)
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1]);

        link.transition().ease(d3.easeLinear)
            .attr("x1", d => projection(nodes.find((node) => node.iso == d.source.iso).coords)[0])
            .attr("x2", d => projection(nodes.find((node) => node.iso == d.target.iso).coords)[0])
            .attr("y1", d => projection(nodes.find((node) => node.iso == d.source.iso).coords)[1])
            .attr("y2", d => projection(nodes.find((node) => node.iso == d.target.iso).coords)[1]);  
    };

    function renderNetwork() {
        countries.transition().ease(d3.easeLinear).style("opacity", 0);
        simulation.on("tick", ticked).alpha(1).restart();
    };
    
    function ticked() {
            
        node
            .transition().ease(d3.easeLinear)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        link.transition().ease(d3.easeLinear)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

    };
    return container.node();
};