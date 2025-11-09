import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { UIBuilder } from "./ui-builder.js";

export class ToggleUI {
    /** @type {HTMLLabelElement} */
    label;
    /** @type {HTMLInputElement} */
    input;
    /** @type {HTMLSpanElement} */
    span;
    onToggle = new Delegate();

    /**
     * Creates a toggle that can either be true/false.
     * @param {HTMLElement} parentElement The parent element.
     * @param {boolean} toggled If the toggle should start off toggled.
     */
    constructor(parentElement, toggled = false) {
        this.label = UIBuilder.createElement("label", parentElement, "toggle");
        this.input = UIBuilder.createElement("input", this.label);
        this.input.type = "checkbox";
        this.span = UIBuilder.createElement("span", this.label, "toggle-slider");
        this.setToggled(toggled);

        ElementStatics.bindOnClick(this.input, this, function(element) {
            this.onToggle.broadcast(this, element.checked);
        });
    }

    /**
     * Sets the toggled state of the toggle.
     * @param {boolean} toggled 
     * @returns {void}
     */
    setToggled(toggled) {
        if (this.isToggled() == toggled)
            return;

        this.input.checked = toggled;
        this.onToggle.broadcast(this, toggled);
    }

    /**
     * Returns true if the toggle is toggled.
     * @returns {boolean} 
     */
    isToggled() {
        return this.input.checked;
    }

    show() {
        this.label.style.display = "";
    }

    hide() {
        this.label.style.display = "none";
    }
}