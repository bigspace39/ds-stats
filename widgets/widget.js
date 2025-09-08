let possibleWidgets = [];
let createdWidgets = new Map();
let inEditMode = false;

function createWidget(dashboardId, widgetClassIndex, widgetId = -1, transform = null) {
    let WidgetClass = possibleWidgets[widgetClassIndex];
    let widget = new WidgetClass(dashboards.get(dashboardId).board, widgetClassIndex, dashboardId, widgetId, transform);
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

class Widget {
    mainDiv = null;
    contentDiv = null;
    deleteButton = null;
    settingsButton = null;
    draggable = null;
    widgetId = -1;
    classIndex = -1;
    dashboardId = -1;

    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null) {
        this.mainDiv = createElement("div", dashboardElement, "widget");
        this.contentDiv = createElement("div", this.mainDiv, "widget-content");
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
        if (transform != null)
            this.mainDiv.style.transform = transform;
        
        this.saveWidget();
        this.draggable = Draggable.create(this.mainDiv, {bounds: dashboardElement, onDragEnd: this.savePosition, onDragEndParams: [this]})[0];
        this.exitEditMode();
    }

    async update() {}

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
        deleteFromObjectStore(widgetStoreName, this.widgetId);
    }

    saveWidget() {
        let temp = new Object();
        temp.id = this.widgetId;
        temp.class = this.classIndex;
        temp.dashboardId = this.dashboardId;
        temp.transform = this.mainDiv.style.transform;
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