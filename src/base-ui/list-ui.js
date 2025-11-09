import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { UIBuilder } from "./ui-builder.js";

export class ListUI {
    /** @type {HTMLDivElement} */
    listDiv = null;
    onAddElement = new Delegate();
    onRemoveElement = new Delegate();
    /** @type {HTMLDivElement[]} The parent elements of each element */
    elements = new Array();
    listElementClassInstances = new Array();
    /** @type {HTMLButtonElement} */
    addButton = null;
    /** @type {new (...args: any[]) => any} */
    listElementClass = null;

    /**
     * Will create a list UI where duplicates of a given list element class can be added to.
     * @param {HTMLElement} parentElement The parent element.
     * @param {new (...args: any[]) => any} listElementClass The class that will spawn when the user clicks the add button.
     */
    constructor(parentElement, listElementClass = null) {
        this.listDiv = UIBuilder.createElement("div", parentElement, "list-ui");
        this.addButton = UIBuilder.createElement("button", parentElement, "accent-button");
        this.addButton.innerText = "+";
        this.addButton.style.padding = "8px 15px";
        ElementStatics.bindOnClick(this.addButton, this, function(element) {
            this.addElement();
        });

        this.listElementClass = listElementClass;
    }

    /**
     * Adds a new element to the list and returns it.
     * @returns {any}
     */
    addElement() {
        let element = UIBuilder.createElement("div", this.listDiv, "list-ui-element");
        let content = UIBuilder.createElement("div", element, "list-ui-element-content");
        let remove = UIBuilder.createElement("button", element, "cancel-button");
        remove.innerText = "-";
        remove.style.padding = "8px 15px";
        remove.style.alignSelf = "stretch";
        remove.style.height = "auto";
        ElementStatics.bindOnClick(remove, this, function(removeButon, element) {
            this.removeElement(this.elements.indexOf(element));
        }, element);
        
        let returnValue = content;
        if (this.listElementClass != null) {
            let classInstance = new this.listElementClass(content);
            this.listElementClassInstances.push(classInstance);
            returnValue = classInstance;
        }
        
        this.elements.push(element);
        this.onAddElement.broadcast(content);
        return returnValue;
    }

    /**
     * Removes the list element at the specified index.
     * @param {number} index The index to remove.
     */
    removeElement(index) {
        let element = this.elements[index];
        element.innerHTML = "";
        element.remove();
        this.elements.splice(index, 1);

        if (this.listElementClass != null) {
            this.listElementClassInstances.splice(index, 1);
        }

        this.onRemoveElement.broadcast(index);
    }

    /**
     * Will add/remove elements so that the list is exactly the input length.
     * @param {number} length The length to set.
     * @returns {void}
     */
    setLength(length) {
        for (let i = 0; i < length; i++) {
            if (i == this.getLength()) 
                this.addElement();
        }

        if (this.getLength() == length)
            return;

        for (let i = this.getLength() - 1; i >= 0; i--) {
            this.removeElement(i);

            if (this.getLength() == length)
                return;
        }
    }

    /**
     * 
     * @returns {number} The length of the list.
     */
    getLength() {
        return this.elements.length;
    }

    show() {
        this.listDiv.style.display = "";
    }

    hide() {
        this.listDiv.style.display = "none";
    }
}