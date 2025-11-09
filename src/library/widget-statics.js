import { Statics } from "./statics.js";

export class WidgetStatics {
    /** @type {Array<typeof import("../widgets/widget.js").Widget>} */
    static possibleWidgets = [];
    /** @type {Map<number, import("../widgets/widget.js").Widget>} */
    static createdWidgets = new Map();
    static inEditMode = false;

    /**
     * Creates a new widget on the given dashboardId.
     * @param {number} dashboardId Dashboard id to place widget on.
     * @param {number} widgetClassIndex The class index of the widget.
     * @param {number} widgetId The id to assign to the widget.
     * @param {string} transform The transform style value of the widget.
     * @param {Object} settings The settings of the widget.
     * @returns The created widget.
     */
    static async createWidget(dashboardId, widgetClassIndex, widgetId = -1, transform = null, settings = null) {
        const { DashboardStatics } = await import("./dashboard-statics.js");
        let WidgetClass = WidgetStatics.possibleWidgets[widgetClassIndex];
        let dashboad = DashboardStatics.dashboards.get(dashboardId);
        let widget = new WidgetClass(dashboad.board, widgetClassIndex, dashboardId, widgetId, transform, settings);
        return widget;
    }

    /**
     * Destroy the widget with the specified id.
     * @param {number} widgetId The id of the widget to destroy
     */
    static destroyWidget(widgetId) {
        let widget = WidgetStatics.createdWidgets.get(widgetId);
        widget.destroy();
    }

    /**
     * Toggles if we are in edit mode (draggable/removable/configurable)
     */
    static toggleInEditMode() {
        WidgetStatics.setInEditMode(!WidgetStatics.inEditMode);
    }

    /**
     * Calls update() on all widgets on the selected dashbaord.
     */
    static async updateWidgetsOnSelectedDashboard() {
        const { DashboardStatics } = await import("./dashboard-statics.js");
        WidgetStatics.createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                return;

            value.update();
        });
    }

    /**
     * Sets in edit mode value (if the widgets are draggable/removable/configurable)
     * @param {boolean} value 
     */
    static setInEditMode(value) {
        WidgetStatics.inEditMode = value;
        if (WidgetStatics.inEditMode) {
            Statics.toolbar.editButton.innerText = "✓";
        }
        else {
            Statics.toolbar.editButton.innerText = "✎";
        }

        let tempWidgets = Array.from(WidgetStatics.createdWidgets.values());
        for (let i = 0; i < tempWidgets.length; i++) {
            if (WidgetStatics.inEditMode)
                tempWidgets[i].enterEditMode();
            else
                tempWidgets[i].exitEditMode();
        }
    }

    /**
     * Checks if the given widget is of the specified class
     * @param {import("../widgets/widget.js").Widget} widget Widget instance
     * @param {typeof import("../widgets/widget.js").Widget} inClass Widget class
     * @returns {boolean} if the widget is of the specified class or not.
     */
    static widgetIsOfClass(widget, inClass) {
        let widgetClass = WidgetStatics.possibleWidgets[widget.classIndex];
        return widgetClass == inClass;
    }
}