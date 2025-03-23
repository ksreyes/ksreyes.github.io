export function tradeIcon(container) {

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
        
        const map = topojson.feature(mapRaw, mapRaw.objects.countries).features;
        
        drawNetwork(container, nodes, links, map);  
    });
};

function drawNetwork(container, nodes, links, map) {

    const dim = { width: 120, height: 110 };
    const params = { 
        scale: 30, 
        pushleft: 10,
        pushdown: 0,
        radiusMin: 1, 
        radiusMax: 7
    };

    // Data

    const minNodeValue = d3.min(nodes, d => d.v);
    const maxNodeValue = d3.max(nodes, d => d.v);

    const rScaler = d3.scaleLinear()
        .domain([minNodeValue, maxNodeValue])
        .range([params.radiusMin, params.radiusMax]);

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("viewBox", [-dim.width / 2, -dim.height / 2, dim.width, dim.height]);
    
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
        .translate([0, dim.height / 8]);

    const path = d3.geoPath().projection(projection);

    const countries = svg.append("g")
        .selectAll("country")
        .data(map)
        .join("path")
        .attr("class", "land")
        .attr("d", path);

    // Forces

    const forceNode = d3.forceManyBody().strength(-2);
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
        .attr("value", d => d.id);

    // Toggle

    let toggleState = false;

    function toggleStates() {
        if (toggleState) {
            renderMap();
            toggleState = !toggleState;
            setTimeout(toggleStates, 2000);
        } else {
            renderNetwork();
            toggleState = !toggleState;
            setTimeout(toggleStates, 3000);
        };
    };

    setTimeout(toggleStates, 1000);

    // Render functions

    function renderMap() {

        simulation.stop();

        countries.transition().ease(d3.easeLinear).duration(1000)
            .style("opacity", 1);

        d3.selectAll(".trade-icon .link").classed("in-force", false);

        node.transition().ease(d3.easeLinear).duration(1000)
            .attr("cx", d => projection(d.coords)[0])
            .attr("cy", d => projection(d.coords)[1]);

        link.transition().ease(d3.easeLinear).duration(1000)
        .attr("x1", d => projection(nodes.find((node) => node.id == d.source.id).coords)[0])
        .attr("x2", d => projection(nodes.find((node) => node.id == d.target.id).coords)[0])
        .attr("y1", d => projection(nodes.find((node) => node.id == d.source.id).coords)[1])
        .attr("y2", d => projection(nodes.find((node) => node.id == d.target.id).coords)[1]);  
    };

    function renderNetwork() {
        
        countries.transition().ease(d3.easeLinear).style("opacity", 0);
        
        d3.selectAll(".trade-icon .link").classed("in-force", true);
        
        simulation.on("tick", ticked).alpha(1).restart();
    };
    
    function ticked() {
            
        node.transition().ease(d3.easeLinear).duration(1000)
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
