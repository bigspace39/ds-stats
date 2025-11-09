/// <reference types="tippy.js" />
import { UIBuilder } from "./ui-builder.js";

export class QuestionmarkTooltipUI {
    div;
    tippy;
    tooltipDiv;

    constructor(parentElement, tooltipText) {
        this.div = UIBuilder.createElement("div", parentElement, "questionmark-tooltip");
        this.div.innerText = "?";
        this.tooltipDiv = UIBuilder.createElement("div", null, null);
        this.tooltipDiv.innerText = tooltipText;
        this.tippy = tippy(this.div, {
            content: this.tooltipDiv,
            placement: "right",
            zIndex: 2147483647 - 25,
            theme: "light",
            interactive: true
        });
    }

    show() {
        this.div.style.display = "";
    }

    hide() {
        this.div.style.display = "none";
    }
}