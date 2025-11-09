import { DashboardStatics } from "../library/dashboard-statics.js";
import { Delegate } from "../library/delegate.js";
import { WidgetStatics } from "../library/widget-statics.js";
import { ButtonStyle, UIBuilder } from "./ui-builder.js";

export class SelectConnectedWidgetButtonUI {
    topText;
    ownerWidget;
    horizontal;
    button;
    clearButton;
    connectedMonthGraphText;
    targetClass;
    onSelectConnectedWidget = new Delegate();
    #currentConnectedWidgetId = -1;

    constructor(parentElement, ownerWidget, targetClass) {
        let targetName = targetClass.displayName || targetClass.name;
        
        this.topText = UIBuilder.createText(`Connected ${targetName}`);
        this.horizontal = UIBuilder.createHorizontal(parentElement);
        this.button = UIBuilder.createButton("Select", this.horizontal);
        this.clearButton = UIBuilder.createButton("Clear", this.horizontal, ButtonStyle.Cancel);
        this.clearButton.style.marginLeft = "6px";
        this.connectedMonthGraphText = UIBuilder.createText("None", this.horizontal);
        this.connectedMonthGraphText.style.marginLeft = "6px";
        
        this.ownerWidget = ownerWidget;
        this.targetClass = targetClass;
        this.button.selectConnectedWidget = this;
        this.button.addEventListener("click", function() {
            WidgetStatics.createdWidgets.forEach(function(value, key, map) {
                if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                    return;

                if (!WidgetStatics.widgetIsOfClass(value, this.selectConnectedWidget.targetClass))
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
        WidgetStatics.createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                return;

            if (!WidgetStatics.widgetIsOfClass(value, this.targetClass))
                return;

            value.selectWidgetButton.style.display = "none";
            value.selectWidgetButton.onclick = null;
        }, this);
    }

    updateConnectedMonthCalendarText() {
        let connectedWidget = WidgetStatics.createdWidgets.get(this.#currentConnectedWidgetId);
        if (!connectedWidget || !WidgetStatics.widgetIsOfClass(connectedWidget, this.targetClass)) {
            this.connectedMonthGraphText.innerText = "None";
            return;
        }
        let WidgetClass = WidgetStatics.possibleWidgets[connectedWidget.classIndex];
        this.connectedMonthGraphText.innerText = (WidgetClass.displayName || WidgetClass.name) + " (" + connectedWidget.widgetId + ")";
    }

    setConnectedWidgetId(widgetId) {
        if (widgetId >= 0) {
            let connectedWidget = WidgetStatics.createdWidgets.get(widgetId);
            if (!connectedWidget) {
                console.warn(`Tried to set connected widget id to ${widgetId}, it doesn't exist, setting to -1!`);
            }
            else if (!WidgetStatics.widgetIsOfClass(connectedWidget, this.targetClass)) {
                console.warn(`Tried to set connected widget id to ${widgetId}, expected ${this.targetClass}, setting to -1!`);
            }
        }
        
        this.#currentConnectedWidgetId = widgetId;
        this.updateConnectedMonthCalendarText();
        return true;
    }

    getConnectedWidgetId(validate = true) {
        if (validate && this.#currentConnectedWidgetId >= 0) {
            let connectedWidget = WidgetStatics.createdWidgets.get(this.#currentConnectedWidgetId);
            if (!connectedWidget) {
                console.warn(`Tried to get connected widget id: ${this.#currentConnectedWidgetId}, but it doesn't exist, setting to -1!`);
                this.#currentConnectedWidgetId = -1;
            }
            else if (!WidgetStatics.widgetIsOfClass(connectedWidget, this.targetClass)) {
                console.warn(`Tried to set connected widget id to ${this.#currentConnectedWidgetId}, expected ${this.targetClass}, setting to -1!`);
                this.#currentConnectedWidgetId = -1;
            }
        }

        return this.#currentConnectedWidgetId;
    }
}