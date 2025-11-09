import { DialogBoxUI } from "../base-ui/dialog-box-ui.js";
import { ButtonStyle, UIBuilder } from "../base-ui/ui-builder.js";
import { Statics } from "../library/statics.js";
import { WidgetStatics } from "../library/widget-statics.js";

export class WidgetSettingsDialog extends DialogBoxUI
{
    widget;
    footer;
    applyButton;
    revertButton;

    constructor(widget) {
        super();
        this.widget = widget;
        let WidgetClass = WidgetStatics.possibleWidgets[widget.classIndex];
        this.setTitle(`${WidgetClass.displayName || WidgetClass.name} Settings`);

        this.footer = UIBuilder.createElement("div", this.div, "dialog-footer");
        this.applyButton = UIBuilder.createButton("Apply", this.footer);
        this.applyButton.settingsDialog = this;
        this.applyButton.addEventListener("click", function() {
            this.settingsDialog.saveSettings(this.settingsDialog.widget.settings);
            this.settingsDialog.widget.saveWidget();
            this.settingsDialog.widget.update();
        });

        this.revertButton = UIBuilder.createButton("Revert", this.footer, ButtonStyle.Cancel);
        this.revertButton.settingsDialog = this;
        this.revertButton.addEventListener("click", function() {
            this.settingsDialog.loadSettings(this.settingsDialog.widget.settings);
        });

        this.revertButton.style.marginRight = "10px";
    }

    setSettingsDefaults(settings) {

    }

    loadSettings(settings) {

    }

    saveSettings(settings) {
        
    }

    show() {
        super.show();
        this.loadSettings(this.widget.settings);
    }
}