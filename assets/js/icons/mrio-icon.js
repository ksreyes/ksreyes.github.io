export function mrio(container) {

    const dim = { width: 120, height: 110 };
    
    const svg = container.append("svg")
        .attr("width", dim.width)
        .attr("dim.height", dim.height)
        .attr("viewBox", [0, 0, dim.width, dim.height])
        .attr("style", "max-width: 100%; dim.height: auto; dim.height: intrinsic");

    const params = {
        gutter: 5,
        side: 10,
        mult: 6
    };

    const group = svg.append("g")
        .attr("transform", `translate(${params.side/2 + params.gutter},${params.side/2 + params.gutter})`)

    group.append("rect")
        .attr("class", "header")
        .attr("x", 0)
        .attr("y", -params.side / 2 - params.gutter)
        .attr("width", params.side * (params.mult * 1.5 + 1) + params.gutter * 2)
        .attr("height", params.side / 2)

    group.append("rect")
        .attr("class", "header")
        .attr("x", -params.side / 2 - params.gutter)
        .attr("y", 0)
        .attr("width", params.side / 2)
        .attr("height", params.side *(params.mult + 2) + params.gutter * 2)

    group.append("rect")
        .attr("class", "input")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", params.side * params.mult)
        .attr("height", params.side * params.mult)
    
    group.append("rect")
        .attr("class", "va")
        .attr("x", 0)
        .attr("y", params.side * params.mult + params.gutter)
        .attr("width", params.side * params.mult)
        .attr("height", params.side)

    group.append("rect")
        .attr("class", "output")
        .attr("x", 0)
        .attr("y", params.side * params.mult + params.side + params.gutter * 2)
        .attr("width", params.side * params.mult)
        .attr("height", params.side)

    group.append("rect")
        .attr("class", "final")
        .attr("x", params.side * params.mult + params.gutter)
        .attr("y", 0)
        .attr("width", params.side * params.mult / 2)
        .attr("height", params.side * params.mult)

    group.append("rect")
        .attr("class", "output")
        .attr("x", params.side * params.mult + params.side * params.mult / 2 + params.gutter * 2)
        .attr("y", 0)
        .attr("width", params.side)
        .attr("height", params.side * params.mult)

    return container.node();
}