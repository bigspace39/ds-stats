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

        UIBuilder.setDefaultParent(this.tooltipParentDiv);
        UIBuilder.createHeading("Usage");
        new MultiSegmentedControl(this.tooltipParentDiv, "Disposable", "Reusable");
        UIBuilder.createHeading("Category (Disposable)");
        new MultiSegmentedControl(this.tooltipParentDiv, "Diaper (Tabs)", "Pull Up", "Pad (Anatomical)", "Insert / Booster");
        UIBuilder.createHeading("Category (Reusable)");
        new MultiSegmentedControl(this.tooltipParentDiv, "Cover", "All in One", "Mesh Pants", "Flat / Prefold", "Fitted");
        UIBuilder.createHeading("Target");
        new MultiSegmentedControl(this.tooltipParentDiv, "Abdl", "Medical", "Youth");
        UIBuilder.createHeading("Fasteners");
        new MultiSegmentedControl(this.tooltipParentDiv, "Snap", "Hook & Loop (Velcro)", "Elastic", "Drawstring", "Pin", "Adhesive Tab");
        UIBuilder.resetDefaultParent();
    }
}