import { WidgetStatics } from "./widget-statics.js";

export class DashboardStatics {
    /** @type {Map<number, import("../dashboard.js").Dashboard>} */
    static dashboards = new Map();
    /** @type {import("../ui/dashboard-add-button.js").DashboardAddButton} */
    static dashboardAddButton = null;
    /** @type {import("../dashboard.js").Dashboard} */
    static selectedDashboard = null;

    /**
     * Creates a new dashboard.
     * @param {number} dashboardId The dashboardId to assign to the new dashboard.
     * @returns The created dashbaord.
     */
    static async createDashboard(dashboardId = -1) {
        const { Dashboard } = await import("../dashboard.js");
        const dashboard = new Dashboard(dashboardId);
        dashboard.hideDashboard();

        if (dashboardId == -1)
            DashboardStatics.selectDashboard(dashboard);

        return dashboard;
    }

    /**
     * Destroys a dsahboard with the given id.
     * @param {number} dashboardId The dashboardId of the dashboard to destroy.
     */
    static destroyDashboard(dashboardId) {
        let dashboard = DashboardStatics.dashboards.get(dashboardId);
        dashboard.destroy();
    }

    /**
     * Hides current dashboard, shows the given one, and updates all widgets on it
     * @param {import("../dashboard.js").Dashboard} dashboard The dashboard to select
     */
    static selectDashboard(dashboard) {
        if (DashboardStatics.selectedDashboard != null) {
            DashboardStatics.selectedDashboard.hideDashboard();
        }

        dashboard.showDashboard();
        DashboardStatics.selectedDashboard = dashboard;
        WidgetStatics.updateWidgetsOnSelectedDashboard();
    }
}