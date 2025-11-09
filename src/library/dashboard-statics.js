import { WidgetStatics } from "./widget-statics.js";

export class DashboardStatics {
    static dashboards = new Map();
    static dashboardAddButton = null;
    static selectedDashboard = null;

    static async createDashboard(dashboardId = -1) {
        const { Dashboard } = await import("../dashboard.js");
        const dashboard = new Dashboard(dashboardId);
        dashboard.hideDashboard();

        if (dashboardId == -1)
            DashboardStatics.selectDashboard(dashboard);

        return dashboard;
    }

    static destroyDashboard(dashboardId) {
        let dashboard = DashboardStatics.dashboards.get(dashboardId);
        dashboard.destroy();
    }

    static selectDashboard(dashboard) {
        if (DashboardStatics.selectedDashboard != null) {
            DashboardStatics.selectedDashboard.hideDashboard();
        }

        dashboard.showDashboard();
        DashboardStatics.selectedDashboard = dashboard;
        WidgetStatics.updateWidgetsOnSelectedDashboard();
    }
}