import "./widgets/widget-imports.js"
import "./ui/ui-imports.js"

deserializeStoredAPIData();
createSavedDashboards();
createSavedWidgets();
await handleAPI();

if (crypto.subtle) {
    console.log("Web Crypto API (subtle) is available.");
}
else {
    console.log("Web Crypto API (subtle) is not available.");
}

function createSavedDashboards() {
    if (localStorage.dashboards) {
        let tempDashboards = JSON.parse(localStorage.dashboards);
        for (let i = 0; i < tempDashboards.length; i++) {
            const current = createDashboard(tempDashboards[i].id);

            if (tempDashboards[i].label != "")
                current.setLabel(tempDashboards[i].label);

            if (selectedDashboard == null)
                selectDashboard(current);
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