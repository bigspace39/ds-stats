import { UIBuilder } from "./ui-builder.js";

export class CollapsibleUI {
    collapsibleButton;
    collapsibleContent;
    collapsed = true;

    constructor(parentElement, labelText, startCollapsed = true) {
        this.collapsibleButton = UIBuilder.createElement("button", parentElement, "collapsible-button");
        this.collapsibleContent = UIBuilder.createElement("div", parentElement, "collapsible-content");
        this.setLabelText(labelText);

        if (!startCollapsed)
            this.toggleCollapsed();
        else
            this.collapsibleContent.style.display = "none";

        this.collapsibleButton.collapsibleUI = this;
        this.collapsibleButton.addEventListener("click", function() {
            this.collapsibleUI.toggleCollapsed();
        });
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsibleContent.style.display = this.collapsed ? "none" : "";
        this.collapsibleButton.id = this.collapsed ? "collapsible-button" : "collapsible-button-open";
    }

    setLabelText(labelText) {
        this.collapsibleButton.innerText = labelText;
    }

    show() {
        this.collapsibleButton.style.display = "";
        if (!this.collapsed)
            this.collapsibleContent.style.display = "";
    }

    hide() {
        this.collapsibleButton.style.display = "none";
        if (!this.collapsed)
            this.collapsibleContent.style.display = "none";
    }
}