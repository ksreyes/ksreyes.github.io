
export function econ(container) {

    const dim = { width: 120, height: 110 };
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    let params = ({ q: null, fc: 180, p: null, c: null });
    const q = (p) => Math.floor((27 - p) / (27/95));
  
    const fcMax = 500;
    const qMax = 100;
    
    const id = d3.randomInt(100000, 1000000)();
    
    const blue = ({ base: "#4889ab", dull: "#A2C4D2", baseSelect: "#0C6291", dullSelect: "#669DB8"});
    const red = ({ base: "#C85B89", dull: "#E29FBC", baseSelect: "#B13D70", dullSelect: "#D1729A" });
    const green = ({ base: "#71B795", dull: "#B4D7C6", baseSelect: "#418462", dullSelect: "#73AA8E" });
    const gray = ({ base: "#DDDDDD", dull: "#DDDDDD", baseSelect: "#D0D0D0", dullSelect: "##D0D0D0" });
    const dashed = "#999999";
    const strokeWidth = 3;

    const ac = ({ fxn: acFxn, label: "Average cost", id: "ac-curve", scheme: blue });
    const mc = ({ fxn: mcFxn, label: "Marginal cost", id: "mc-curve", scheme: blue });
    const mr = ({ fxn: mrFxn, label: "Marginal revenue", id: "mr-curve", scheme: red });
        
    const demandMono = ({ fxn: demandMonoFxn, label: "Demand", id: "demand-mono-curve", scheme: green });
    const mrMono = ({ fxn: mrMonoFxn, label: "Marginal revenue", id: "mr-mono-curve", scheme: green });
    const profitMono = ({ fxn: profitMonoFxn, label: "Profit", id: "profit-mono-curve", scheme: red });

    const line = d3.line().curve(d3.curveBasis);
    
    const xScaler = d3.scaleLinear()
        .domain([0, qMax])
        .range([0, dim.width]);
    
    const yScaler = d3.scaleLinear()
        .domain([0, acFxn({ q: qMax, fc: fcMax })])
        .range([dim.height, 0]);

    const svg = container.append("svg")
        .attr("width", dim.width + margin.left + margin.right)
        .attr("height", dim.height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, dim.width + margin.left + margin.right, dim.height + margin.top + margin.bottom])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    
    // Timer ///

    let start = 8;
    let end = 18;
    let duration = 4000;
    const interpolator = d3.interpolate(start, end);
    let direction = 1;
    let lastCycle = 0;
    let price = start;

    d3.timer((elapsed) => {

        let cycle = Math.floor(elapsed / duration); // Count full cycles

        // Flip direction when a full cycle is completed
        if (cycle !== lastCycle) {
            direction *= -1;
            lastCycle = cycle;
        };
        
        let t = (elapsed % duration) / duration; // Normalize time between 0 and 1

        price = direction === 1 ? interpolator(t) : interpolator(1 - t);

        params.q = q(price);
        params.p = price;

        const corners = { 
            x1: 0, 
            y1: yScaler(params.p), 
            x2: xScaler(params.q), 
            y2: yScaler(acFxn(params)) 
        };

        // Panel //////////////////////////////////////////////////////////////

        svg.select("#panel").remove();

        const panel = svg.append("g")
            .attr("id", "panel")
            .attr("transform", `translate(${ margin.left }, ${ margin.top })`);

        panel.append("g")
            .call(clipWide, id)
            .call(addArea, id, profitMono, corners)
            .select("path")
            .style("fill", corners.y1 < corners.y2 ? "#7fc6a4" : "#f697bb");

        panel.append("g")
            .call(clip, id)
            .call(addCurve, id, mr, params, yScaler, gray)
            .call(addCurve, id, ac, params, yScaler)
            .call(addCurve, id, mc, params, yScaler)
            .call(addCurve, id, demandMono, params, yScaler)
            .call(addCurve, id, mrMono, params, yScaler)

        panel.append("g")
            .call(clipWide, id)
            .call(yGuide, ac, params, yScaler)
            .call(yGuide, mc, params, yScaler)
            .call(yGuide, mrMono, params, yScaler)
            .call(yGuide, demandMono, params, yScaler)
            .call(xGuides, mr, params, yScaler);
        
        panel.append("g")
            .append("path")
            .attr("id", "econ-axes")
            .attr("d", `
                M1.5,0
                V1.5,${ dim.height - margin.top - margin.bottom - 1.5}
                H${ dim.width - margin.right - margin.left - 1.5}
            `)
            .style("fill", "none");
    });
    
    // Functions

    function costFxn({ q, fc } = {}) {
        return .006 * Math.pow(q, 3) - .56 * Math.pow(q, 2) + 20 * q + fc
    };
    
    function acFxn({ q, fc } = {}) {
        if (isNaN(costFxn({ q, fc }) / q)) {
            return .006 * Math.pow(q, 2) - .56 * q + 20;
        } else if (q === 0) {
            return null;
        } else {
            return costFxn({ q, fc }) / q;
        };
    };
    
    function mcFxn({q} = {}) {
        return .006 * 3 * Math.pow(q, 2) - .56 * 2 * q + 20;
    };
    
    function mrFxn({p} = {}) {
        return p;
    };
    
    function demandMonoFxn({q} = {}) {
        return 27 - (27/95) * q;
    };
    
    function mrMonoFxn({q} = {}) {
        return 27 - 2 * (27/95) * q;
    };
    
    function profitMonoFxn({ q, fc } = {}) {
        return demandMonoFxn({ q }) * q - costFxn({ q, fc })
    };
    
    function data(fxn, params, yScaler) {
        const q = params.q, p = params.p, fc = params.fc, c = params.c;
        return Array.from({ length: q + 1 }, (_, i) => {
            const y = yScaler(fxn({ q: i, p, fc, c })) ?? -500;
            const x = (y == null) ? null : xScaler(i);
            return [x, y];
        });
    };
    
    function dataMax(fxn, params, yScaler) {
        const q = qMax, p = params.p, fc = params.fc, c = params.c;
        return Array.from({ length: q + 1 }, (_, i) => {
            const y = yScaler(fxn({ q: i, p, fc, c })) ?? -500;
            const x = (y == null) ? null : xScaler(i);
            return [x, y];
        });
    };

    function addCurve(selection, id, fxnInfo, params, yScaler) {

        const point = data(fxnInfo.fxn, params, yScaler)[params.q];
      
        const curves = selection.append("g")
            .attr("id", `${ fxnInfo.id }-${ id }`)
            .attr("pointer-events", "visibleStroke");
        
        // Non-highlighted portion
        curves.append("path")
            .attr("class", "curve dulled")
            .attr("d", line(dataMax(fxnInfo.fxn, params, yScaler)))
            .style("fill", "none")
            .style("stroke", fxnInfo.scheme.dull)
            .style("stroke-width", strokeWidth);
        
        // Highlighted portion
        curves.append("path")
            .attr("class", "curve colored")
            .attr("d", line(data(fxnInfo.fxn, params, yScaler)))
            .style("fill", "none")
            .style("stroke", fxnInfo.scheme.base)
            .style("stroke-width", strokeWidth);

        return selection.node();
    };
    
    function addCurveFull(selection, id, fxnInfo, params, yScaler, scheme = fxnInfo.scheme) {
    
        const curves = selection.append("g")
            .attr("id", `${ fxnInfo.id }-${ id }`)
            .attr("pointer-events", "visibleStroke");
        
        curves.append("path")
            .attr("class", "curve")
            .attr("d", line(dataMax(fxnInfo.fxn, params, yScaler)))
            .style("fill", "none")
            .style("stroke", scheme.base)
            .style("stroke-width", strokeWidth);
    
        return selection.node();
    };
      
    function addArea(selection, id, info, corners) {
        
        const area = selection.append("path")
            .attr("id", `area-${ info.id }-${ id }`)
            .attr("d", d3.line()([ 
                [corners.x1, corners.y1], 
                [corners.x2, corners.y1],
                [corners.x2, corners.y2],
                [corners.x1, corners.y2]
            ]))
            .style("opacity", .25)
            .style("fill", "#7fc6a4");
        
        return selection.node();
    }
      
    function clip(selection, id) {
        
        selection.attr("clip-path", `url(#clip-${ id })`);
        
        const clip = selection.append("clipPath")
            .attr("id", `clip-${ id }`);

        clip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dim.width + margin.right)
            .attr("height", dim.height)
            .style("fill", "white");
          
        return selection.node();
    };
      
    function clipWide(selection, id) {
        
        selection.attr("clip-path", `url(#clip-wide-${ id })`);
    
        const clip = selection.append("clipPath")
            .attr("id", `clip-wide-${ id }`);

        clip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", dim.width + margin.right)
            .attr("height", dim.height)
            .style("fill", "white");

        clip.append("rect")
            .attr("x", -margin.left)
            .attr("y", -10)
            .attr("width", margin.left)
            .attr("height", dim.height + 20)
            .style("fill", "white");
        
        return selection.node();
    };

    function xGuides(selection, fxnInfo, params, yScaler, panels = 1) {
  
        const point = data(fxnInfo.fxn, params, yScaler)[params.q];
        const guide = selection.append("g");
        
        // Dashed line
        const dashedLine = guide.append("path")
            .attr("d", line([[point[0], 0], [point[0], dim.height]]))
            .attr("fill", "none")
            .attr("stroke", dashed)
            .attr("stroke-dasharray", "2 2");
        
        // if (panels === 1) {
        //     dashedLine.attr("d", line([[point[0], point[1]], [point[0], dim.height]]));
        // }
            
        return selection.node()
    }
        
    function yGuide(selection, fxnInfo, params, yScaler, format = ",.0f") {
        
        const point = data(fxnInfo.fxn, params, yScaler)[params.q]
        const guide = selection.append("g")
        
        // Dashed line
        guide.append("g")
            .append("path")
            .attr("d", line([[point[0], point[1]], [0, point[1]]]))
            .attr("fill", "none")
            .attr("stroke", dashed)
            .attr("stroke-dasharray", "2 2")
        
        return selection.node();
    };

    return container.node();
}



