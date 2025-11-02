class SelectConnectedWidgetButtonUI {
    ownerWidget;
    button;
    targetClass;
    onSelectConnectedWidget = new Delegate();

    constructor(parentElement, buttonText, ownerWidget, targetClass) {
        this.button = UIBuilder.createButton(buttonText, parentElement);
        this.ownerWidget = ownerWidget;
        this.targetClass = targetClass;
        this.button.selectConnectedWidget = this;
        this.button.addEventListener("click", function() {
            createdWidgets.forEach(function(value, key, map) {
                if (value.dashboardId != selectedDashboard.boardId)
                    return;

                if (!widgetIsOfClass(value, this.selectConnectedWidget.targetClass))
                    return;

                value.selectWidgetButton.style.display = "";
                value.selectWidgetButton.monthCalendar = value;
                value.selectWidgetButton.selectConnectedWidget = this.selectConnectedWidget;
                value.selectWidgetButton.onclick = function() {
                    this.selectConnectedWidget.resetState();
                    this.selectConnectedWidget.ownerWidget.settingsDialog.show();
                    this.selectConnectedWidget.onSelectConnectedWidget.broadcast(this.monthCalendar);
                };

            }, this);

            this.selectConnectedWidget.ownerWidget.settingsDialog.hide();
        });
    }

    resetState() {
        createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != selectedDashboard.boardId)
                return;

            if (!widgetIsOfClass(value, this.targetClass))
                return;

            value.selectWidgetButton.style.display = "none";
            value.selectWidgetButton.onclick = null;
        }, this);
    }
}