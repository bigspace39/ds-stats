let possibleWidgets = [];
let createdWidgets = new Map();
let createdStorageWidgets = new Map();

function createWidget(dashboardId, widgetClassIndex, widgetId = -1) {
    let widget = Object.assign(Object.create(Object.getPrototypeOf(possibleWidgets[widgetClassIndex])), possibleWidgets[widgetClassIndex]);
    widget.create(dashboards.get(dashboardId).board, widgetClassIndex, dashboardId, widgetId);
}

function destroyWidget(widgetId) {
    let widget = createdWidgets.get(widgetId);
    widget.destroy();
}

class Widget {
    mainDiv = null;
    widgetId = -1;
    classIndex = -1;
    dashboardId = -1;

    create(dashboardElement, classIndex, dashboardId, widgetId = -1) {
        this.mainDiv = createElement("div", dashboardElement, "widget");

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
        Draggable.create(this.mainDiv, {bounds: dashboardElement, onDragEnd: this.savePosition, onDragEndParams: [this]});
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