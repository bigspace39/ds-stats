import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { UIBuilder } from "./ui-builder.js";

export class DropdownUI {
    /** @type {HTMLSelectElement} */
    dropdownElement;
    /** @type {HTMLOptionElement[]} */
    optionElements = new Array();
    onChange = new Delegate();

    /**
     * Creates a dropdown UI.
     * @param {HTMLElement} parentElement The parent element.
     * @param  {...string} initialOptions Initial dropdown options.
     */
    constructor(parentElement, ...initialOptions) {
        this.dropdownElement = UIBuilder.createElement("select", parentElement, null);

        for (let i = 0; i < initialOptions.length; i++) {
            let option = initialOptions[i];
            this.#createOptionElement(option, i);
        }

        ElementStatics.bindOnChange(this.dropdownElement, this, function(element) {
            this.onChange.broadcast(this, this.getSelectedIndex());
        });
    }

    /**
     * Sets the dropdown options.
     * @param {string[]} options New options to replace the old ones with.
     * @returns {void}
     */
    setOptions(options) {
        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            if (this.optionElements.length > i)
                this.optionElements[i].innerText = option;
            else
                this.#createOptionElement(option, i);
        }

        if (this.optionElements.length == options.length)
            return;

        for (let i = this.optionElements.length - 1; i >= 0; i--) {
            this.optionElements.pop().remove();

            if (this.optionElements.length == options.length)
                return;
        }
    }

    /**
     * Gets the current selected index.
     * @returns {number}
     */
    getSelectedIndex() {
        return parseInt(this.dropdownElement.value);
    }

    /**
     * Sets the selected option at the given index.
     * @param {number} index The index to select.
     */
    setSelectedIndex(index) {
        this.dropdownElement.value = String(index);
        this.onChange.broadcast(this, this.getSelectedIndex());
    }

    #createOptionElement(text, value) {
        let optionElement = UIBuilder.createElement("option", this.dropdownElement);
        optionElement.innerText = text;
        optionElement.value = value;
        this.optionElements.push(optionElement);
    }

    show() {
        this.dropdownElement.style.display = "";
    }

    hide() {
        this.dropdownElement.style.display = "none";
    }
}