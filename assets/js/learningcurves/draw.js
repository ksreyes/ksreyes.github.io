import * as util from "./util.js";

export function drawBackground(selection) {

    selection.append("rect")
        .attr("class", "bg")
        .attr("x", 0).attr("y", 0)
        .attr("width", selection.attr("width"))
        .attr("height", "100%");

    return selection.node();
}

export function addCurve(selection, id, fxnInfo, params, yScaler) {

    const point = util.data(fxnInfo.fxn, params, yScaler)[params.q]
  
    const curves = selection.append("g")
        .attr("id", `${ fxnInfo.id }-${ id }`)
        .attr("pointer-events", "visibleStroke")
    
    // Non-highlighted portion
    curves.append("path")
        .attr("class", "curve dulled")
        .attr("d", util.line(util.dataMax(fxnInfo.fxn, params, yScaler)))
        .style("stroke", fxnInfo.scheme.dull);
    
    // Highlighted portion
    curves.append("path")
        .attr("class", "curve colored")
        .attr("d", util.line(util.data(fxnInfo.fxn, params, yScaler)))
        .style("stroke", fxnInfo.scheme.base);
    
    // Add hover effects
    curves
        .on("mousemove", (event) => {

            d3.selectAll(`#${ fxnInfo.id }-${ id } .curve.colored`)
                .classed("hovered", true)
                .style("stroke", fxnInfo.scheme.baseSelect);

            d3.selectAll(`#${ fxnInfo.id }-${ id } .curve.dulled`)
                .classed("hovered", true)
                .style("stroke", fxnInfo.scheme.dullSelect);

            util.tooltip
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px")
                .style("display", "block")
                .text(fxnInfo.label);

            // d3.select(event.target).style("cursor", "pointer");
        })
        .on("mouseleave", (event) => {

            d3.selectAll(`#${ fxnInfo.id }-${ id } .curve.colored`)
                .classed("hovered", false)
                .style("stroke", fxnInfo.scheme.base);

            d3.selectAll(`#${ fxnInfo.id }-${ id } .curve.dulled`)
                .classed("hovered", false)
                .style("stroke", fxnInfo.scheme.dull);

            util.tooltip.style("display", "none");
            // d3.select(event.target).style("cursor", "default");
        });
  
    return selection.node();
}
  
export function addCurveFull(selection, 
                             id, 
                             fxnInfo, 
                             params,
                             yScaler, 
                             scheme = fxnInfo.scheme) {
    
    const curves = selection.append("g")
        .attr("id", `${ fxnInfo.id }-${ id }`)
        .attr("pointer-events", "visibleStroke");
    
    curves.append("path")
        .attr("class", "curve")
        .attr("d", util.line(util.dataMax(fxnInfo.fxn, params, yScaler)))
        .style("stroke", scheme.base);
  
    // Add hover effects
    curves.on("mousemove", (event) => {

            d3.selectAll(`#${ fxnInfo.id }-${ id } .curve`)
                .classed("hovered", true)
                .style("stroke", scheme.baseSelect);

            util.tooltip
                .style("left", event.pageX + 18 + "px")
                .style("top", event.pageY + 18 + "px")
                .style("display", "block")
                .text(fxnInfo.label);

            d3.select(event.target).style("cursor", "pointer");
        })
        .on("mouseleave", (event) => {

            d3.selectAll(`#${ fxnInfo.id }-${ id } .curve`)
                .classed("hovered", false)
                .style("stroke", scheme.base);

            util.tooltip.style("display", "none");
            d3.select(event.target).style("cursor", "default");
        });
  
    return selection.node();
}
  
export function addArea(selection, id, info, corners) {

    if (corners.x1 === undefined) corners.x1 = 0;
    if (corners.x2 === undefined) corners.x2 = 0;
    if (corners.y1 === undefined) corners.y1 = 0;
    if (corners.y2 === undefined) corners.y2 = 0;
    
    const area = selection.append("path")
        .attr("id", `area-${ info.id }-${ id }`)
        .attr("class", "area")
        .attr("d", d3.line()([ 
            [corners.x1, corners.y1], 
            [corners.x2, corners.y1],
            [corners.x2, corners.y2],
            [corners.x1, corners.y2]
        ]));
    
    // Add hover effects
    area.on("mousemove", (event) => {

            d3.selectAll(`#area-${ info.id }-${ id }`)
                .classed("hovered", true);

            util.tooltip
                .style("left", event.pageX + 18 + "px")
                .style("top", event.pageY + 18 + "px")
                .style("display", "block")
                .text(info.label);

            d3.select(event.target).style("cursor", "pointer");
        })
        .on("mouseleave", (event) => {

            d3.selectAll(`#area-${ info.id }-${ id }`)
                .classed("hovered", false);

            util.tooltip.style("display", "none");
            d3.select(event.target).style("cursor", "default");
        });
  
    return selection.node();
}
  
