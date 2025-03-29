

export function outputForm(container, id, defaultValue) {

    const form = container.append("form")
        .attr("class", "diagram-form");
    
    form.append("label")
        .attr("class", "diagram-form-label")
        .attr("for", id)
        .text("Output");
    
    const inputs = form.append("div")
        .attr("class", "diagram-form-inputs")

    // inputs.append("input")
    //     .attr("type", "number")
    //     .attr("min", 0)
    //     .attr("max", 100)
    //     .attr("step", 1)
    //     .attr("name", "output")
    //     .attr("value", value)
    //     .attr("id", id);
    const display = inputs.append("span")
        .text(defaultValue);;
        
    const slider = inputs.append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", 100)
        .attr("step", 1)
        .attr("name", "output")
        .attr("value", defaultValue)
        .attr("id", id);

    slider.on("input", () => {
        // console.log(slider.property("value"));
        display.text(slider.property("value"));
    });
    
    return container.node();
}