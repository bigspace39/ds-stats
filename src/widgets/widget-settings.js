import { DialogBoxUI } from "../base-ui/dialog-box-ui.js";
import { ButtonStyle, UIBuilder } from "../base-ui/ui-builder.js";
import { ElementStatics } from "../library/element-statics.js";
import { WidgetStatics } from "../library/widget-statics.js";

export class WidgetSettingsDialog extends DialogBoxUI
{
    /** @type {import("./widget.js").Widget} */
    widget;
    /** @type {HTMLDivElement} */
    footer;
    /** @type {HTMLButtonElement} */
    applyButton;
    /** @type {HTMLButtonElement} */
    revertButton;

    /**
     * Creates a widget settings dialog for the given widget.
     * @param {import("./widget.js").Widget} widget Widget that this dialog is connected to.
     */
    constructor(widget) {
        super();
        this.widget = widget;
        this.setTitle(`${widget.getWidgetName()} Settings`);

        this.footer = UIBuilder.createElement("div", this.div, "dialog-footer");
        this.applyButton = UIBuilder.createButton("Apply", this.footer);
        ElementStatics.bindOnClick(this.applyButton, this, function() {
            this.saveSettings(this.widget.settings);
            this.widget.saveWidget();
            this.widget.update();
        });

        this.revertButton = UIBuilder.createButton("Revert", this.footer, ButtonStyle.Cancel);
        ElementStatics.bindOnClick(this.revertButton, this, function() {
            this.loadSettings(this.widget.settings);
        });

        this.revertButton.style.marginRight = "10px";
    }

    /**
     * Set defaults for widget settings.
     * @param {Object} settings Settings object to modify.
     * @abstract
     */
    setSettingsDefaults(settings) {

    }

    /**
     * Loads the settings into the dialog.
     * @param {Object} settings Settings object.
     * @abstract
     */
    loadSettings(settings) {

    }

    /**
     * Saves the settings from the dialog into the settings object.
     * @param {Object} settings Settings object
     * @abstract
     */
    saveSettings(settings) {
        
    }

    show() {
        super.show();
        this.loadSettings(this.widget.settings);
    }
}