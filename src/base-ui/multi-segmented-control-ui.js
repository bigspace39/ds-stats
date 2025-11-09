import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { SegmentedControlUIOption } from "./segmented-control-ui.js";
import { UIBuilder } from "./ui-builder.js";

export class MultiSegmentedControlUI {
    /** @type {HTMLDivElement} */
    horizontalDiv = null;
    options = new Array();
    /** @type {HTMLButtonElement[]} */
    buttons = new Array();
    /** @type {HTMLButtonElement[]} */
    selectedButtons = new Array();
    onClick = new Delegate();
    onSelectButton = new Delegate();
    onDeselectButton = new Delegate();

    /**
     * Will create a segmented control UI, with no options selected by default, and any amount of options be able to be selected.
     * @param {HTMLElement} parentElement The parent element.
     * @param  {...SegmentedControlUIOption} options The options for the segmented control.
     */
    constructor(parentElement, ...options) {
        this.horizontalDiv = UIBuilder.createHorizontal(parentElement);

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            this.options.push(option.value);
            let label = option.displayLabel;

            let button = UIBuilder.createElement("button", this.horizontalDiv, "segmented-control");
            button.innerText = label;
            ElementStatics.bindOnClick(button, this, async function(button, index) {
                this.#click(button, index);
            }, i);

            this.buttons.push(button);
        }
    }

    #click(button, index) {
        if (this.selectedButtons.includes(button)) {
            button.id = "segmented-control";
            let index = this.selectedButtons.indexOf(button);
            this.selectedButtons.splice(index, 1);
            this.onDeselectButton.broadcast(button, this.options[index]);
        }
        else {
            button.id = "selected-segmented-control";
            this.selectedButtons.push(button);
            this.onSelectButton.broadcast(button, this.options[index]);
        }  

        this.onClick.broadcast(button, this.selectedButtons);
    }

    /**
     * Will return true if any options are selected.
     * @returns {boolean}
     */
    hasAnySelectedOptions() {
        return this.selectedButtons.length > 0;
    }

    /**
     * Returns the values of the options currently selected.
     * @returns {any[]}
     */
    getSelectedOptions() {
        let selectedOptions = new Array();
        for (let i = 0; i < this.selectedButtons.length; i++) {
            let button = this.selectedButtons[i];
            let option = this.options[this.#getButtonIndex(button)];
            selectedOptions.push(option);
        }

        return selectedOptions;
    }

    /**
     * Set the selected options by value.
     * @param {any[]} selectedOptions The values of the options to select.
     */
    setSelectedOptions(selectedOptions) {
        for (let i = 0; i < this.buttons.length; i++) {
            let button = this.buttons[i];
            let option = this.options[i];
            let currentlySelected = this.selectedButtons.includes(button);
            let shouldBeSelected = selectedOptions.includes(option);
            if (currentlySelected != shouldBeSelected)
                this.#click(button);
        }
    }

    #getButtonIndex(button) {
        for (let i = 0; i < this.buttons.length; i++) {
            let current = this.buttons[i];
            if (current == button)
                return i;
        }

        return -1;
    }

    show() {
        this.horizontalDiv.style.display = "";
    }

    hide() {
        this.horizontalDiv.style.display = "none";
    }
}