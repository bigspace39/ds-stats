import { UIBuilder } from "../base-ui/ui-builder.js";
import { Database, DatabaseStore } from "../database.js";
import { ElementStatics } from "../library/element-statics.js";
import { WidgetStatics } from "../library/widget-statics.js";

export class Widget {
    /** @type {string} */
    static displayName = undefined;

    /** @type {HTMLDivElement} */
    mainDiv = null;
    /** @type {HTMLDivElement} */
    contentDiv = null;
    /** @type {HTMLButtonElement} */
    deleteButton = null;
    /** @type {HTMLButtonElement} */
    settingsButton = null;
    draggable = null;
    /** @type {import("./widget-settings.js").WidgetSettingsDialog} */
    settingsDialog = null;
    settings = new Object();
    widgetId = -1;
    classIndex = -1;
    dashboardId = -1;
    isUpdating = false;
    additionalUpdateQueued = false;
    /** @type {HTMLButtonElement} */
    selectWidgetButton = null;

    /**
     * Creates a new widget.
     * @param {HTMLDivElement} dashboardElement The dashboard div element.
     * @param {number} classIndex The class index for the widget.
     * @param {number} dashboardId The dashboardId of the parent dashbaord.
     * @param {number} widgetId The widgetId to assign to this widget.
     * @param {string} transform The transform style to apply to this widget.
     * @param {Object} widgetSettings The widget settings.
     */
    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        this.mainDiv = UIBuilder.createElement("div", dashboardElement, "widget");
        this.contentDiv = UIBuilder.createElement("div", this.mainDiv, "widget-content");
        this.deleteButton = UIBuilder.createElement("button", this.mainDiv, "widget-delete-button");
        this.deleteButton.innerText = "✕";
        ElementStatics.bindOnClick(this.deleteButton, this, function() {
            this.destroy();
        });

        this.classIndex = classIndex;
        this.dashboardId = dashboardId;
        if (widgetId >= 0) {
            this.widgetId = widgetId;
        }
        else {
            this.#determineId();
        }

        let dialogClass = this.getSettingsDialogClass();
        if (dialogClass != null) {
            this.settingsButton = UIBuilder.createElement("button", this.mainDiv, "widget-settings-button");
            this.settingsButton.innerText = "⚙";
            this.settingsDialog = new dialogClass(this);
            this.settingsDialog.hide();

            ElementStatics.bindOnClick(this.settingsButton, this, function() {
                this.settingsDialog.show();
            });
        }

        WidgetStatics.createdWidgets.set(this.widgetId, this);
        if (transform != null)
            this.mainDiv.style.transform = transform;

        this.setSettingsDefaults(this.settings);
        if (this.settingsDialog) {
            this.settingsDialog.setSettingsDefaults(this.settings);
        }

        if (widgetSettings) {
            Object.assign(this.settings, widgetSettings);
            this.onPostDeserializeSettings();
        }

        this.selectWidgetButton = UIBuilder.createElement("button", this.mainDiv, "widget-select-button");
        this.selectWidgetButton.style.display = "none";
        this.selectWidgetButton.innerText = `${this.getWidgetName()} (${this.widgetId})`;
        
        this.saveWidget();
        // @ts-ignore
        this.draggable = Draggable.create(this.mainDiv, {bounds: dashboardElement, onDragEnd: this.#savePosition, onDragEndParams: [this]})[0];
        this.exitEditMode();
    }

    /**
     * This update function should never be implemented in subclasses, only called.
     */
    async update() {
        if (this.isUpdating) {
            this.additionalUpdateQueued = true;
            return;
        }

        this.isUpdating = true;
        await this.update_implementation();
        this.isUpdating = false;

        if (this.additionalUpdateQueued) {
            this.additionalUpdateQueued = false;
            this.update();
        }
    }

    /**
     * The main update function
     * @abstract
     * @protected
     */
    async update_implementation() {}

    /**
     * Get the widget settings dialog class.
     * @returns {typeof import("./widget-settings.js").WidgetSettingsDialog}
     * @abstract
     */
    getSettingsDialogClass() {
        return null;
    }

    /**
     * Set the settings default, either do it here or in the settings dialog class, or both.
     * @param {Object} settings The settings object to modify.
     * @abstract
     */
    setSettingsDefaults(settings) {

    }

    /**
     * Shouldn't need to be implemented in most cases, but if settings include maps or other stuff that can't be cleanly converted from JSON and back.
     * Then you can convert it back to their actual types here!
     * @abstract
     */
    onPostDeserializeSettings() {

    }

    /**
     * Shouldn't need to be implemented in most cases, but if settings include maps or other stuff that can't be cleanly converted from JSON and back.
     * Then you can convert it to a simpler format here just before it is serialized.
     * @returns {Object} settings object to save.
     */
    getSerializableSettings() {
        return this.settings;
    }

    getWidgetName() {
        let WidgetClass = WidgetStatics.possibleWidgets[this.classIndex];
        // @ts-ignore
        return WidgetClass.displayName || WidgetClass.name;
    }

    /**
     * Enters edit mode (which means you can drag/delete/config widgets)
     */
    enterEditMode() {
        this.draggable.enable();
        this.deleteButton.style.display = "";

        if (this.settingsButton != null)
            this.settingsButton.style.display = "";
    }

    /**
     * Exits edit mode (which means you can no longer drag/delete/config widgets)
     */
    exitEditMode() {
        this.draggable.disable();
        this.deleteButton.style.display = "none";

        if (this.settingsButton != null)
            this.settingsButton.style.display = "none";
    }

    /**
     * Destroys the widget and deletes it from the database.
     */
    destroy() {
        this.mainDiv.innerHTML = "";
        this.mainDiv.remove();
        WidgetStatics.createdWidgets.delete(this.widgetId);
        Database.deleteFromObjectStore(DatabaseStore.Widgets, this.widgetId);
    }

    /**
     * Saves the widget and it's settings to the database.
     */
    saveWidget() {
        let temp = {
            id: this.widgetId,
            class: this.classIndex,
            dashboardId: this.dashboardId,
            transform: this.mainDiv.style.transform,
            settings: this.getSerializableSettings()
        }
        Database.putInObjectStore(DatabaseStore.Widgets, temp);
    }

    #savePosition(widget) {
        widget.saveWidget();
    }

    #determineId() {
        for (let i = 0; i <= WidgetStatics.createdWidgets.size; i++) {
            if (WidgetStatics.createdWidgets.has(i))
                continue;

            this.widgetId = i;
            break;
        }
    }
}