
export function popden(container) {

    const dim = { width: 120, height: 110 };
    const p = { mean: 7, sd: 2, velocity: .2};
    
    // Generate points
    const dummynodes = Array.from(
        { length: 25 }, (_, i) => ({
            x: d3.randomUniform((dim.width * .15), (dim.width * .85))(),
            y: d3.randomUniform(dim.height * .15, dim.height * .85)(),
            r: d3.randomNormal(p.mean, p.sd)(),
            vx: d3.randomUniform(-1, 1)() * p.velocity,
            vy: d3.randomUniform(-1, 1)() * p.velocity
        })
    );
    
    const nodes = dummynodes.map(Object.create);

    const bbox = ([[x1, y1], [x2, y2]]) => [
        { from: { x: x1, y: y1 }, to: { x: x1, y: y2 } },
        { from: { x: x1, y: y2 }, to: { x: x2, y: y2 } },
        { from: { x: x2, y: y2 }, to: { x: x2, y: y1 } },
        { from: { x: x2, y: y1 }, to: { x: x1, y: y1 } }
    ];

    // Panel
    const svg = container.append("svg")
        .attr("width", dim.width)
        .attr("dim.height", dim.height)
        .attr("viewBox", [0, 0, dim.width, dim.height])
        .attr("style", "max-width: 100%; dim.height: auto; dim.height: intrinsic");

    // Chart box
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", dim.width)
        .attr("height", dim.height)
        .attr("id", "popden-bg");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => d.r);
    
    // Define forces
    d3.forceSimulation(nodes)
        .force("bounce", d3.forceBounce()
            .radius(d => d.r + .1))
        .force("surface", d3.forceSurface()
            .surfaces(bbox([[0, 0], [dim.width, dim.height]]))
            .oneWay(true)
            .radius(d => d.r + .1))
        .force("limit", d3.forceLimit()
            .x0(0)
            .x1(dim.width)
            .y0(0)
            .y1(dim.height))
        .alphaDecay(0)
        .velocityDecay(0)
        .on("tick", () => { 
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });
    
    return container.node();
}
