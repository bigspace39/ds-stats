class Toolbar {
    div;
    createWidgetButton;
    settingsButton;
    editButton;

    constructor() {
        this.div = createElement("div", mainDiv, "toolbar");
        this.createWidgetButton = this.createToolbarButton("+");
        this.createWidgetButton.addEventListener("click", function() {
            addWidgetDialog.show();
        });

        this.settingsButton = this.createToolbarButton("⚙");
        this.settingsButton.addEventListener("click", function() {
            settingsDialog.show();
        });

        this.editButton = this.createToolbarButton("✎");
        this.editButton.addEventListener("click", function() {
            toggleInEditMode();
        });
    }

    createToolbarButton(text) {
        let temp = createElement("button", this.div, "toolbar-button");
        temp.innerText = text;
        return temp;
    }
}

toolbar = new Toolbar();