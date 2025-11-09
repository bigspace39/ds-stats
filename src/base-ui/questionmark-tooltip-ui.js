/// <reference types="tippy.js" />
import { UIBuilder } from "./ui-builder.js";

export class QuestionmarkTooltipUI {
    /** @type {HTMLDivElement} */
    div;
    /** @type {Tippy.Tippy} */
    tippy;
    /** @type {HTMLDivElement} */
    tooltipDiv;

    /**
     * Creates a question mark icon that when hovered will show the specified text in a tooltip.
     * @param {HTMLElement} parentElement The parent element.
     * @param {string} tooltipText The tooltip text.
     */
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