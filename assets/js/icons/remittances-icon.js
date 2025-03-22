
export function remittancesIcon(container) {

    Promise.all([
    
        d3.json("/assets/data/land-110m.json"),
        d3.csv("/assets/data/remt-nodes-icon.csv"),
        d3.csv("/assets/data/remt-links-icon.csv")
    
    ]).then(function([mapRaw, nodesRaw, linksRaw]) {
    
        const heroes = ["ESP", "IND", "FRA", "UKR", "PAK", "ITA"];

        const map = topojson.feature(mapRaw, mapRaw.objects.land).features;
        const links = linksRaw;
        const nodes = nodesRaw.map(d => ({
            iso: d.iso,
            size: d.size,
            coords: [d.longitude, d.latitude]
        }));
        
        drawMap(container, map, nodes, links, heroes);  
    });
};

function drawMap(container, map, nodes, links, heroes) {

    const dim = { width: 120, height: 110 };
    const params = { 
        scale: 55, 
        linkWidthMin: 1,
        linkWidthMax: 8, 
        radiusMin: 1, 
        radiusMax: 10
    };

    // Data

    const minLinkValue = d3.min(links, d => 100 * +d.share);
    const maxLinkValue = d3.max(links, d => 100 * +d.share);
    const minNodeValue = d3.min(nodes, d => +d.size);
    const maxNodeValue = d3.max(nodes, d => +d.size);

    console.log(minNodeValue);
    const strokeScaler = d3.scaleLinear()
        .domain([minLinkValue, maxLinkValue])
        .range([params.linkWidthMin, params.linkWidthMax]);
    
    const rScaler = d3.scaleLinear()
        .domain([minNodeValue, maxNodeValue])
        .range([params.radiusMin, params.radiusMax]);

    // Map

    const projection = d3.geoMercator()
        .scale(params.scale)
        .center([28, 25])
        .translate([dim.width / 2, dim.height / 2])

    let path = d3.geoPath().projection(projection);

    const svg = container.append("svg")
        .attr("width", dim.width)
        .attr("height", dim.height)

    svg.append("rect")
        .attr("class", "bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", dim.width)
        .attr("height", dim.height);
    
    svg.selectAll("country")
        .data(map)
        .join("path")
        .attr("class", "border")
        .attr("d", path)
    
    // Network

    let link = svg.append("g")
        .attr("class", "links")

    link.selectAll("line")
        .data(links)
        .join("line")
        .attr("class", d => "link " + nodes.find((node) => node.iso == d.to).iso)
        .attr("stroke-width", d => strokeScaler(100 * +d.share))
        .attr("x1", d => projection(nodes.find((node) => node.iso == d.from).coords)[0])
        .attr("x2", d => projection(nodes.find((node) => node.iso == d.to).coords)[0])
        .attr("y1", d => projection(nodes.find((node) => node.iso == d.from).coords)[1])
        .attr("y2", d => projection(nodes.find((node) => node.iso == d.to).coords)[1]);

    let group = svg.append("g")
        .attr("class", "bubble")

    const groupData = group.selectAll("g")
        .data(nodes)
        .order()
        .join("g")
        .attr("transform", d => `translate(${ projection(d.coords)[0] } , ${ projection(d.coords)[1] })`);

    groupData
        .append("circle")
        .attr("class", d => "node " + d.iso)
        .attr("r", d => rScaler(d.size))

    render(heroes[5]);

    // Highlight

    let index = 0;

    d3.interval(function() {
        let hero = heroes[index];
        index = (index + 1) % heroes.length;
        render(hero);    
    }, 2000);

    function render(hero) {
        d3.selectAll(".remittances-icon .node").classed("highlight", false);
        d3.selectAll(".remittances-icon .link").classed("highlight", false);
        d3.selectAll(".remittances-icon ." + hero).classed("highlight", true);
    };

    return container.node();
};

