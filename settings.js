const defaultDiaperCategoryConfig = new Map([
    ["usage is \"DISPOSABLE\" and target has \"YOUTH\"", { color: "rgb(18, 137, 167)", label: "Youth"}],
    ["usage is \"DISPOSABLE\" and style is \"TABS\"", { color: "rgb(234, 32, 39)", label: "Disposable Diapers"}],
    ["usage is \"DISPOSABLE\" and style is \"PULLUP\"", { color: "rgb(247, 159, 31)", label: "Disposable Pullups"}],
    ["usage is \"DISPOSABLE\" and type is \"BOOSTER\"", { color: "rgb(26, 188, 156)", label: "Disposable Boosters"}],
    ["usage is \"DISPOSABLE\" and style is \"PAD\"", { color: "rgb(217, 128, 250)", label: "Disposable Pads"}],
    ["usage is \"REUSABLE\" and type is \"ALL_IN_ONE\"", { color: "rgb(0, 148, 50)", label: "Reusable Diapers"}],
    ["usage is \"REUSABLE\" and type is \"PULL_UP\"", { color: "rgb(163, 203, 56)", label: "Reusable Pullups"}],
]);

const notWearingLabel = "Not Wearing";
const totalLabel = "Total";

// Regional stuff
let dateLocale = "en-GB";
let firstDayOfTheWeek = 1; // 0 is sunday, 1 is monday, 6 is saturday
let currency = " kr";
let currencyAfterCost = true; // If true, currency will be appended after the cost, if false, it will be added before.
let twentyFourHourClock = true;

// Diaper category configs
let diaperCategoryConfigs = new Map([
    ["Default", new Map(JSON.parse(JSON.stringify(Array.from(defaultDiaperCategoryConfig))))],
]);

let notWearingColor = "rgb(44, 62, 80)";
let totalColor = "rgb(236, 240, 241)";

function toCurrencyString(cost) {
    if (currencyAfterCost)
        return "" + cost + currency;
    
    return "" + currency + cost;
}

function dateToTimeString(date) {
    // TODO: FINISH
}