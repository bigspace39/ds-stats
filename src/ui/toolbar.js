import { Statics } from "../library/statics.js";
import { API } from "../diapstash-api.js";
import { WidgetStatics } from "../library/widget-statics.js";
import { UIBuilder } from "../base-ui/ui-builder.js";
import { ElementStatics } from "../library/element-statics.js";

export class Toolbar {
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
        ElementStatics.bindOnClick(this.createWidgetButton, this, function() {
            Statics.addWidgetDialog.show();
        });

        this.refreshButton = this.createToolbarButton("");
        ElementStatics.bindOnClick(this.refreshButton, this, async function() {
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
        ElementStatics.bindOnClick(this.settingsButton, this, function() {
            Statics.settingsDialog.show();
        });

        this.editButton = this.createToolbarButton("✎");
        ElementStatics.bindOnClick(this.editButton, this, function() {
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