import { remittancesIcon } from "../icons/remittances-icon.js";

// Render elements //////////////////////////////

d3.select(".remittances-icon").call(remittancesIcon);
d3.select(".graphic-container").call(remittancesNetwork);

// // Load data ////////////////////////////////////

export function remittancesNetwork(container) {
    
    Promise.all([
        
        d3.csv("/assets/data/remt-nodes.csv"),
        d3.csv("/assets/data/remt-links.csv"),
        d3.json("/assets/data/world_map.json")
        
    ]).then(function([nodesRaw, linksRaw, mapRaw]) {
        
        const links = linksRaw.map(d => ({
            source: d.from,
            target: d.to,
            share: d.share
        }));
        
        const nodes = nodesRaw.map(d => ({
            iso: d.iso,
            name: d.label,
            size: isNaN(+d.size) ? 0 : +d.size,
            coords: [+d.longitude, +d.latitude]
        }));
        nodes.sort((a, b) => d3.descending(a.size, b.size));

        const map = topojson.feature(mapRaw, mapRaw.objects.countries).features;
        
        console.log(nodes);
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
        .center([params.pushleft, params.pushdown])

    const path = d3.geoPath().projection(projection);

    const countries = svg.append("g")
        .selectAll("country")
        .data(map)
        .join("path")
        .attr("class", "land")
        .attr("d", path);

    // Forces


    console.log("Nodes: " + nodes)

    const forceNode = d3.forceManyBody()
        .strength(-35);
    const forceLink = d3.forceLink(links).id(d => d.iso);
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
        .attr("class", d => "link " + nodes.find((node) => node.iso == d.target.iso).iso)
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
        .attr("cy", d => projection(d.coords)[1])
        .attr("value", d => d.iso)
        .attr("name", d => d.name)
        .on("mousemove", mouseMoved)
        .on("mouseleave", mouseLeft);

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

        simulation.stop();

        countries.transition().ease(d3.easeLinear).duration(500)
            .style("opacity", 1);

        d3.selectAll(".link").classed("in-force", false);

        node.transition().ease(d3.easeLinear).duration(250)
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1]);

        link.transition().transition().ease(d3.easeLinear).duration(250)
            .attr("x1", d => projection(nodes.find((node) => node.iso == d.source.iso).coords)[0])
            .attr("x2", d => projection(nodes.find((node) => node.iso == d.target.iso).coords)[0])
            .attr("y1", d => projection(nodes.find((node) => node.iso == d.source.iso).coords)[1])
            .attr("y2", d => projection(nodes.find((node) => node.iso == d.target.iso).coords)[1])
    };

    function renderNetwork() {

        countries.transition().ease(d3.easeLinear)
            .style("opacity", 0);

        d3.selectAll(".link").classed("in-force", true);
        
        simulation.on("tick", ticked).alpha(1).restart();

        node.call(drag(simulation))
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

    function mouseMoved(event, d) {
        d3.select(this).classed("highlight", true);
        let selected = d3.select(this).attr("value");
        d3.selectAll("." + selected).classed("highlight", true);
        let name = d3.select(this).attr("name")
        d3.select(".tooltip")
            .style("display", "block")
            .style("left", event.pageX + 18 + "px")
            .style("top", event.pageY + 18 + "px")
            .html(name)
    };

    function mouseLeft() {
        d3.selectAll(".graphic-container .highlight")
            .classed("highlight", false);
    };

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
            d3.selectAll("." + selected).classed("highlight", true);
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

    return container.node();
};