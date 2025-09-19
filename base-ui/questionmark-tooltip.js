class QuestionmarkTooltip {
    div;
    tippy;
    tooltipDiv;

    constructor(parentElement, tooltipText) {
        this.div = createElement("div", parentElement, "questionmark-tooltip");
        this.div.innerText = "?";
        this.tooltipDiv = createElement("div", null, null);
        this.tooltipDiv.innerText = tooltipText;
        this.tippy = tippy(this.div, {
            content: this.tooltipDiv,
            placement: "right",
            zIndex: 2147483647 - 25,
            theme: "light",
            interactive: true
        });
    }
}