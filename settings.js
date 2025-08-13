// Regional stuff
let dateLocale = "en-GB";
let firstDayOfTheWeek = 1; // 0 is sunday, 1 is monday, 6 is saturday
let currency = " kr";
let currencyAfterCost = true; // If true, currency will be appended after the cost, if false, it will be added before.
let twentyFourHourClock = true;

function toCurrencyString(cost) {
    if (currencyAfterCost)
        return "" + cost + currency;
    
    return "" + currency + cost;
}

function dateToTimeString() {
    
}