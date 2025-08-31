class DiaperTypeFilter {
    button;
    tippy;
    tooltipParentDiv;

    constructor(parentElement) {
        this.button = createElement("div", parentElement, "diaper-type-filter");
        this.button.role = "button";
        this.button.innerText = "0 filters active";

        this.tooltipParentDiv = createElement("div", null, "diaper-type-filter-edit");
        this.tippy = tippy(this.button, {
            content: this.tooltipParentDiv,
            placement: "right",
            zIndex: 2147483647 - 25,
            theme: "light",
            interactive: true
        });
    }
}