
export function spike() {

    let x = 0,
        y = 0,
        width = 0,
        height = 0,
        angle = -90;
    
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
  
        return [a, b, c];    
    }
    
    spike.x = function(n) { 
        return arguments.length ? (x = n, spike) : x; 
    }

    spike.y = function(n) { 
        return arguments.length ? (y = n, spike) : y; 
    }

    spike.width = function(n) { 
        return arguments.length ? (width = n, spike) : width; 
    }

    spike.height = function(n) { 
        return arguments.length ? (height = n, spike) : height; 
    }

    spike.angle = function(n) { 
        return arguments.length ? (angle = n, spike) : angle; 
    }

    return spike;
};

export const spikeheight = d3.scaleLinear()
    .domain([1, 1022])
    .range([1, 250]);

export const spikewidth = d => 2 * Math.pow(1.3, Math.log2(d / 300));
