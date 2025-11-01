class SpinnerUI {
    span;

    constructor(parentElement, startHidden = true) {
        this.span = createElement("span", parentElement, "spinner");
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