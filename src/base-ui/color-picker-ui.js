import { UIBuilder } from "./ui-builder.js";

// @ts-ignore
Coloris({
    el: ".coloris",
    theme: "polaroid",
    alpha: false,
    wrap: true
});

export class ColorPickerUI {
    /** @type {HTMLDivElement} */
    wrapperDiv;
    /** @type {HTMLInputElement} */
    inputElement;

    /**
     * Will create a color picker UI with a preview that when pressed opens up a color picker UI.
     * @param {HTMLElement} parentElement The parent element.
     * @param {string} id The id of the main wrapper div of this color picker.
     */
    constructor(parentElement, id = null) {
        this.inputElement = UIBuilder.createElement("input", parentElement, null);
        this.inputElement.type = "text";
        this.inputElement.className = "coloris";
        this.inputElement.value = "#000000";
        //this.inputElement.setAttribute("data-coloris", null);

        this.wrapperDiv = document.createElement('div');
        this.wrapperDiv.innerHTML = '<button type="button" id="coloris-button" aria-labelledby="clr-open-label"></button>';
        parentElement.insertBefore(this.wrapperDiv, this.inputElement);
        this.wrapperDiv.className = 'clr-field';
        if (id != null)
            this.wrapperDiv.id = id;
        this.wrapperDiv.style.color = this.inputElement.value;
        this.wrapperDiv.appendChild(this.inputElement);
    }

    /**
     * Sets the selected color of the color picker.
     * @param {string} hexColor The hex color.
     */
    setColor(hexColor) {
        this.inputElement.value = hexColor;
        this.wrapperDiv.style.color = this.inputElement.value;
    }

    /**
     * 
     * @returns {string} The selected hex color of the color picker.
     */
    getColor() {
        return this.inputElement.value;
    }

    show() {
        this.wrapperDiv.style.display = "";
    }

    hide() {
        this.wrapperDiv.style.display = "none";
    }
}