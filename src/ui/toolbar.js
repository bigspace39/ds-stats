import { Statics } from "../library/statics.js";
import { API } from "../diapstash-api.js";
import { WidgetStatics } from "../library/widget-statics.js";
import { UIBuilder } from "../base-ui/ui-builder.js";

class Toolbar {
    static {
        Statics.toolbar = new Toolbar();
    }

    div;
    createWidgetButton;
    refreshButton;
    settingsButton;
    editButton;

    refreshButtonSpinner;

    constructor() {
        this.div = UIBuilder.createElement("div", Statics.mainDiv, "toolbar");
        this.createWidgetButton = this.createToolbarButton("+");
        this.createWidgetButton.addEventListener("click", function() {
            Statics.addWidgetDialog.show();
        });

        this.refreshButton = this.createToolbarButton("");
        this.refreshButton.addEventListener("click", async function() {
            if (API.isFetching)
                return;

            if (!await API.fetchData())
                await WidgetStatics.updateWidgetsOnSelectedDashboard();
        });
        
        this.refreshButtonSpinner = UIBuilder.createElement("span", this.refreshButton, "refresh");
        this.deactivateSpinner();
        
        API.onStartFetchAPIData.addFunction(this, function() {
            this.activateSpinner();
        });

        API.onStopFetchAPIData.addFunction(this, function() {
            this.deactivateSpinner();
        });

        this.settingsButton = this.createToolbarButton("⚙");
        this.settingsButton.addEventListener("click", function() {
            Statics.settingsDialog.show();
        });

        this.editButton = this.createToolbarButton("✎");
        this.editButton.addEventListener("click", function() {
            WidgetStatics.toggleInEditMode();
        });
    }

    createToolbarButton(text) {
        let temp = UIBuilder.createElement("button", this.div, "toolbar-button");
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