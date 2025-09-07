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

deserializeSettings();

function serializeSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

function deserializeSettings() {
    let tempSettings = localStorage.getItem("settings");
    if (!tempSettings)
        return;

    tempSettings = JSON.parse(tempSettings);
    Object.assign(settings, tempSettings);
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