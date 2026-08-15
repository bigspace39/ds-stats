import { Statics } from "./statics.js";
import { Delegate } from "./delegate.js";

export class WidgetStatics {
    /** @type {Array<typeof import("../widgets/widget.js").Widget>} */
    static possibleWidgets = [];
    /** @type {Map<number, import("../widgets/widget.js").Widget>} */
    static createdWidgets = new Map();
    static inEditMode = false;

    static onCreateWidget = new Delegate();
    static onMoveWidget = new Delegate();
    static onPreDestroyWidget = new Delegate();
    static onPostDestroyWidget = new Delegate();

    /**
     * Creates a new widget on the given dashboardId.
     * @param {number} dashboardId Dashboard id to place widget on.
     * @param {number} widgetClassIndex The class index of the widget.
     * @param {number} widgetId The id to assign to the widget.
     * @param {string?} transform The transform style value of the widget.
     * @param {Object?} settings The settings of the widget.
     * @returns {Promise<import("../widgets/widget.js").Widget?>} The created widget.
     */
    static async createWidget(dashboardId, widgetClassIndex, widgetId = -1, transform = null, settings = null) {
        const { DashboardStatics } = await import("./dashboard-statics.js");
        let WidgetClass = WidgetStatics.possibleWidgets[widgetClassIndex];
        let dashboad = DashboardStatics.dashboards.get(dashboardId);
        if (dashboad == undefined) {
            console.error("Tried to create widget on undefined dashboard.");
            return null;
        }
        let widget = new WidgetClass(dashboad.board, widgetClassIndex, dashboardId, widgetId, transform, settings);
        WidgetStatics.onCreateWidget.broadcast(widget);
        return widget;
    }

    /**
     * Destroy the widget with the specified id.
     * @param {number} widgetId The id of the widget to destroy
     */
    static destroyWidget(widgetId) {
        let widget = WidgetStatics.createdWidgets.get(widgetId);
        if (widget == undefined) {
            console.error("Tried to destroy widget with widgetId that doesn't exist");
            return;
        }
        WidgetStatics.onPreDestroyWidget.broadcast(widget);
        widget.destroy();
        WidgetStatics.onPostDestroyWidget.broadcast(widget);
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

    /**
     * Will return the shortest edge-to-edge square distance between two widgets.
     * @param {import("../widgets/widget.js").Widget} widget1 
     * @param {import("../widgets/widget.js").Widget} widget2 
     * @returns {number} The distance
     */
    static getSqrDistanceBetweenWidgets(widget1, widget2) {
        let rect1 = widget1.mainDiv.getBoundingClientRect();
        let rect2 = widget2.mainDiv.getBoundingClientRect();

        let dx = Math.max(0, rect1.left - rect2.right, rect2.left - rect1.right);
        let dy = Math.max(0, rect1.top - rect2.bottom, rect2.top - rect1.bottom);

        return dx * dx + dy * dy;
    }

    /**
     * Will return the shortest edge-to-edge distance between two widgets.
     * @param {import("../widgets/widget.js").Widget} widget1 
     * @param {import("../widgets/widget.js").Widget} widget2 
     * @returns {number} The distance
     */
    static getDistanceBetweenWidgets(widget1, widget2) {
        let sqrDist = this.getSqrDistanceBetweenWidgets(widget1, widget2);
        return Math.sqrt(sqrDist);
    }
}