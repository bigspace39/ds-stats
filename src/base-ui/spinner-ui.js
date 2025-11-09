import { UIBuilder } from "./ui-builder.js";

export class SpinnerUI {
    /** @type {HTMLSpanElement} */
    span;

    /**
     * Creates an animated spinner UI to indicate that something is loading.
     * @param {HTMLElement} parentElement The parent element.
     * @param {boolean} startHidden If true, the spinner will initially be hidden.
     */
    constructor(parentElement, startHidden = true) {
        this.span = UIBuilder.createElement("span", parentElement, "spinner");
        if (startHidden)
            this.hide();
    }

    show() {
        this.span.style.display = "";
    }

    hide() {
        this.span.style.display = "none";
    }
}