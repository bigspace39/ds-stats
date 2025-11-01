Coloris({
    el: ".coloris",
    theme: "polaroid",
    alpha: false,
    wrap: true
});

class ColorPickerUI {
    wrapperDiv;
    inputElement;
    previewButton;

    constructor(parentElement, id = null) {
        this.inputElement = createElement("input", parentElement, null);
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

    setColor(hexColor) {
        this.inputElement.value = hexColor;
        this.wrapperDiv.style.color = this.inputElement.value;
    }

    getColor() {
        return this.inputElement.value;
    }
}