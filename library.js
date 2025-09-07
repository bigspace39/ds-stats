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

class Delegate {
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