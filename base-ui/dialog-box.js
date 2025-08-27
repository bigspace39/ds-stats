class DialogBox {
    background;
    div;
    header;
    title;
    closeButton;
    content;

    constructor() {
        this.background = createElement("div", mainDiv, "dialog-background");
        this.div = createElement("div", this.background, "dialog");
        this.header = createElement("div", this.div, "dialog-header");
        this.title = createElement("h1", this.header, "dialog-title");
        this.setTitle("Dialog Box");
        this.closeButton = createElement("button", this.header, "dialog-close");
        this.closeButton.innerText = "✕";
        this.closeButton.addEventListener("click", function() {
            this.dialog.hide();
        });
        this.closeButton.dialog = this;

        this.content = createElement("div", this.div, "dialog-content");
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