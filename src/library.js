import { Database } from "./database.js";
import { Settings } from "./settings.js";
import { AddWidgetDialog } from "./ui/add-widget-dialog.js";
import { DashboardAddButton } from "./ui/dashboard-add-button.js";
import { LoginPrompt } from "./ui/login-prompt.js";
import { SettingsDialog } from "./ui/settings-dialog.js";
import { Toolbar } from "./ui/toolbar.js";

export class Library {
    static REDIRECT_URI = window.location.protocol == "https:" ? "https://bigspace39.github.io/ds-stats/" : "http://localhost:8080/";
    static mainDiv = document.getElementById("main");
    static headerDiv = document.getElementById("header");

    static addWidgetDialog = new AddWidgetDialog();
    static dashboardAddButton = new DashboardAddButton();
    static loginPrompt = new LoginPrompt();
    static settingsDialog = new SettingsDialog();
    static toolbar = new Toolbar();

    static createElement(tag, parentElement, id) {
        let element = document.createElement(tag);
        if (id != null)
            element.id = id;
        
        if (parentElement != null)
            parentElement.appendChild(element);
        
        return element;
    }

    static async getExportData() {
        let data = {
            settings: Settings.data,
            dashboards: await Database.getAllFromObjectStore(Database.dashboardStoreName),
            widgets: await Database.getAllFromObjectStore(Database.widgetStoreName)
        }
        let str = JSON.stringify(data, null, 2);
        return str;
    }

    static async importData(text) {
        let data = JSON.parse(text);
        Settings.data = data.settings;
        Settings.serializeSettings();
        await Database.clearObjectStore(Database.widgetStoreName);
        await Database.addArrayToObjectStore(Database.widgetStoreName, data.widgets);

        await Database.clearObjectStore(Database.dashboardStoreName);
        await Database.addArrayToObjectStore(Database.dashboardStoreName, data.dashboards);
        window.location.href = Library.REDIRECT_URI;
    }

    static getExportFileName() {
        let currentDate = new Date();
        return "ds-stats-data-" + currentDate.toISOString();
    }

    static saveJsonFile(fileName, text) {
        const link = document.createElement("a");
        const file = new Blob([text], { type: "application/json" });
        link.href = URL.createObjectURL(file);
        link.download = fileName + ".json";
        link.click();
        URL.revokeObjectURL(link.href);
        link.remove();
    }
}

export class DashboardStatics {
    static dashboards = new Map();
    static dashboardAddButton = null;
    static selectedDashboard = null;

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

export class WidgetStatics {
    static possibleWidgets = [];
    static createdWidgets = new Map();
    static inEditMode = false;

    static createWidget(dashboardId, widgetClassIndex, widgetId = -1, transform = null, settings = null) {
        let WidgetClass = WidgetStatics.possibleWidgets[widgetClassIndex];
        let dashboad = DashboardStatics.dashboards.get(dashboardId);
        let widget = new WidgetClass(dashboad.board, widgetClassIndex, dashboardId, widgetId, transform, settings);
        return widget;
    }

    static destroyWidget(widgetId) {
        let widget = WidgetStatics.createdWidgets.get(widgetId);
        widget.destroy();
    }

    static toggleInEditMode() {
        WidgetStatics.setInEditMode(!WidgetStatics.inEditMode);
    }

    static updateWidgetsOnSelectedDashboard() {
        WidgetStatics.createdWidgets.forEach(function(value, key, map) {
            if (value.dashboardId != DashboardStatics.selectedDashboard.boardId)
                return;

            value.update();
        });
    }

    static setInEditMode(value) {
        WidgetStatics.inEditMode = value;
        if (WidgetStatics.inEditMode) {
            Library.toolbar.editButton.innerText = "✓";
        }
        else {
            Library.toolbar.editButton.innerText = "✎";
        }

        let tempWidgets = Array.from(WidgetStatics.createdWidgets.values());
        for (let i = 0; i < tempWidgets.length; i++) {
            if (WidgetStatics.inEditMode)
                tempWidgets[i].enterEditMode();
            else
                tempWidgets[i].exitEditMode();
        }
    }

    static widgetIsOfClass(widget, inClass) {
        let widgetClass = WidgetStatics.possibleWidgets[widget.classIndex];
        return widgetClass.name == inClass;
    }
}

export class Delegate {
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

export class Enum {
    // Assign default indices to each member if value is undefined
    static init() {
        let names = this.getNames();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let value = this[name];
            if (value === undefined)
                this[name] = i;
        }

        Object.freeze(this);
    }

    static getDisplayNames() {
        let names = this.getNames();
        let displayNames = new Array();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let displayName = name.replace(/([A-Z])/g, " $1");
            let finalDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            displayNames.push(finalDisplayName);
        }

        return displayNames;
    }

    static getNames() {
        let names = Object.getOwnPropertyNames(this);
        names = names.slice(1, -2);
        return names;
    }

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
        let names = Enum.getNames();
        if (index < 0 || index >= names.length) {
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