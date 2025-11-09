import "../libraries/Coloris-0.25.0/dist/coloris.min.js";
import "./settings.js";
import "./database.js";
import "./diapstash-api.js";
import "./ui/ui-imports.js";
import "./dashboard.js";
import "./widgets/widget.js";
import "./widgets/widget-imports.js";
import "./ui/add-widget-dialog.js";
import { Database, DatabaseStore } from "./database.js";
import { API } from "./diapstash-api.js";
import { Settings } from "./settings.js";
import { DashboardStatics } from "./library/dashboard-statics.js";
import { WidgetStatics } from "./library/widget-statics.js";

const openDBRequest = indexedDB.open("DS-Stats-DB", 1);
openDBRequest.onerror = function(event) {
    console.error(`Error when creating databse: ${event.target.error?.message}`);
};

openDBRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    const dashboardStore = db.createObjectStore(DatabaseStore.Dashboards, { keyPath: "id" });
    const widgetStore = db.createObjectStore(DatabaseStore.Widgets, { keyPath: "id" });
    const changeStore = db.createObjectStore(DatabaseStore.Changes, { keyPath: "id" });
    const accidentStore = db.createObjectStore(DatabaseStore.Accidents, { keyPath: "id" });
    const typeStore = db.createObjectStore(DatabaseStore.Types, { keyPath: "id" });
    const brandStore = db.createObjectStore(DatabaseStore.Brands, { keyPath: "code" });
};

openDBRequest.onsuccess = async function(event) {
    Database.db = event.target.result;
    Database.db.onerror = (event) => {
        console.error(`Database error: ${event.target.error?.message}`);
    };

    await API.deserializeStoredAPIData();
    await createSavedDashboards();
    await createSavedWidgets();
    await API.handleAPI();

    if (Settings.data.autoRefreshFrequency > 0) {
        setInterval(function() { API.fetchData(true); }, Settings.data.autoRefreshFrequency * 1000);
        console.log("Set to auto refresh every " + Settings.data.autoRefreshFrequency + " seconds");
    }
};

async function createSavedDashboards() {
    let tempDashboards = await Database.getAllFromObjectStore(DatabaseStore.Dashboards);
    for (let i = 0; i < tempDashboards.length; i++) {
        const current = await DashboardStatics.createDashboard(tempDashboards[i].id);

        if (tempDashboards[i].label != "")
            current.setLabel(tempDashboards[i].label);

        if (tempDashboards[i].defaultDiaperCatConfig)
            current.setDefaultDiaperCatConfig(tempDashboards[i].defaultDiaperCatConfig);

        if (DashboardStatics.selectedDashboard == null)
            DashboardStatics.selectDashboard(current);
    }

    if (DashboardStatics.dashboards.size > 0)
        return;

    DashboardStatics.createDashboard();
}

async function createSavedWidgets() {
    let savedWidgets = await Database.getAllFromObjectStore(DatabaseStore.Widgets);
    
    savedWidgets.forEach(function(element) {
        WidgetStatics.createWidget(element.dashboardId, element.class, element.id, element.transform, element.settings);
    });
}