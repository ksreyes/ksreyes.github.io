import { popden } from "./icons/popden-icon.js";
import { econ } from "./icons/econ-icon.js";
import { mrio } from "./icons/mrio-icon.js";
import { mmp } from "./icons/mmp-icon.js";

d3.select("#popden div").call(popden);
d3.select("#econ div").call(econ);
d3.select("#mrio div").call(mrio);
d3.select("#mmp div").call(mmp);

document.addEventListener("DOMContentLoaded", function() {
    console.log("Page loaded.")
});
