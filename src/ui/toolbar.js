import { Library, WidgetStatics } from "../library.js";
import { API } from "../diapstash-api.js";

export class Toolbar {
    div;
    createWidgetButton;
    refreshButton;
    settingsButton;
    editButton;

    refreshButtonSpinner;

    constructor() {
        this.div = Library.createElement("div", Library.mainDiv, "toolbar");
        this.createWidgetButton = this.createToolbarButton("+");
        this.createWidgetButton.addEventListener("click", function() {
            Library.addWidgetDialog.show();
        });

        this.refreshButton = this.createToolbarButton("");
        this.refreshButton.addEventListener("click", async function() {
            if (API.isFetching)
                return;

            if (!await API.fetchData())
                WidgetStatics.updateWidgetsOnSelectedDashboard();
        });
        
        this.refreshButtonSpinner = Library.createElement("span", this.refreshButton, "refresh");
        this.deactivateSpinner();
        
        API.onStartFetchAPIData.addFunction(this, function() {
            this.activateSpinner();
        });

        API.onStopFetchAPIData.addFunction(this, function() {
            this.deactivateSpinner();
        });

        this.settingsButton = this.createToolbarButton("⚙");
        this.settingsButton.addEventListener("click", function() {
            Library.settingsDialog.show();
        });

        this.editButton = this.createToolbarButton("✎");
        this.editButton.addEventListener("click", function() {
            WidgetStatics.toggleInEditMode();
        });
    }

    createToolbarButton(text) {
        let temp = Library.createElement("button", this.div, "toolbar-button");
        temp.innerText = text;
        return temp;
    }

    deactivateSpinner() {
        this.refreshButtonSpinner.id = "inactive-refresh";
    }

    activateSpinner() {
        this.refreshButtonSpinner.id = "refresh";
    }
}