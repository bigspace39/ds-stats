import { Database, DatabaseStore } from "../database.js";
import { Library } from "../library/library.js";
import { WidgetStatics } from "../library/widget-statics.js";

export class Widget {
    mainDiv = null;
    contentDiv = null;
    deleteButton = null;
    settingsButton = null;
    draggable = null;
    settingsDialog = null;
    settings = new Object();
    widgetId = -1;
    classIndex = -1;
    dashboardId = -1;
    isUpdating = false;
    additionalUpdateQueued = false;
    selectWidgetButton = null;

    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        this.mainDiv = Library.createElement("div", dashboardElement, "widget");
        this.contentDiv = Library.createElement("div", this.mainDiv, "widget-content");
        this.deleteButton = Library.createElement("button", this.mainDiv, "widget-delete-button");
        this.deleteButton.innerText = "✕";
        this.deleteButton.addEventListener("click", function() {
            this.widget.destroy();
        });
        this.deleteButton.widget = this;

        this.classIndex = classIndex;
        this.dashboardId = dashboardId;
        if (widgetId >= 0) {
            this.widgetId = widgetId;
        }
        else {
            this.determineId();
        }

        let dialogClass = this.getSettingsDialogClass();
        if (dialogClass != null) {
            this.settingsButton = Library.createElement("button", this.mainDiv, "widget-settings-button");
            this.settingsButton.innerText = "⚙";
            this.settingsDialog = new dialogClass(this);
            this.settingsDialog.hide();
            this.settingsButton.widget = this;

            this.settingsButton.addEventListener("click", function() {
                this.widget.settingsDialog.show();
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

        this.selectWidgetButton = Library.createElement("button", this.mainDiv, "widget-select-button");
        this.selectWidgetButton.style.display = "none";
        let WidgetClass = WidgetStatics.possibleWidgets[this.classIndex];
        this.selectWidgetButton.innerText = `${WidgetClass.displayName || WidgetClass.name} (${this.widgetId})`;
        
        this.saveWidget();
        // @ts-ignore
        this.draggable = Draggable.create(this.mainDiv, {bounds: dashboardElement, onDragEnd: this.savePosition, onDragEndParams: [this]})[0];
        this.exitEditMode();
    }

    // Since update is async, there is a possibility for undefined behavior if it's being called while it's already running.
    // To fix this, we should delay additional updates until the current update has finished.
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

    async update_implementation() {}

    getSettingsDialogClass() {
        return null;
    }

    setSettingsDefaults(settings) {

    }

    onPostDeserializeSettings() {

    }

    getSerializableSettings() {
        return this.settings;
    }

    enterEditMode() {
        this.draggable.enable();
        this.deleteButton.style.display = "";

        if (this.settingsButton != null)
            this.settingsButton.style.display = "";
    }

    exitEditMode() {
        this.draggable.disable();
        this.deleteButton.style.display = "none";

        if (this.settingsButton != null)
            this.settingsButton.style.display = "none";
    }

    destroy() {
        this.mainDiv.innerHTML = "";
        this.mainDiv.remove();
        WidgetStatics.createdWidgets.delete(this.widgetId);
        Database.deleteFromObjectStore(DatabaseStore.Widgets, this.widgetId);
    }

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

    savePosition(widget) {
        widget.saveWidget();
    }

    determineId() {
        for (let i = 0; i <= WidgetStatics.createdWidgets.size; i++) {
            if (WidgetStatics.createdWidgets.has(i))
                continue;

            this.widgetId = i;
            break;
        }
    }
}