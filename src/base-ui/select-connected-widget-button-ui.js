import { DashboardStatics } from "../library/dashboard-statics.js";
import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { WidgetStatics } from "../library/widget-statics.js";
import { ButtonStyle, UIBuilder } from "./ui-builder.js";

export class SelectConnectedWidgetButtonUI {
    /** @type {HTMLParagraphElement} */
    topText;
    /** @type {import("../widgets/widget.js").Widget} */
    ownerWidget;
    /** @type {HTMLDivElement} */
    horizontal;
    /** @type {HTMLButtonElement} */
    button;
    /** @type {HTMLButtonElement} */
    clearButton;
    /** @type {HTMLParagraphElement} */
    connectedMonthGraphText;
    /** @type {typeof import("../widgets/widget.js").Widget} */
    targetClass;
    onSelectConnectedWidget = new Delegate();
    #currentConnectedWidgetId = -1;

    /**
     * Makes a selection button to select other widgets to connect to the current widget.
     * @param {HTMLElement} parentElement The parent element.
     * @param {import("../widgets/widget.js").Widget} ownerWidget The owner widget of this selection button.
     * @param {typeof import("../widgets/widget.js").Widget} targetClass The target widget class to make selectable.
     */
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
        ElementStatics.bindOnClick(this.button, this, function() {
            WidgetStatics.createdWidgets.forEach(function(value, key, map) {
                if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                    return;

                if (!WidgetStatics.widgetIsOfClass(value, this.targetClass))
                    return;

                value.selectWidgetButton.style.display = "";
                ElementStatics.bindOnClick(value.selectWidgetButton, this, function(selectButton, targetWidget) {
                    this.#exitSelectMode();
                    this.ownerWidget.settingsDialog.show();
                    this.setConnectedWidgetId(targetWidget.widgetId);
                    this.onSelectConnectedWidget.broadcast(targetWidget);
                }, value);

            }, this);

            this.ownerWidget.settingsDialog.hide();
        });

        ElementStatics.bindOnClick(this.clearButton, this, function() {
            this.setConnectedWidgetId(-1);
        });
    }

    #exitSelectMode() {
        WidgetStatics.createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                return;

            if (!WidgetStatics.widgetIsOfClass(value, this.targetClass))
                return;

            value.selectWidgetButton.style.display = "none";
            value.selectWidgetButton.onclick = null;
        }, this);
    }

    #updateConnectedMonthCalendarText() {
        let connectedWidget = WidgetStatics.createdWidgets.get(this.#currentConnectedWidgetId);
        if (!connectedWidget || !WidgetStatics.widgetIsOfClass(connectedWidget, this.targetClass)) {
            this.connectedMonthGraphText.innerText = "None";
            return;
        }
        
        this.connectedMonthGraphText.innerText = (connectedWidget.getWidgetName()) + " (" + connectedWidget.widgetId + ")";
    }

    /**
     * Set the currently connected widget id.
     * @param {number} widgetId The widget id to select.
     * @returns 
     */
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
        this.#updateConnectedMonthCalendarText();
        return true;
    }

    /**
     * Gets the connected widget id.
     * @param {boolean} validate If true, we will set the internal value to -1 and return -1 if the id is not valid.
     * @returns {number}
     */
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