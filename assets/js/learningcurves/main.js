import { econ } from "../icons/econ-icon.js";
import { costCurve, ACAVCMC } from "./diagrams.js";

d3.select(".page-icon").call(econ);

d3.select("#fig-01").call(costCurve);
d3.select("#fig-02").call(ACAVCMC);
