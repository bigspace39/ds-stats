import { Database, DatabaseStore } from "../database.js";
import { Settings } from "../settings.js";

export class Library {
    static REDIRECT_URI = window.location.protocol == "https:" ? "https://bigspace39.github.io/ds-stats/" : "http://localhost:8080/";
    static mainDiv = document.getElementById("main");
    static headerDiv = document.getElementById("header");

    static addWidgetDialog;
    static dashboardAddButton;
    static loginPrompt;
    static settingsDialog;
    static toolbar;

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
            dashboards: await Database.getAllFromObjectStore(DatabaseStore.Dashboards),
            widgets: await Database.getAllFromObjectStore(DatabaseStore.Widgets)
        }
        let str = JSON.stringify(data, null, 2);
        return str;
    }

    static async importData(text) {
        let data = JSON.parse(text);
        Settings.data = data.settings;
        Settings.serializeSettings();
        await Database.clearObjectStore(DatabaseStore.Widgets);
        await Database.addArrayToObjectStore(DatabaseStore.Widgets, data.widgets);

        await Database.clearObjectStore(DatabaseStore.Dashboards);
        await Database.addArrayToObjectStore(DatabaseStore.Dashboards, data.dashboards);
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