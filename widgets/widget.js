let possibleWidgets = [];
let createdWidgets = new Map();
let inEditMode = false;

function createWidget(dashboardId, widgetClassIndex, widgetId = -1, transform = null, settings = null) {
    let WidgetClass = possibleWidgets[widgetClassIndex];
    let dashboad = dashboards.get(dashboardId);
    let widget = new WidgetClass(dashboad.board, widgetClassIndex, dashboardId, widgetId, transform, settings);
    return widget;
}

function destroyWidget(widgetId) {
    let widget = createdWidgets.get(widgetId);
    widget.destroy();
}

function toggleInEditMode() {
    setInEditMode(!inEditMode);
}

function updateWidgetsOnSelectedDashboard() {
    createdWidgets.forEach(function(value, key, map) {
        if (value.dashboardId != selectedDashboard.boardId)
            return;

        value.update();
    });
}

function setInEditMode(value) {
    inEditMode = value;
    if (inEditMode) {
        toolbar.editButton.innerText = "✓";
    }
    else {
        toolbar.editButton.innerText = "✎";
    }

    let tempWidgets = Array.from(createdWidgets.values());
    for (let i = 0; i < tempWidgets.length; i++) {
        if (inEditMode)
            tempWidgets[i].enterEditMode();
        else
            tempWidgets[i].exitEditMode();
    }
}

function widgetIsOfClass(widget, WidgetClass) {
    let widgetClass = possibleWidgets[widget.classIndex];
    return widgetClass.name == WidgetClass;
}

class Widget {
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
        this.mainDiv = createElement("div", dashboardElement, "widget");
        this.contentDiv = createElement("div", this.mainDiv, "widget-content");
        this.deleteButton = createElement("button", this.mainDiv, "widget-delete-button");
        this.deleteButton.innerText = "✕";
        this.deleteButton.addEventListener("click", function() {
            this.widget.destroy();
        });
        this.deleteButton.widget = this;

        let dialogClass = this.getSettingsDialogClass();
        if (dialogClass != null) {
            this.settingsButton = createElement("button", this.mainDiv, "widget-settings-button");
            this.settingsButton.innerText = "⚙";
            this.settingsButton.addEventListener("click", function() {
                if (this.widget.settingsDialog == null) {
                    this.widget.settingsDialog = new this.dialogClass(this.widget);
                }
                else {
                    this.widget.settingsDialog.show();
                }
            });
            this.settingsButton.widget = this;
            this.settingsButton.dialogClass = dialogClass;
        }

        this.classIndex = classIndex;
        this.dashboardId = dashboardId;
        if (widgetId >= 0) {
            this.widgetId = widgetId;
        }
        else {
            this.determineId();
        }

        createdWidgets.set(this.widgetId, this);
        if (transform != null)
            this.mainDiv.style.transform = transform;

        this.setSettingsDefaults(this.settings);
        if (widgetSettings) {
            Object.assign(this.settings, widgetSettings);
            this.onPostDeserializeSettings();
        }

        this.selectWidgetButton = createElement("button", this.mainDiv, "widget-select-button");
        this.selectWidgetButton.style.display = "none";
        let WidgetClass = possibleWidgets[this.classIndex];
        this.selectWidgetButton.innerText = `${WidgetClass.displayName || WidgetClass.name} (${this.widgetId})`;
        
        this.saveWidget();
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
        createdWidgets.delete(this.widgetId);
        deleteFromObjectStore(widgetStoreName, this.widgetId);
    }

    saveWidget() {
        let temp = new Object();
        temp.id = this.widgetId;
        temp.class = this.classIndex;
        temp.dashboardId = this.dashboardId;
        temp.transform = this.mainDiv.style.transform;
        temp.settings = this.getSerializableSettings();
        putInObjectStore(widgetStoreName, temp);
    }

    savePosition(widget) {
        widget.saveWidget();
    }

    determineId() {
        for (let i = 0; i <= createdWidgets.size; i++) {
            if (createdWidgets.has(i))
                continue;

            this.widgetId = i;
            break;
        }
    }
}

class WidgetSettingsDialog extends DialogBoxUI
{
    widget;
    footer;
    applyButton;
    revertButton;

    constructor(widget) {
        super();
        this.widget = widget;
        let WidgetClass = possibleWidgets[widget.classIndex];
        this.setTitle(`${WidgetClass.displayName || WidgetClass.name} Settings`);

        this.footer = createElement("div", this.div, "dialog-footer");
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

    loadSettings(settings) {

    }

    saveSettings(settings) {
        
    }

    show() {
        super.show();
        this.loadSettings(this.widget.settings);
    }
}