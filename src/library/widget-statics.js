import { Statics } from "./statics.js";

export class WidgetStatics {
    static possibleWidgets = [];
    static createdWidgets = new Map();
    static inEditMode = false;

    static async createWidget(dashboardId, widgetClassIndex, widgetId = -1, transform = null, settings = null) {
        const { DashboardStatics } = await import("./dashboard-statics.js");
        let WidgetClass = WidgetStatics.possibleWidgets[widgetClassIndex];
        let dashboad = DashboardStatics.dashboards.get(dashboardId);
        let widget = new WidgetClass(dashboad.board, widgetClassIndex, dashboardId, widgetId, transform, settings);
        return widget;
    }

    static destroyWidget(widgetId) {
        let widget = WidgetStatics.createdWidgets.get(widgetId);
        widget.destroy();
    }

    static toggleInEditMode() {
        WidgetStatics.setInEditMode(!WidgetStatics.inEditMode);
    }

    static async updateWidgetsOnSelectedDashboard() {
        const { DashboardStatics } = await import("./dashboard-statics.js");
        WidgetStatics.createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                return;

            value.update();
        });
    }

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

    static widgetIsOfClass(widget, inClass) {
        let widgetClass = WidgetStatics.possibleWidgets[widget.classIndex];
        return widgetClass == inClass;
    }
}