let possibleWidgets = [];
let createdWidgets = new Map();
let createdStorageWidgets = new Map();
let inEditMode = false;

function createWidget(dashboardId, widgetClassIndex, widgetId = -1) {
    let widget = Object.assign(Object.create(Object.getPrototypeOf(possibleWidgets[widgetClassIndex])), possibleWidgets[widgetClassIndex]);
    widget.create(dashboards.get(dashboardId).board, widgetClassIndex, dashboardId, widgetId);
}

function destroyWidget(widgetId) {
    let widget = createdWidgets.get(widgetId);
    widget.destroy();
}

function toggleInEditMode() {
    setInEditMode(!inEditMode);
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

class Widget {
    mainDiv = null;
    deleteButton = null;
    settingsButton = null;
    draggable = null;
    widgetId = -1;
    classIndex = -1;
    dashboardId = -1;

    create(dashboardElement, classIndex, dashboardId, widgetId = -1) {
        this.mainDiv = createElement("div", dashboardElement, "widget");
        this.deleteButton = createElement("button", this.mainDiv, "widget-delete-button");
        this.deleteButton.innerText = "✕";
        this.deleteButton.addEventListener("click", function() {
            this.widget.destroy();
        });
        this.deleteButton.widget = this;

        this.settingsButton = createElement("button", this.mainDiv, "widget-settings-button");
        this.settingsButton.innerText = "⚙";
        this.settingsButton.addEventListener("click", function() {
            //this.widget.destroy();
        });
        this.settingsButton.widget = this;

        this.classIndex = classIndex;
        this.dashboardId = dashboardId;
        if (widgetId >= 0) {
            this.widgetId = widgetId;
        }
        else {
            this.determineId();
        }

        createdWidgets.set(this.widgetId, this);
        createdStorageWidgets.set(this.widgetId, {class: this.classIndex, dashboard: this.dashboardId});
        this.saveWidgets();
        this.mainDiv.style.transform = localStorage.getItem(this.getCookieBaseName() + "-pos");
        this.draggable = Draggable.create(this.mainDiv, {bounds: dashboardElement, onDragEnd: this.savePosition, onDragEndParams: [this]})[0];
        this.exitEditMode();
    }

    enterEditMode() {
        this.draggable.enable();
        this.deleteButton.style.display = "";
        this.settingsButton.style.display = "";
    }

    exitEditMode() {
        this.draggable.disable();
        this.deleteButton.style.display = "none";
        this.settingsButton.style.display = "none";
    }

    destroy() {
        this.mainDiv.innerHTML = "";
        this.mainDiv.remove();
        createdWidgets.delete(this.widgetId);
        createdStorageWidgets.delete(this.widgetId);
        this.saveWidgets();
    }

    getCookieBaseName() {
        return this.mainDiv.id + this.widgetId;
    }

    saveWidgets() {
        localStorage.widgets = JSON.stringify(Array.from(createdStorageWidgets.entries()));
    }

    savePosition(widget) {
        localStorage.setItem(widget.getCookieBaseName() + "-pos", widget.mainDiv.style.transform);
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