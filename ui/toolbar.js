class Toolbar {
    div;
    createWidgetButton;
    refreshButton;
    settingsButton;
    editButton;

    refreshButtonSpinner;

    constructor() {
        this.div = createElement("div", mainDiv, "toolbar");
        this.createWidgetButton = this.createToolbarButton("+");
        this.createWidgetButton.addEventListener("click", function() {
            addWidgetDialog.show();
        });

        this.refreshButton = this.createToolbarButton("");
        this.refreshButton.addEventListener("click", async function() {
            if (isFetching)
                return;

            await fetchData();
        });
        
        this.refreshButtonSpinner = createElement("span", this.refreshButton, "spinner");
        this.deactivateSpinner();
        
        onStartFetchAPIData.addFunction(this, function() {
            this.activateSpinner();
        });

        onStopFetchAPIData.addFunction(this, function() {
            this.deactivateSpinner();
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

    deactivateSpinner() {
        this.refreshButtonSpinner.id = "inactive-spinner";
    }

    activateSpinner() {
        this.refreshButtonSpinner.id = "spinner";
    }
}

toolbar = new Toolbar();