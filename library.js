const mainDiv = document.getElementById("main");
const headerDiv = document.getElementById("header");
let loginPrompt = null;
let toolbar = null;
let addWidgetDialog = null;
let settingsDialog = null;

function createElement(tag, parentElement, id) {
    let element = document.createElement(tag);
    element.id = id;
    parentElement.appendChild(element);
    return element;
}