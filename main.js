import * as Widgets from "./widgets/month-calendar.js";

const possibleWidgets = [new Widgets.MonthCalendar()];

const mainDiv = document.getElementById("main");
if (localStorage.widgets) {
    let savedWidgets = new Map(JSON.parse(localStorage.widgets));
    savedWidgets.forEach(createSavedWidget);
}

function createSavedWidget(value, key, map) {
    let widget = Object.assign(Object.create(Object.getPrototypeOf(possibleWidgets[value])), possibleWidgets[value]);
    widget.create(mainDiv, value, key);
}

// let widget = Object.assign(Object.create(Object.getPrototypeOf(possibleWidgets[0])), possibleWidgets[0]);
// widget.create(mainDiv, 0);