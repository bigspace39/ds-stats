import { Statics } from "../library/statics.js";
import { UIBuilder } from "./ui-builder.js";

export class DialogBoxUI {
    background;
    div;
    header;
    title;
    closeButton;
    content;

    constructor() {
        this.background = UIBuilder.createElement("div", Statics.mainDiv, "dialog-background");
        this.div = UIBuilder.createElement("div", this.background, "dialog");
        this.header = UIBuilder.createElement("div", this.div, "dialog-header");
        this.title = UIBuilder.createElement("h1", this.header, "dialog-title");
        this.setTitle("Dialog Box");
        this.closeButton = UIBuilder.createElement("button", this.header, "dialog-close");
        this.closeButton.innerText = "✕";
        this.closeButton.addEventListener("click", function() {
            this.dialog.hide();
        });
        this.closeButton.dialog = this;

        this.content = UIBuilder.createElement("div", this.div, "dialog-content");
    }

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