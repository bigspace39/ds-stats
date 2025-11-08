import { Library } from "../library.js";

export class DialogBoxUI {
    background;
    div;
    header;
    title;
    closeButton;
    content;

    constructor() {
        this.background = Library.createElement("div", Library.mainDiv, "dialog-background");
        this.div = Library.createElement("div", this.background, "dialog");
        this.header = Library.createElement("div", this.div, "dialog-header");
        this.title = Library.createElement("h1", this.header, "dialog-title");
        this.setTitle("Dialog Box");
        this.closeButton = Library.createElement("button", this.header, "dialog-close");
        this.closeButton.innerText = "✕";
        this.closeButton.addEventListener("click", function() {
            this.dialog.hide();
        });
        this.closeButton.dialog = this;

        this.content = Library.createElement("div", this.div, "dialog-content");
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