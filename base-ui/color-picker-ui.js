class ColorPicker {
    previewElement;

    constructor(parentElement) {
        this.previewElement = createElement("div", parentElement, "color-picker-preview");
        this.previewElement.role = "button";
    }
}