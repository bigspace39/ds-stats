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

class Enum {
    static getNames() {
        let names = Object.getOwnPropertyNames(this);
        names = names.slice(1, -2);
        return names;
    }

    // 0: prototype, last: length, name
    static getValues() {
        let names = this.getNames();
        let values = new Array();

        for (let i = 0; i < names.length; i++) {
            values.push(this[names[i]]);
        }

        return values;
    }

    static getCount() {
        this.getNames().length;
    }

    static nameFromIndex(index) {
        let names = getNames();
        if (index < 0 || index >= values.length) {
            console.error("Tried to get enum name from index with invalid index");
            return;
        }

        return names[index];
    }

    static valueFromIndex(index) {
        let values = this.getValues();
        if (index < 0 || index >= values.length) {
            console.error("Tried to get enum value from index with invalid index");
            return;
        }

        return values[index];
    }

    static indexFromValue(value) {
        let values = this.getValues();

        for (let i = 0; i < values.length; i++) {
            if (values[i] == value)
                return i;
        }

        return -1;
    }

    static indexFromName(name) {
        let names = this.getNames();

        for (let i = 0; i < names.length; i++) {
            if (names[i] == name)
                return i;
        }

        return -1;
    }
}