const mainDiv = document.getElementById("main");
const headerDiv = document.getElementById("header");
let loginPrompt = null;
let toolbar = null;
let addWidgetDialog = null;
let settingsDialog = null;

function createElement(tag, parentElement, id) {
    let element = document.createElement(tag);
    if (id != null)
        element.id = id;
    
    if (parentElement != null)
        parentElement.appendChild(element);
    
    return element;
}

async function getExportData() {
    let data = new Object();
    data.settings = settings;
    data.dashboards = await getAllFromObjectStore(dashboardStoreName);
    data.widgets = await getAllFromObjectStore(widgetStoreName);
    let str = JSON.stringify(data, null, 2);
    return str;
}

async function importData(text) {
    let data = JSON.parse(text);
    settings = data.settings;
    serializeSettings();
    await clearObjectStore(widgetStoreName);
    await addArrayToObjectStore(widgetStoreName, data.widgets);

    await clearObjectStore(dashboardStoreName);
    await addArrayToObjectStore(dashboardStoreName, data.dashboards);
    window.location.href = REDIRECT_URI;
}

function getExportFileName() {
    let currentDate = new Date();
    return "ds-stats-data-" + currentDate.toISOString();
}

function saveJsonFile(fileName, text) {
    const link = document.createElement("a");
    const file = new Blob([text], { type: "application/json" });
    link.href = URL.createObjectURL(file);
    link.download = fileName + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}

class Delegate {
    functions;

    constructor() {
        this.functions = new Set();
    }

    addFunction(thisObj, fn) {
        const boundFn = thisObj ? fn.bind(thisObj) : fn;
        this.functions.add(boundFn);
        return boundFn;
    }

    removeFunction(fn) {
        this.functions.delete(fn);
    }

    broadcast(...args) {
        for (let fn of this.functions) {
            fn(...args);
        }
    }

    clear() {
        this.functions.clear();
    }
}