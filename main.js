import "./ui/ui-imports.js"
import "./widgets/widget-imports.js"

loadSavedData();
createWidget(0, 0);

function loadSavedData() {
    createSavedDashboards();
    createSavedWidgets();
}

function createSavedDashboards() {
    if (localStorage.dashboards) {
        let tempDashboards = JSON.parse(localStorage.dashboards);
        for (let i = 0; i < tempDashboards.length; i++) {
            createDashboard(tempDashboards[i]);
        }

        if (dashboards.size > 0)
            return;
    }
    
    createDashboard();
}

function createSavedWidgets() {
    if (localStorage.widgets) {
        let savedWidgets = new Map(JSON.parse(localStorage.widgets));
        savedWidgets.forEach(function(value, key, map) {
            createWidget(value.dashboard, value.class, key);
        });
    }
}