export function clip(selection, id) {
    
    selection.attr("clip-path", `url(#clip-${ id })`);
    
    const clip = selection.append("clipPath")
        .attr("id", `clip-${ id }`);

    clip.append("rect")
        .attr("class", "clip")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", util.dim.width + util.margin.right)
        .attr("height", util.dim.panelHeight);
      
    return selection.node();
}
  
export function clipWide(selection, id) {
    
    selection.attr("clip-path", `url(#clip-wide-${id})`);
    
    const clip = selection.append("clipPath")
        .attr("id", `clip-wide-${ id }`);

    clip.append("rect")
        .attr("class", "clip")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", util.dim.width + util.margin.right)
        .attr("height", util.dim.panelHeight);

    clip.append("rect")
        .attr("class", "clip")
        .attr("x", -util.margin.left)
        .attr("y", -10)
        .attr("width", util.margin.left)
        .attr("height", util.dim.panelHeight + 20);
    
    return selection.node();
}

export function panelAxes(selection, titles) {
  
    const axes = selection.append("g")
        .attr("class", "axis");
    
    // Axis lines
    axes.append("path")
        .attr("class", "axis-line")
        .attr("d", d3.line()([
            [util.dim.width, util.dim.panelHeight], 
            [0, util.dim.panelHeight], [0, 0]
        ]));
    
    // Axis titles    
    axes.append("g")
        .append("text")
        .attr("class", "axis-text axis-text-x")
        .text(titles.x)
        .attr("x", util.dim.width + 10)
        .attr("y", util.dim.panelHeight);
    
    axes.append("text")
        .attr("class", "axis-text axis-text-y")
        .text(titles.y)
        .attr("x", 0)
        .attr("y", -15);
  
    return selection.node();
}
  
export function panelAxesT(selection, titles, yScaler) {
    
    const axes = selection.append("g")
        .attr("class", "axis");
    
    // Axis lines
    axes.append("path")
        .attr("class", "axis-line")
        .attr("d", d3.line()([
            [0, yScaler(0)], 
            [util.dim.width, yScaler(0)]
        ]));
    
    axes.append("path")
        .attr("class", "axis-line")
        .attr("d", d3.line()([
            [0, 0], 
            [0, util.dim.panelHeight]
        ]));
    
    // Axis titles
    axes.append("text")
        .attr("class", "axis-text axis-text-x")
        .text(titles.x)
        .attr("x", util.dim.width + 10)
        .attr("y", yScaler(0));
    
    axes.append("text")
        .attr("class", "axis-text axis-text-y")
        .text(titles.y)
        .attr("x", 0)
        .attr("y", -15);
  
    return selection.node();
}
  
export function xGuides(selection, fxnInfo, params, yScaler, panels = 2) {
    
    const point = util.data(fxnInfo.fxn, params, yScaler)[params.q];
    const guide = selection.append("g")
        .attr("class", "guide");
    
    // Dashed line
    const dashedLine = guide.append("path")
        .attr("class", "dashed-line")
        .attr("d", util.line([
            [point[0], point[1]], 
            [point[0], util.dim.panelHeight * 2 + util.margin.between]
        ]));
    
    // Tick
    const tick = guide.append("text")
        .attr("class", "tick tick-x")
        .text(d3.format(",.0f")(params.q))
        .attr("x", util.xScaler(params.q))
        .attr("y", util.dim.panelHeight * 2 + util.margin.between)
        .attr("dy", 10);
      
    if (panels === 1) {
        dashedLine.attr("d", util.line([
            [point[0], point[1]], 
            [point[0], util.dim.panelHeight]
        ]));
        tick.attr("y", util.dim.panelHeight);
    }
     
    return selection.node();
}
    
export function yGuide(selection, fxnInfo, params, yScaler, format = ",.0f") {
    
    const point = util.data(fxnInfo.fxn, params, yScaler)[params.q];
    const guide = selection.append("g")
        .attr("class", "guide");
    
    // Dashed line
    guide.append("path")
        .attr("class", "dashed-line")
        .attr("d", util.line([
            [point[0], point[1]], 
            [0, point[1]]
        ]));
    
    // Axis tick
    guide.append("text")
        .attr("class", "tick tick-y")
        .text(d3.format(format)(fxnInfo.fxn(params)))
        .attr("x", 0)
        .attr("y", point[1])
        .attr("dx", -10);
    
    return selection.node();
}

export function addLabel(selection, label, x, y, anchor = "start") {

    selection.append("text")
        .attr("class", "curve-label")
        .text(label)
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", anchor);

    return selection.node();
}
  
export function labelsToggle(container, id) {

    const form = container.append("form")
        .attr("class", "toggle-labels");

    form.append("input")
        .attr("class", "toggle-checkbox")
        .attr("type", "checkbox")
        .attr("name", "toggle-label")
        .attr("id", `checkbox-${ id }`)
        .property("checked", true);
    
    form.append("label")
        .attr("class", "toggle-label")
        .attr("for", `checkbox-${ id }`)
        .text("Labels");
    
    return container.node();
}
