import "../libraries/Coloris-0.25.0/src/coloris.js";
import "./settings.js";
import "./database.js";
import "./library.js";
import "./dashboard.js";
import "./widgets/widget.js";
import "./diapstash-api.js";
import { Database } from "./database.js";
import { API } from "./diapstash-api.js";
import { Settings } from "./settings.js";
import { DashboardStatics, WidgetStatics } from "./library.js";
import { Dashboard } from "./dashboard.js";

const openDBRequest = indexedDB.open("DS-Stats-DB", 1);
openDBRequest.onerror = function(event) {
    console.error(`Error when creating databse: ${event.target.error?.message}`);
};

openDBRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    const dashboardStore = db.createObjectStore(Database.dashboardStoreName, { keyPath: "id" });
    const widgetStore = db.createObjectStore(Database.widgetStoreName, { keyPath: "id" });
    const changeStore = db.createObjectStore(Database.changeStoreName, { keyPath: "id" });
    const accidentStore = db.createObjectStore(Database.accidentStoreName, { keyPath: "id" });
    const typeStore = db.createObjectStore(Database.typeStoreName, { keyPath: "id" });
    const brandStore = db.createObjectStore(Database.brandStoreName, { keyPath: "code" });
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
    let tempDashboards = await Database.getAllFromObjectStore(Database.dashboardStoreName);
    for (let i = 0; i < tempDashboards.length; i++) {
        const current = new Dashboard(tempDashboards[i].id);

        if (tempDashboards[i].label != "")
            current.setLabel(tempDashboards[i].label);

        if (tempDashboards[i].defaultDiaperCatConfig)
            current.setDefaultDiaperCatConfig(tempDashboards[i].defaultDiaperCatConfig);

        if (DashboardStatics.selectedDashboard == null)
            DashboardStatics.selectDashboard(current);
    }

    if (DashboardStatics.dashboards.size > 0)
        return;

    new Dashboard();
}

async function createSavedWidgets() {
    let savedWidgets = await Database.getAllFromObjectStore(Database.widgetStoreName);
    
    savedWidgets.forEach(function(element) {
        WidgetStatics.createWidget(element.dashboardId, element.class, element.id, element.transform, element.settings);
    });
}