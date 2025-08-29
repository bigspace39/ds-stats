class DiaperTypeFilter {
    button;
    editWindow;

    constructor(parentElement) {
        this.button = createElement("div", parentElement, "diaper-type-filter");
        this.button.role = "button";
        this.button.innerText = "0 filters active";
        this.editWindow = createElement("div", this.button, "diaper-type-edit");
    }
}