import { ElementStatics } from "../library/element-statics.js";
import { Statics } from "../library/statics.js";
import { UIBuilder } from "./ui-builder.js";

export class DialogBoxUI {
    /** @type {HTMLDivElement} */
    background;
    /** @type {HTMLDivElement} */
    div;
    /** @type {HTMLDivElement} */
    header;
    /** @type {HTMLHeadingElement} */
    title;
    /** @type {HTMLButtonElement} */
    closeButton;
    /** @type {HTMLDivElement} */
    content;

    /**
     * Will create a dialog box popup.
     */
    constructor() {
        this.background = UIBuilder.createElement("div", Statics.mainDiv, "dialog-background");
        this.div = UIBuilder.createElement("div", this.background, "dialog");
        this.header = UIBuilder.createElement("div", this.div, "dialog-header");
        this.title = UIBuilder.createElement("h1", this.header, "dialog-title");
        this.setTitle("Dialog Box");
        this.closeButton = UIBuilder.createElement("button", this.header, "dialog-close");
        this.closeButton.innerText = "✕";
        ElementStatics.bindOnClick(this.closeButton, this, function(element) {
            this.hide();
        });

        this.content = UIBuilder.createElement("div", this.div, "dialog-content");
    }

    /**
     * Sets the title of the dialog box
     * @param {string} text 
     */
    setTitle(text) {
        this.title.innerText = text;
    }

    show() {
        this.background.style.display = "";
    }

    hide() {
        this.background.style.display = "none";
    }
}