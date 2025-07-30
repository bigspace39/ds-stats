let createdWidgets = new Map();
let createdStorageWidgets = new Map();

class Widget {
    mainDiv = null;
    headerDiv = null;
    widgetId = -1;
    classIndex = -1;

    create(parentElement, classIndex, widgetId = -1) {
        this.mainDiv = createElement("div", parentElement, "widget");
        this.headerDiv = createElement("div", this.mainDiv, "widget-header");

        this.classIndex = classIndex;
        if (widgetId >= 0) {
            this.widgetId = widgetId;
        }
        else {
            this.determineId();
        }

        createdWidgets.set(this.widgetId, this);
        createdStorageWidgets.set(this.widgetId, this.classIndex);
        localStorage.widgets = JSON.stringify(Array.from(createdStorageWidgets.entries()));
        this.mainDiv.style.transform = localStorage.getItem(this.getCookieBaseName() + "-pos");
        Draggable.create(this.mainDiv, {trigger: this.headerDiv, onDragEnd: this.savePosition, onDragEndParams: [this]});
    }

    destroy() {
        this.mainDiv.innerHTML = "";
        this.mainDiv.remove();
        createdWidgets.delete(this.widgetId);
        createdStorageWidgets.delete(this.widgetId);
        localStorage.widgets = JSON.stringify(Array.from(createdStorageWidgets.entries()));
    }

    getCookieBaseName() {
        return this.mainDiv.id + this.widgetId;
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