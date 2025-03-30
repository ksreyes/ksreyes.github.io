

export function outputForm(container, id, label, minValue, maxValue, steps, defaultValue) {

    const form = container.append("form")
        .attr("class", "diagram-form");
    
    form.append("label")
        .attr("class", "diagram-form-label")
        .attr("for", id)
        .text(label);
    
    const inputs = form.append("div")
        .attr("class", "diagram-form-inputs")

    const display = inputs.append("div")
        .text(defaultValue);;
        
    const slider = inputs.append("input")
        .attr("type", "range")
        .attr("min", minValue)
        .attr("max", maxValue)
        .attr("step", steps)
        .attr("name", label)
        .attr("value", defaultValue)
        .attr("id", id);

    slider.on("input", () => {
        display.text(slider.property("value"));
    });
    
    return container.node();
}