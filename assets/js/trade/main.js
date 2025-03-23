import { tradeIcon } from "../icons/trade-icon.js";

// Render elements //////////////////////////////

d3.select(".trade-icon").call(tradeIcon);
d3.select(".graphic-container").call(tradeNetwork);

// Load data ////////////////////////////////////

export function tradeNetwork(container) {
    
    Promise.all([
        
        d3.csv("/assets/data/trade-nodes.csv"),
        d3.csv("/assets/data/trade-links.csv"),
        d3.json("/assets/data/world_map.json")
        
    ]).then(function([nodesRaw, linksRaw, mapRaw]) {
        
        const links = linksRaw.map(d => ({
            source: +d.source,
            target: +d.target,
            v: +d.v
        }));
        
        const nodes = nodesRaw.map(d => ({
            id: +d.id,
            name: d.country,
            v: +d.v,
            coords: [+d.lon, +d.lat]
        }));
        nodes.sort((a, b) => d3.descending(a.v, b.v));

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
        radiusMin: 2, 
        radiusMax: 40
    };

    // Data

    const minLinkValue = d3.min(links, d => d.v);
    const maxLinkValue = d3.max(links, d => d.v);
    const minNodeValue = d3.min(nodes, d => d.v);
    const maxNodeValue = d3.max(nodes, d => d.v);

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
        .center([params.pushleft, params.pushdown])

    const path = d3.geoPath().projection(projection);

    const countries = svg.append("g")
        .selectAll("country")
        .data(map)
        .join("path")
        .attr("class", "land")
        .attr("d", path);

    // Forces

    const forceNode = d3.forceManyBody().strength(-45);
    const forceLink = d3.forceLink(links).id(d => d.id);
    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center",  d3.forceCenter())
        .alphaDecay(0);
    
    // Nodes and links – initial rendering

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", d => "link id-" + nodes.find((node) => node.id == d.target.id).id)
        .attr("stroke-width", d => strokeScaler(d.v))
        .attr("x1", d => projection(nodes.find((node) => node.id == d.source.id).coords)[0])
        .attr("x2", d => projection(nodes.find((node) => node.id == d.target.id).coords)[0])
        .attr("y1", d => projection(nodes.find((node) => node.id == d.source.id).coords)[1])
        .attr("y2", d => projection(nodes.find((node) => node.id == d.target.id).coords)[1]);  

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("class", "node")
        .attr("r", d => rScaler(d.v))
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1])
        .attr("value", d => d.id)
        .attr("name", d => d.name)
        .on("mousemove", mouseMoved)
        .on("mouseleave", mouseLeft);

    hoverDemo();
    
    // Toggle

    const toggle = d3.select("#toggle")
    let checked = toggle.property("checked");
    
    toggle.on("change", () => {
        if (checked) {
            renderMap();
            d3.select(".toggle-label.left").classed("on", true);
            d3.select(".toggle-label.right").classed("on", false);
        } else {
            renderNetwork();
            d3.select(".toggle-label.left").classed("on", false);
            d3.select(".toggle-label.right").classed("on", true);
        }
        checked = !checked;
        toggle.property("checked", checked);
    })

    // Render functions

    function renderMap() {

        removeDemo();
        hoverDemo();
        simulation.stop();

        countries.transition().ease(d3.easeLinear).duration(500)
            .style("opacity", 1);

        d3.selectAll(".graphic-container .link").classed("in-force", false);

        node.call(d3.drag().on("start", null));

        node.transition().ease(d3.easeLinear).duration(250)
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1]);

        
        link.transition().transition().ease(d3.easeLinear).duration(250)
            .attr("x1", d => projection(nodes.find((node) => node.id == d.source.id).coords)[0])
            .attr("x2", d => projection(nodes.find((node) => node.id == d.target.id).coords)[0])
            .attr("y1", d => projection(nodes.find((node) => node.id == d.source.id).coords)[1])
            .attr("y2", d => projection(nodes.find((node) => node.id == d.target.id).coords)[1]);
    };

    function renderNetwork() {

        countries.transition().ease(d3.easeLinear)
            .style("opacity", 0);

        d3.selectAll(".link").classed("in-force", true);
        
        simulation.on("tick", ticked).alpha(1).restart();

        node.call(drag(simulation));

        removeDemo();
        dragDemo();
    };
    
    function ticked() {
            
        node.transition().ease(d3.easeLinear)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        link.transition().ease(d3.easeLinear)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    };

    function mouseMoved(event) {

        // Highlight selected node
        d3.select(this).classed("highlight", true);

        // Highlight links
        let selected = d3.select(this).attr("value");
        d3.selectAll(".id-" + selected).classed("highlight", true);

        // Highlight linked source nodes
        let linksFilter = links.filter(d => d.target.id == selected);
        let sourceNodes = linksFilter.map(d => d.source.id);
        sourceNodes = sourceNodes.map(id => `.node[value="${id}"]`).join(',');
        d3.selectAll(sourceNodes).classed("sourced", true);

        // Tooltip
        let name = d3.select(this).attr("name")
        d3.select(".tooltip")
            .style("display", "block")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 1 + "px")
            .html(`<p class="tooltip-text">${name}</p>`);
    };

    function mouseLeft() {
        d3.selectAll(".graphic-container .highlight")
            .classed("highlight", false);
        d3.selectAll(".graphic-container .sourced")
            .classed("sourced", false);
        d3.select(".tooltip").style("display", "none");
    };

    return container.node();
};


// Functions ////////////////////////////////////

function drag(simulation) {

    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        d3.select(this).classed("highlight", true);
        let selected = d3.select(this).attr("value");
        d3.selectAll(".link.id-" + selected).classed("highlight", true);
    }
    
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
        d3.selectAll(".graphic-container .highlight")
            .classed("highlight", false);
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
};

function dragDemo() {
    const container = d3.select(".graphic-container").append("div")
        .attr("class", "demo drag");
    container.append("div").attr("class", "demo-text")
        .text("Try dragging")
    const graphic = container.append("div").attr("class", "demo-graphic")

    graphic.append("div").attr("class", "demo-node")
    graphic.append("img")
        .attr("src", "../assets/images/cursor.svg")
};

function hoverDemo() {
    const container = d3.select(".graphic-container").append("div")
    .attr("class", "demo hover");
    container.append("div").attr("class", "demo-text")
    .text("Try hovering")
    const graphic = container.append("div").attr("class", "demo-graphic")
    
    graphic.append("div").attr("class", "demo-node")
    graphic.append("img")
    .attr("src", "../assets/images/cursor.svg")
};

function removeDemo() {
    d3.select(".graphic-container .demo").remove();
}