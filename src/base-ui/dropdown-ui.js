import { Library, Delegate } from "../library.js";

export class DropdownUI {
    dropdownElement;
    optionElements = new Array();
    onChange = new Delegate();

    constructor(parentElement, ...initialOptions) {
        this.dropdownElement = Library.createElement("select", parentElement, null);

        for (let i = 0; i < initialOptions.length; i++) {
            let option = initialOptions[i];
            this.#createOptionElement(option, i);
        }

        this.dropdownElement.addEventListener("change", function() {
            this.dropdown.onChange.broadcast(this.dropdown, this.dropdown.getSelectedIndex());
        });
        this.dropdownElement.dropdown = this;
    }

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

    getSelectedIndex() {
        return parseInt(this.dropdownElement.value);
    }

    getSelectedText() {
        return this.dropdownElement.text;
    }

    setSelectedIndex(index) {
        this.dropdownElement.value = index;
    }

    setSelectedText(text) {
        let index = -1;
        for (let i = 0; i < this.optionElements.length; i++) {
            let optionElement = this.optionElements[i];
            if (optionElement.innerText == text) {
                index = i;
                break;
            }
        }

        if (index == -1) {
            console.error(`Tried to set selected text with text ${text} but that text doesn't exist in the dropdown`);
            return;
        }

        this.setSelectedIndex(index);
    }

    #createOptionElement(text, value) {
        let optionElement = Library.createElement("option", this.dropdownElement);
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