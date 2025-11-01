const notWearingLabel = "Not Wearing";
const totalLabel = "Total";
const notWearingColor = "rgb(44, 62, 80)";
const totalColor = "rgb(236, 240, 241)";

const defaultDiaperCategoryConfigs = new Array(
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

let settings = new Object();

// Regional stuff
settings.autoRefreshFrequency = -1; // Amount of seconds between each refresh, negative numbers means never refresh
settings.weekStartsOn = 1; // 0 is sunday, 1 is monday, 6 is saturday
settings.weightUnit = "g";
settings.currency = " kr";
settings.currencyIsSuffix = true; // If true, currency will be appended after the cost, if false, it will be added before.
settings.twentyFourHourClock = true;
settings.diaperCategoryConfigs = JSON.parse(JSON.stringify(defaultDiaperCategoryConfigs));
settings.externalDiaperData = "";

let parsedExternalDiaperData = new Map();

function serializeSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

async function deserializeSettings() {
    let tempSettings = localStorage.getItem("settings");
    if (!tempSettings)
        return;

    tempSettings = JSON.parse(tempSettings);
    Object.assign(settings, tempSettings);
    await parseExternalDiaperData();
}

async function parseExternalDiaperData() {
    parsedExternalDiaperData = new Map();
    let lines = settings.externalDiaperData.split(/\r?\n|\r|\n/g);
    let currentYear = null;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.trim();
        if (line.length == 0)
            continue;

        if (line.startsWith("Y")) {
            line = line.slice(1);
            if (currentYear != null && currentYear.diapers.size > 0) {
                parsedExternalDiaperData.set(currentYear.year, currentYear.diapers);
            }

            currentYear = new Object();
            currentYear.year = parseInt(line);
            currentYear.diapers = new Map();
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

        let temp = new Object();
        temp.amount = amount;
        temp.type = await getType(typeId);
        currentYear.diapers.set(typeId, temp);
    }

    if (currentYear != null && currentYear.diapers.size > 0) {
        parsedExternalDiaperData.set(currentYear.year, currentYear.diapers);
    }

    console.log("Successfully parsed external diaper data:");
    console.log(parsedExternalDiaperData);
}

function getDiaperCategoryConfigNames(configs = null) {
    if (configs == null)
        configs = settings.diaperCategoryConfigs;

    let names = new Array();
    for (let i = 0; i < configs.length; i++) {
        let config = configs[i];
        let name = config.name;
        names.push(name);
    }

    return names;
}

function getDefaultDiaperCategoryConfig() {
    let index = selectedDashboard.defaultDiaperCatConfig;
    let config = settings.diaperCategoryConfigs[index];
    return config.categories;
}

async function getMainCategoryFromChange(change, diaperCategoryConfig = null) {
    if (diaperCategoryConfig == null)
        diaperCategoryConfig = getDefaultDiaperCategoryConfig();

    if (change.diapers.length == 0)
        return null;

    for (let i = 0; i < change.diapers.length; i++) {
        let id = change.diapers[i].typeId;
        let type = await getType(id);
        if (type != null && (type.category == "INSERT_BOOSTER" || type.category == "PAD"))
            continue;
        
        let category = await getCategoryFromId(id, diaperCategoryConfig);
        if (category == null)
            continue;

        return category;
    }

    return await getCategoryFromId(change.diapers[0].typeId, diaperCategoryConfig);
}

async function getCategoryFromId(id, diaperCategoryConfig = null) {
    if (diaperCategoryConfig == null)
        diaperCategoryConfig = getDefaultDiaperCategoryConfig();

    let type = await getType(id);

    for (let i = 0; i < diaperCategoryConfig.length; i++) {
        let category = diaperCategoryConfig[i];
        let filter = category.filter;
        let satisfiesFilter = true;
        for (let key in filter) {
            let filterProperty = filter[key];
            let property = type[key];
            if (Array.isArray(property)) {
                isIncluded = false;
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

function toCurrencyString(cost) {
    if (settings.currencyIsSuffix)
        return "" + cost + settings.currency;
    
    return "" + settings.currency + cost;
}

function dateToTimeString(date) {
    // TODO: FINISH
}

function getMonthStrFromDate(date) {
    return date.toLocaleString("en-GB", { month: 'long' })
}

function getWeekdayStrFromDate(date) {
    return date.toLocaleString("en-GB", { weekday: 'long' });
}