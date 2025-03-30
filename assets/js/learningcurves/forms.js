
export function addForm(container, 
                        id, 
                        label, 
                        minValue, 
                        maxValue, 
                        steps, 
                        defaultValue,
                        lock = false) {

    const form = container.append("form")
        .attr("class", "diagram-form")
        .attr("id", id);
    
    form.append("label")
        .attr("class", "diagram-form-label")
        .attr("for", id)
        .text(label);
    
    const inputs = form.append("div")
        .attr("class", "diagram-form-inputs");

    const display = inputs.append("div")
        .attr("class", "display")
        .text(defaultValue);
        
    const slider = inputs.append("input")
        .attr("type", "range")
        .attr("min", minValue)
        .attr("max", maxValue)
        .attr("step", steps)
        .attr("name", label)
        .attr("value", defaultValue)
        .attr("id", id);

    slider
        .on("input.display", () => {
            display.text(slider.property("value"));
        })
        

    if (lock) {
        slider.attr("disabled", true);
    }
    
    return container.node();
}