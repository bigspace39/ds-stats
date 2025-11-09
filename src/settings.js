export class Settings {
    static notWearingLabel = "Not Wearing";
    static totalLabel = "Total";
    static notWearingColor = "rgb(44, 62, 80)";
    static totalColor = "rgb(236, 240, 241)";
    
    static defaultDiaperCategoryConfigs = new Array(
        {
            name: "Default",
            categories: new Array(
                {label: "Youth", color: "#1289a7ff", filter: {usage: ["DISPOSABLE"], target: ["YOUTH"]}},
                {label: "Disposable Diapers", color: "#ea2027ff", filter: {usage: ["DISPOSABLE"], category: ["DIAPER"]}},
                {label: "Disposable Pullups", color: "#f79f1fff", filter: {usage: ["DISPOSABLE"], category: ["PULL_UP"]}},
                {label: "Disposable Boosters", color: "#1abc9cff", filter: {usage: ["DISPOSABLE"], category: ["INSERT_BOOSTER"]}},
                {label: "Disposable Pads", color: "#d980faff", filter: {usage: ["DISPOSABLE"], category: ["PAD"]}},
                {label: "Reusable Diapers", color: "#009432ff", filter: {usage: ["REUSABLE"], category: ["ALL_IN_ONE", "FITTED", "FLAT_PREFOLD"]}},
                {label: "Reusable Pullups", color: "#a3cb38ff", filter: {usage: ["REUSABLE"], category: ["PULL_UP"]}}
            )
        }
    );
    
    static data = {
        autoRefreshFrequency: -1, // Amount of seconds between each refresh, negative numbers means never refresh
        weekStartsOn: 1, // 0 is sunday, 1 is monday, 6 is saturday
        weightUnit: "g",
        currency: " kr",
        currencyIsSuffix: true, // If true, currency will be appended after the cost, if false, it will be added before.
        twentyFourHourClock: true,
        diaperCategoryConfigs: JSON.parse(JSON.stringify(Settings.defaultDiaperCategoryConfigs)),
        externalDiaperData: "",
    }

    static {
        Settings.deserializeSettings();
    }

    static parsedExternalDiaperData = new Map();
    
    /**
     * Saves settings to localStorage.
     */
    static serializeSettings() {
        localStorage.setItem("settings", JSON.stringify(Settings.data));
    }
    
    /**
     * Loads settings from localStorage.
     * @returns {void}
     */
    static deserializeSettings() {
        let tempSettings = localStorage.getItem("settings");
        if (!tempSettings)
            return;
    
        tempSettings = JSON.parse(tempSettings);
        Object.assign(Settings.data, tempSettings);
    
        this.#parseExternalDiaperData();
    }
    
    static #parseExternalDiaperData() {
        Settings.parsedExternalDiaperData = new Map();
        let lines = Settings.data.externalDiaperData.split(/\r?\n|\r|\n/g);
        let currentYear = null;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            line = line.trim();
            if (line.length == 0)
                continue;
    
            if (line.startsWith("Y")) {
                line = line.slice(1);
                if (currentYear != null && currentYear.diapers.size > 0) {
                    Settings.parsedExternalDiaperData.set(currentYear.year, currentYear.diapers);
                }
    
                currentYear = {
                    year: parseInt(line),
                    diapers: new Map()
                }
                continue;
            }
    
            if (currentYear == null) {
                console.error("Error when parsing external diaper data! Line was: \"" + line + "\", expected year declaration");
                return;
            }
    
            line = line.split(" ")[0];
            let parts = line.split(":");
            if (parts.length != 2) {
                console.error("Error when parsing external diaper data! Line was: \"" + line + "\", expected [AmountOfDiapers]:[DiaperTypeID]");
                return;
            }
    
            let amount = parseInt(parts[0]);
            let typeId = parseInt(parts[1]);
    
            if (currentYear.diapers.has(typeId)) {
                let temp = currentYear.diapers.get(typeId);
                amount += temp.amount;
            }
    
            currentYear.diapers.set(typeId, amount);
        }
    
        if (currentYear != null && currentYear.diapers.size > 0) {
            Settings.parsedExternalDiaperData.set(currentYear.year, currentYear.diapers);
        }
    
        console.log("Successfully parsed external diaper data:");
        console.log(Settings.parsedExternalDiaperData);
    }
    
    /**
     * Gets the names of all the diaper category configs.
     * @param {*} configs Optional diaper category configs, otherwise will pick the one in settings.
     * @returns {string[]} Names
     */
    static getDiaperCategoryConfigNames(configs = null) {
        if (configs == null)
            configs = Settings.data.diaperCategoryConfigs;
    
        let names = new Array();
        for (let i = 0; i < configs.length; i++) {
            let config = configs[i];
            let name = config.name;
            names.push(name);
        }
    
        return names;
    }
    
    static async getDefaultDiaperCategoryConfig() {
        const { DashboardStatics } = await import("./library/dashboard-statics.js");
        let index = DashboardStatics.selectedDashboard.defaultDiaperCatConfig;
        let config = Settings.data.diaperCategoryConfigs[index];
        return config.categories;
    }
    
    static async getMainCategoryFromChange(change, diaperCategoryConfig = null) {
        const { API } = await import("./diapstash-api.js");
        if (diaperCategoryConfig == null)
            diaperCategoryConfig = await Settings.getDefaultDiaperCategoryConfig();
    
        if (change.diapers.length == 0)
            return null;
    
        for (let i = 0; i < change.diapers.length; i++) {
            let id = change.diapers[i].typeId;
            let type = await API.getType(id);
            if (type != null && (type.category == "INSERT_BOOSTER" || type.category == "PAD"))
                continue;
            
            let category = await Settings.getCategoryFromId(id, diaperCategoryConfig);
            if (category == null)
                continue;
    
            return category;
        }
    
        return await Settings.getCategoryFromId(change.diapers[0].typeId, diaperCategoryConfig);
    }
    
    static async getCategoryFromId(id, diaperCategoryConfig = null) {
        const { API } = await import("./diapstash-api.js");
        if (diaperCategoryConfig == null)
            diaperCategoryConfig = await Settings.getDefaultDiaperCategoryConfig();
    
        let type = await API.getType(id);
    
        for (let i = 0; i < diaperCategoryConfig.length; i++) {
            let category = diaperCategoryConfig[i];
            let filter = category.filter;
            let satisfiesFilter = true;
            for (let key in filter) {
                let filterProperty = filter[key];
                let property = type[key];
                if (Array.isArray(property)) {
                    let isIncluded = false;
                    for (let j = 0; j < property.length; j++) {
                        if (filterProperty.includes(property[j])) {
                            isIncluded = true;
                            break;
                        }
                    }
    
                    if (!isIncluded) {
                        satisfiesFilter = false;
                        break;
                    }
                }
                else if (!filterProperty.includes(property)) {
                    satisfiesFilter = false;
                    break;
                }
            }
    
            if (satisfiesFilter)
                return category;
        }
    
        return null;
    }
    
    static toCurrencyString(cost) {
        if (Settings.data.currencyIsSuffix)
            return "" + cost + Settings.data.currency;
        
        return "" + Settings.data.currency + cost;
    }
    
    static dateToTimeString(date) {
        // TODO: FINISH
    }
    
    static getMonthStrFromDate(date) {
        return date.toLocaleString("en-GB", { month: 'long' })
    }
    
    static getWeekdayStrFromDate(date) {
        return date.toLocaleString("en-GB", { weekday: 'long' });
    }
}