// Parameters ///////////////////////////////////

export const max = { fc: 500, q: 100, p: 27, c: 25 }

export const blue = { 
    base: "#4889ab", 
    dull: "#A2C4D2", 
    baseSelect: "#0C6291", 
    dullSelect: "#669DB8"
};

export const red = { 
    base: "#C85B89", 
    dull: "#E29FBC", 
    baseSelect: "#B13D70", 
    dullSelect: "#D1729A" 
};

export const green = { 
    base: "#71B795", 
    dull: "#B4D7C6", 
    baseSelect: "#418462", 
    dullSelect: "#73AA8E" 
};

export const gray = { 
    base: "#DDDDDD", 
    dull: "#DDDDDD", 
    baseSelect: "#D0D0D0", 
    dullSelect: "##D0D0D0" 
};

export const margin = { 
    top: 50, 
    right: 100, 
    bottom: 40, 
    left: 70, 
    between: 60 
};

export const dim = { 
    width: 400, 
    panelHeight: 280 
};
dim.height = dim.panelHeight * 2 + margin.between;

// Functions ////////////////////////////////////

const constant = {
    a: 0.006,
    b: 0.56,
    c: 20
};

export function costFxn({ q, fc } = {}) {
    return constant.a * Math.pow(q, 3) - constant.b * Math.pow(q, 2) + constant.c * q + fc;
}
  
export function acFxn({ q, fc } = {}) {

    if (isNaN(costFxn({ q, fc }) / q)) {
        return constant.a * Math.pow(q, 2) - constant.b * q + constant.c;
        
    } else if (q === 0) {
        return null;

    } else {
        return costFxn({ q, fc }) / q;
    }
}

export function avcFxn({ q } = {}) {
    return constant.a * Math.pow(q, 2) - constant.b * q + constant.c;
}

export function mcFxn({ q } = {}) {
    return constant.a * 3 * Math.pow(q, 2) - constant.b * 2 * q + constant.c;
}

export function profitFxn({ q, p, fc } = {}) {
    return p * q - costFxn({ q, fc });
}

export function supplyFxn({ q } = {}) {

    const minAVCq = Math.floor(constant.b / (constant.a * 2));

    if (q < minAVCq + 1) {
        return avcFxn({ q: minAVCq });

    } else {
        return mcFxn({ q });
    }
}

export function mrFxn({ p } = {}) {
    return p;
}

export function demandMonoFxn({ q } = {}) {
    return 27 - (27 / 95) * q;
}

export function demandMonoFxnInv({ p } = {}) {
    return Math.floor((27 - +p) / (27 / 95));
}

export function mrMonoFxn({q} = {}) {
    return 27 - 2 * (27 / 95) * q;
}

export function profitMonoFxn({ q, fc } = {}) {
    return demandMonoFxn({ q }) * q - costFxn({ q, fc });
}

export function qStar(p) {

    const discriminant = Math.pow(constant.b, 2) - 3 * constant.a * (constant.c - p);
    
    if (discriminant < 0) {
        return 0;
    }

    const sqrtTerm = Math.sqrt(discriminant);
    const q1 = (constant.b + sqrtTerm) / (3 * constant.a);
    const q2 = (constant.b - sqrtTerm) / (3 * constant.a);

    return Math.round(Math.max(q1, q2));
}

export function qShutDown() {
    return Math.floor(constant.b / (constant.a * 2));
}

export function q(p) {
    if (p < avcFxn({ q: qShutDown() })) {
        return 0;
    } else {
        return Math.floor((1.12 + Math.pow(.072 * p - .1856, .5)) / .036);
    }
};


export function qMonoComp(c) {
    const b = (54 / 95) - 1.12;
    return Math.floor( (1/.036) * (-b + Math.pow( Math.pow(b, 2) - 1.44 + .072 * c, .5 ) ) )
}

export function demandMonoCompFxn({ q, c } = {}) {
    return c - (27 / 95) * q;
}

export function mrMonoCompFxn({ q, c } = {}) {
    return c - 2 * (27 / 95) * q;
}

export function profitMonoCompFxn({ q, fc, c } = {}) {
    return Math.ceil(demandMonoCompFxn({ q, c }) * q - costFxn({ q, fc }));
}

export function pMonoComp({ q, c }) {
    return demandMonoCompFxn({ q: qMonoComp({ c }), c });
}

export function demandMonoCompInvFxn({ dmd, c } = {}) {
    return (95 / 27) * (c - dmd);
}

export function mrMonoCompInvFxn({ mr, c } = {}) {
    return (95 / (27 * 2)) * (c - mr);
}


// Function info ////////////////////////////////

export const cost = { 
    fxn: costFxn, 
    label: "Cost", 
    id: "cost-curve", 
    scheme: red 
};

export const ac = ({ 
    fxn: acFxn, 
    label: "Average cost", 
    id: "ac-curve", 
    scheme: blue 
});

export const avc = ({ 
    fxn: avcFxn, 
    label: "Average variable cost", 
    id: "avc-curve", 
    scheme: blue 
});

export const mc = ({ 
    fxn: mcFxn, 
    label: "Marginal cost", 
    id: "mc-curve", 
    scheme: blue 
});

export const profit = ({ 
    fxn: profitFxn, 
    label: "Profit", 
    id: "profit-curve", 
    scheme: red 
});

export const price = ({ 
    fxn: mrFxn, 
    label: "Price", 
    id: "mr-curve", 
    scheme: green 
});

export const mr = ({ 
    fxn: mrFxn, 
    label: "Marginal revenue", 
    id: "mr-curve", 
    scheme: green 
});

export const supply = ({ 
    fxn: supplyFxn, 
    label: "Supply", 
    id: "supply-curve", 
    scheme: blue 
});
  
export const demandMono = ({ 
    fxn: demandMonoFxn, 
    label: "Demand", 
    id: "demand-mono-curve", 
    scheme: green 
});

export const mrMono = ({ 
    fxn: mrMonoFxn, 
    label: "Marginal revenue", 
    id: "mr-mono-curve", 
    scheme: green 
});

export const profitMono = ({ 
    fxn: profitMonoFxn, 
    label: "Profit", 
    id: "profit-mono-curve", 
    scheme: red 
});
  
export const demandMonoComp = ({ 
    fxn: null, 
    label: "Demand", 
    id: "demand-monocomp-curve", 
    scheme: green 
});

export const mrMonoComp = ({ 
    fxn: null, 
    label: "Marginal revenue", 
    id: "mr-monocomp-curve", 
    scheme: green 
});

export const profitMonoComp = ({ 
    fxn: null, 
    label: "Profit", 
    id: "profit-monocomp-curve", 
    scheme: red 
});

// Chart elements ///////////////////////////////

export const tooltip = d3.select(".tooltip");
  
export const line = d3.line().curve(d3.curveBasis);
  
export const xScaler = d3.scaleLinear()
    .domain([0, max.q])
    .range([0, dim.width]);
  
export function data(fxn, params, yScaler) {

    const q = params.q, p = params.p, fc = params.fc, c = params.c;

    return Array.from({ length: q + 1 }, (_, i) => {
        const y = yScaler(fxn({ q: i, p, fc, c })) ?? -500;
        const x = (y == null) ? null : xScaler(i);
        return [x, y];
    });
}

export function dataMax(fxn, params, yScaler) {

    const q = max.q, p = params.p, fc = params.fc, c = params.c;

    return Array.from({ length: q + 1 }, (_, i) => {
        const y = yScaler(fxn({ q: i, p, fc, c })) ?? -500;
        const x = (y == null) ? null : xScaler(i);
        return [x, y];
    });
}
