

export function mmp(container) {

    Promise.all([
    
        d3.json("./assets/data/land-110m.json")
    
    ]).then(function([mapRaw]) {
    
        const map = topojson.feature(mapRaw, mapRaw.objects.land).features;
    
        drawMap(container, map);  
    })
};

function drawMap(container, map) {

    const dim = { width: 120, height: 110 };
    const params = { scale: 54 };

    let projection = d3.geoOrthographic()
        .scale(params.scale)
        .center([0, 0])
        .rotate([0, -20])
        .translate([dim.width / 2, dim.height / 2]);

    let path = d3.geoPath().projection(projection);

    const spikeheight = d3.scaleLinear()
        .domain([1, 10])
        .range([1, 20]);
    
    const spikewidth = d => 5 * Math.pow(1.3, Math.log2(d / 300));

    const svg = container.append("svg")
        .attr("width", dim.width)
        .attr("height", dim.height)
        .attr("viewBox", [0, 0, dim.width, dim.height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
    
    let globe = svg.append("circle")
        .attr("class", "globe")
        .attr("cx", dim.width / 2)
        .attr("cy", dim.height / 2)
        .attr("r", params.scale);

    let country = svg.selectAll("country")
        .data(map)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path);
    
    // Generate dummy data
    const data = [
        // Americas
        { "n": 4, "coords": [-100, 30] },
        { "n": 3, "coords": [-95, 25] },
        { "n": 2, "coords": [-80, 24] },

        // Mediterranean
        { "n": 8, "coords": [15, 35] },
        { "n": 6, "coords": [20, 30] },
        { "n": 4, "coords": [20, 35] },
        { "n": 5, "coords": [4, 35] },
        { "n": 4, "coords": [-15, 23] },
        { "n": 3, "coords": [-16, 19] },

        // EHOA
        { "n": 3, "coords": [42, 13] },
        { "n": 6, "coords": [44, 17] },

        // Asia
        { "n": 5, "coords": [92, 21] },

        // Africa
        { "n": 5, "coords": [30, 1] },
    ];
    
    const spikes = svg.append("g")
        .selectAll(".spike")
        .data(data)
        .join("polyline")
        .attr("class", "spike")
        
    const timerParams = { duration: 10000 };
    let rotation = projection.rotate();

    d3.timer((elapsed) => {

        let t = (elapsed % timerParams.duration) / timerParams.duration; 
        
        rotation[0] = t * 359;
        projection.rotate(rotation);

        svg.selectAll("path").attr("d", path);

        spikes
            .classed("hide", d => !path({ type: "Point", coordinates: d.coords }))
            .attr("points", d => {
                const p = projection(d.coords);
                const a = geometric.lineAngle([[dim.width / 2, dim.height / 2], p]);
                return spike()
                    .x(p[0]).y(p[1]).angle(a)
                    .width(spikewidth(projection.scale()))
                    .height(spikeheight(d.n))
                    ();
            });
    
    });

    // Functions

    function spike() {
        let x = 0,
            y = 0,
            width = 0,
            height = 0,
            angle = -90,
            closed = false;
        
        const spike = (datum) => {
            const dx = typeof x === "function" ? x(datum) : x,
                dy = typeof y === "function" ? y(datum) : y,
                dwidth = typeof width === "function" ? width(datum) : width,
                dheight = typeof height === "function" ? height(datum) : height,
                dangle = typeof angle === "function" ? angle(datum) : angle,
                base = [dx, dy],
                a = geometric.pointTranslate(base, dangle - 90, dwidth / 2),
                b = geometric.pointTranslate(base, dangle, dheight),
                c = geometric.pointTranslate(base, dangle + 90, dwidth / 2);      
        
            return closed ? [a, b, c, a] : [a, b, c];    
        }
        
        spike.x = function(n){ return arguments.length ? (x = n, spike) : x; }
        spike.y = function(n){ return arguments.length ? (y = n, spike) : y; }
        spike.width = function(n){ return arguments.length ? (width = n, spike) : width; }
        spike.height = function(n){ return arguments.length ? (height = n, spike) : height; }
        spike.angle = function(n){ return arguments.length ? (angle = n, spike) : angle; }
        spike.closed = function(b){ return arguments.length ? (closed = b, spike) : closed; }
        
        return spike;
    };

    return container.node();
}