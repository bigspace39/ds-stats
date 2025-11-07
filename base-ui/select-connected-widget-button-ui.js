class SelectConnectedWidgetButtonUI {
    topText;
    ownerWidget;
    horizontal;
    button;
    clearButton;
    connectedMonthGraphText;
    targetClassName;
    onSelectConnectedWidget = new Delegate();
    #currentConnectedWidgetId = -1;

    constructor(parentElement, ownerWidget, targetClassName) {
        let targetClass = getWidgetClassFromClassName(targetClassName);
        let targetName = targetClass.displayName || targetClass.name;

        this.topText = UIBuilder.createText(`Connected ${targetName}`);
        this.horizontal = UIBuilder.createHorizontal(parentElement);
        this.button = UIBuilder.createButton("Select", this.horizontal);
        this.clearButton = UIBuilder.createButton("Clear", this.horizontal, ButtonStyle.Cancel);
        this.clearButton.style.marginLeft = "6px";
        this.connectedMonthGraphText = UIBuilder.createText("None", this.horizontal);
        this.connectedMonthGraphText.style.marginLeft = "6px";

        this.ownerWidget = ownerWidget;
        this.targetClassName = targetClassName;
        this.button.selectConnectedWidget = this;
        this.button.addEventListener("click", function() {
            createdWidgets.forEach(function(value, key, map) {
                if (value.dashboardId != selectedDashboard.boardId)
                    return;

                if (!widgetIsOfClass(value, this.selectConnectedWidget.targetClassName))
                    return;

                value.selectWidgetButton.style.display = "";
                value.selectWidgetButton.targetWidget = value;
                value.selectWidgetButton.selectConnectedWidget = this.selectConnectedWidget;
                value.selectWidgetButton.onclick = function() {
                    this.selectConnectedWidget.exitSelectMode();
                    this.selectConnectedWidget.ownerWidget.settingsDialog.show();
                    this.selectConnectedWidget.setConnectedWidgetId(this.targetWidget.widgetId);
                    this.selectConnectedWidget.onSelectConnectedWidget.broadcast(this.targetWidget);
                };

            }, this);

            this.selectConnectedWidget.ownerWidget.settingsDialog.hide();
        });

        this.clearButton.selectConnectedWidget = this;
        this.clearButton.addEventListener("click", function() {
            this.selectConnectedWidget.setConnectedWidgetId(-1);
        });
    }

    exitSelectMode() {
        createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != selectedDashboard.boardId)
                return;

            if (!widgetIsOfClass(value, this.targetClassName))
                return;

            value.selectWidgetButton.style.display = "none";
            value.selectWidgetButton.onclick = null;
        }, this);
    }

    updateConnectedMonthCalendarText() {
        let connectedWidget = createdWidgets.get(this.#currentConnectedWidgetId);
        if (!connectedWidget || !widgetIsOfClass(connectedWidget, this.targetClassName)) {
            this.connectedMonthGraphText.innerText = "None";
            return;
        }
        let WidgetClass = possibleWidgets[connectedWidget.classIndex];
        this.connectedMonthGraphText.innerText = (WidgetClass.displayName || WidgetClass.name) + " (" + connectedWidget.widgetId + ")";
    }

    setConnectedWidgetId(widgetId) {
        if (widgetId >= 0) {
            let connectedWidget = createdWidgets.get(widgetId);
            if (!connectedWidget) {
                console.warn(`Tried to set connected widget id to ${widgetId}, it doesn't exist, setting to -1!`);
            }
            else if (!widgetIsOfClass(connectedWidget, this.targetClassName)) {
                console.warn(`Tried to set connected widget id to ${widgetId}, expected ${this.targetClassName}, setting to -1!`);
            }
        }
        
        this.#currentConnectedWidgetId = widgetId;
        this.updateConnectedMonthCalendarText();
        return true;
    }

    getConnectedWidgetId(validate = true) {
        if (validate && this.#currentConnectedWidgetId >= 0) {
            let connectedWidget = createdWidgets.get(this.#currentConnectedWidgetId);
            if (!connectedWidget) {
                console.warn(`Tried to get connected widget id: ${this.#currentConnectedWidgetId}, but it doesn't exist, setting to -1!`);
                this.#currentConnectedWidgetId = -1;
            }
            else if (!widgetIsOfClass(connectedWidget, this.targetClassName)) {
                console.warn(`Tried to set connected widget id to ${this.#currentConnectedWidgetId}, expected ${this.targetClassName}, setting to -1!`);
                this.#currentConnectedWidgetId = -1;
            }
        }

        return this.#currentConnectedWidgetId;
    }
}