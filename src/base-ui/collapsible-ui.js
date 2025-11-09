import { ElementStatics } from "../library/element-statics.js";
import { UIBuilder } from "./ui-builder.js";

export class CollapsibleUI {
    /** @type {HTMLButtonElement} */
    collapsibleButton;
    /** @type {HTMLDivElement} */
    collapsibleContent;
    collapsed = true;

    /**
     * Will create a collapsible UI element where you can collapse child elements by setting their parent to collapsibleContent
     * @param {HTMLElement} parentElement The parent element.
     * @param {*} labelText The label for the collapsible.
     * @param {*} startCollapsed Whether the collapsible should start collapsed or not.
     */
    constructor(parentElement, labelText, startCollapsed = true) {
        this.collapsibleButton = UIBuilder.createElement("button", parentElement, "collapsible-button");
        this.collapsibleContent = UIBuilder.createElement("div", parentElement, "collapsible-content");
        this.setLabelText(labelText);

        if (!startCollapsed)
            this.toggleCollapsed();
        else
            this.collapsibleContent.style.display = "none";

        ElementStatics.bindOnClick(this.collapsibleButton, this, function() {
            this.toggleCollapsed();
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