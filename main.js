import "./widgets/widget-imports.js"
import "./ui/ui-imports.js"

const openDBRequest = indexedDB.open("DS-Stats-DB", 1);
openDBRequest.onerror = function(event) {
    console.error(`Error when creating databse: ${event.target.error?.message}`);
};

openDBRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    const dashboardStore = db.createObjectStore(dashboardStoreName, { keyPath: "id" });
    const widgetStore = db.createObjectStore(widgetStoreName, { keyPath: "id" });
    const changeStore = db.createObjectStore(changeStoreName, { keyPath: "id" });
    const accidentStore = db.createObjectStore(accidentStoreName, { keyPath: "id" });
    const typeStore = db.createObjectStore(typeStoreName, { keyPath: "id" });
    const brandStore = db.createObjectStore(brandStoreName, { keyPath: "code" });
};

openDBRequest.onsuccess = async function(event) {
    db = event.target.result;
    db.onerror = (event) => {
        console.error(`Database error: ${event.target.error?.message}`);
    };

    await deserializeStoredAPIData();
    await createSavedDashboards();
    await createSavedWidgets();
    await handleAPI();
    await parseExternalDiaperData();

    if (settings.autoRefreshFrequency > 0) {
        setInterval(function() { fetchData(true); }, settings.autoRefreshFrequency * 1000);
        console.log("Set to auto refresh every " + settings.autoRefreshFrequency + " seconds");
    }
    updateWidgetsOnSelectedDashboard();
};

async function createSavedDashboards() {
    let tempDashboards = await getAllFromObjectStore(dashboardStoreName);
    for (let i = 0; i < tempDashboards.length; i++) {
        const current = createDashboard(tempDashboards[i].id);

        if (tempDashboards[i].label != "")
            current.setLabel(tempDashboards[i].label);

        if (tempDashboards[i].defaultDiaperCatConfig)
            current.setDefaultDiaperCatConfig(tempDashboards[i].defaultDiaperCatConfig);

        if (selectedDashboard == null)
            selectDashboard(current);
    }

    if (dashboards.size > 0)
        return;

    createDashboard();
}

async function createSavedWidgets() {
    let savedWidgets = await getAllFromObjectStore(widgetStoreName);
    
    savedWidgets.forEach(function(element) {
        createWidget(element.dashboardId, element.class, element.id, element.transform, element.settings);
    });
}