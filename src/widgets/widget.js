import { UIBuilder } from "../base-ui/ui-builder.js";
import { Database, DatabaseStore } from "../database.js";
import { DashboardStatics } from "../library/dashboard-statics.js";
import { ElementStatics } from "../library/element-statics.js";
import { WidgetStatics } from "../library/widget-statics.js";

export class WidgetConnectionDefinition {
    /** @type {typeof Widget} */
    widgetType;
    /** @type {boolean} */
    isRequired;

    /**
     * @param {typeof Widget} widgetType The widget class to allow connections to.
     * @param {boolean} isRequired Whether or not this connection is required for the widget to function.
     */
    constructor(widgetType, isRequired) {
        this.widgetType = widgetType;
        this.isRequired = isRequired;
    }
}

export class Widget {
    /** @type {string | undefined} */
    static displayName = undefined;

    /** @type {HTMLDivElement} */
    mainDiv;
    /** @type {HTMLDivElement} */
    contentDiv;
    /** @type {HTMLButtonElement} */
    deleteButton;
    /** @type {HTMLButtonElement?} */
    settingsButton = null;
    draggable;
    /** @type {import("./widget-settings.js").WidgetSettingsDialog?} */
    settingsDialog = null;
    settings = new Object();
    widgetId = -1;
    classIndex = -1;
    dashboardId = -1;
    isUpdating = false;
    additionalUpdateQueued = false;
    /** @type {HTMLButtonElement} */
    selectWidgetButton;
    /** @type {Map<typeof Widget, Widget?>} */
    connectedWidgets = new Map();
    requireConnectWidgetOverlay;
    requireConnectWidgetText;

    createWidgetFunction;
    moveWidgetFunction;
    postDestroyWidgetFunction;

    /**
     * Creates a new widget.
     * @param {HTMLDivElement} dashboardElement The dashboard div element.
     * @param {number} classIndex The class index for the widget.
     * @param {number} dashboardId The dashboardId of the parent dashbaord.
     * @param {number} widgetId The widgetId to assign to this widget.
     * @param {string?} transform The transform style to apply to this widget.
     * @param {Object?} widgetSettings The widget settings.
     */
    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        this.mainDiv = UIBuilder.createElement("div", dashboardElement, "widget");
        this.contentDiv = UIBuilder.createElement("div", this.mainDiv, "widget-content");

        this.requireConnectWidgetOverlay = UIBuilder.createElement("div", this.mainDiv, "widget-overlay");
        this.requireConnectWidgetText = UIBuilder.createElement("h2", this.requireConnectWidgetOverlay, "widget-overlay-text");
        this.requireConnectWidgetOverlay.style.display = "none";

        this.deleteButton = UIBuilder.createElement("button", this.mainDiv, "widget-delete-button");
        this.deleteButton.innerText = "✕";
        ElementStatics.bindOnClick(this.deleteButton, this, function() {
            WidgetStatics.destroyWidget(this.widgetId);
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
                // @ts-ignore
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
        this.draggable = Draggable.create(this.mainDiv, {bounds: dashboardElement, onDragEnd: this.#onDragEnd, onDragEndParams: [this]})[0];
        this.exitEditMode();

        if (this.getConnectableWidgetClasses().length == 0)
            return;

        this.createWidgetFunction = WidgetStatics.onCreateWidget.addFunction(this, this.#updateConnectedWidgets);
        this.moveWidgetFunction = WidgetStatics.onMoveWidget.addFunction(this, this.#updateConnectedWidgets);
        this.postDestroyWidgetFunction = WidgetStatics.onPostDestroyWidget.addFunction(this, this.#updateConnectedWidgets);
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
     * @returns {typeof import("./widget-settings.js").WidgetSettingsDialog?}
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

    /**
     * Define widget types that this widget can connect to, in order to fetch data from them. 
     * Like a time period selector providing a start/end time to filter specific stats.
     * @returns {WidgetConnectionDefinition[]}
     */
    getConnectableWidgetClasses() {
        return []
    }

    /**
     * Returns the connected widget of the supplied type if there is one.
     * @param {typeof Widget} widgetType
     * @returns {Widget?}
     */
    getConnectedWidget(widgetType) {
        if (!this.connectedWidgets.has(widgetType))
            return null;

        let result = this.connectedWidgets.get(widgetType);
        if (result == undefined)
            return null;

        return result;
    }

    getWidgetName() {
        let WidgetClass = WidgetStatics.possibleWidgets[this.classIndex];
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

        if (this.createWidgetFunction == null || this.moveWidgetFunction == null || this.postDestroyWidgetFunction == null)
            return;

        WidgetStatics.onCreateWidget.removeFunction(this.createWidgetFunction);
        WidgetStatics.onMoveWidget.removeFunction(this.moveWidgetFunction);
        WidgetStatics.onPreDestroyWidget.removeFunction(this.postDestroyWidgetFunction);
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

    /**
     * 
     * @param {Widget} widget 
     */
    #onDragEnd(widget) {
        widget.saveWidget();
        WidgetStatics.onMoveWidget.broadcast(this);
    }

    /**
     * Will update the map of closest connected widgets.
     */
    #updateConnectedWidgets() {
        /** @type {typeof Widget[]} */
        let missingRequiredWidgetTypes = [];

        let connectableWidgets = this.getConnectableWidgetClasses();
        for (let i = 0; i < connectableWidgets.length; i++) {
            let connectableWidget = connectableWidgets[i];
            /** @type {Widget?} */
            let closestWidget = null;
            let closestSqrDist = Number.MAX_VALUE;
            for (let [key, value] of WidgetStatics.createdWidgets) {
                if (value.dashboardId != this.dashboardId)
                    continue;

                if (!WidgetStatics.widgetIsOfClass(value, connectableWidget.widgetType))
                    continue;

                let sqrDist = WidgetStatics.getSqrDistanceBetweenWidgets(this, value);
                if (sqrDist < closestSqrDist) {
                    closestSqrDist = sqrDist;
                    closestWidget = value;
                }
            }

            if (closestWidget == null && connectableWidget.isRequired) {
                missingRequiredWidgetTypes.push(connectableWidget.widgetType);
            }

            this.connectedWidgets.set(connectableWidget.widgetType, closestWidget);
        }

        if (missingRequiredWidgetTypes.length == 0) {
            this.requireConnectWidgetOverlay.style.display = "none";
            return;
        }

        let str = "Requires ";
        let first = true
        for (let type of missingRequiredWidgetTypes) {
            if (!first)
                str += ", ";
            first = false;
            str += type.displayName || type.name;
        }

        this.requireConnectWidgetText.textContent = str;
        this.requireConnectWidgetOverlay.style.display = "";
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