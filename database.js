let db;

const dashboardStoreName = "dashboards";
const widgetStoreName = "widgets";
const changeStoreName = "changes";
const accidentStoreName = "accidents";
const typeStoreName = "types";
const brandStoreName = "brands";

const request = indexedDB.open("DS-Stats-DB", 1);

request.onerror = function(event) {
    console.error(`Error when creating databse: ${event.target.error?.message}`);
};

request.onsuccess = function(event) {
    db = event.target.result;
    db.onerror = (event) => {
        console.error(`Database error: ${event.target.error?.message}`);
    };
};

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    const dashboardStore = db.createObjectStore(dashboardStoreName, { keyPath: "boardId" });
    const widgetStore = db.createObjectStore(widgetStoreName, { keyPath: "widgetId" });
    const changeStore = db.createObjectStore(changeStoreName, { keyPath: "id" });
    const accidentStore = db.createObjectStore(accidentStoreName, { keyPath: "id" });
    const typeStore = db.createObjectStore(typeStoreName, { keyPath: "id" });
    const brandStore = db.createObjectStore(brandStoreName, { keyPath: "code" });

    // objectStore.transaction.oncomplete = (event) => {
    //     // Store values in the newly created objectStore.
    //     const changes = db
    //         .transaction("customers", "readwrite")
    //         .objectStore("customers");
    //     customerData.forEach((customer) => {
    //         customerObjectStore.add(customer);
    //     });
    // }
};