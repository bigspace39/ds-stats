import { Delegate } from "../library/delegate.js";
import { Library } from "../library/library.js";

export class ListUI {
    listDiv = null;
    onAddElement = new Delegate();
    onRemoveElement = new Delegate();
    elements = new Array();
    listElementClassInstances = new Array();
    addButton = null;
    listElementClass = null;

    constructor(parentElement, listElementClass = null) {
        this.listDiv = Library.createElement("div", parentElement, "list-ui");
        this.addButton = Library.createElement("button", parentElement, "accent-button");
        this.addButton.innerText = "+";
        this.addButton.style.padding = "8px 15px";
        this.addButton.list = this;
        this.addButton.addEventListener("click", function() {
            this.list.addElement();
        });

        this.listElementClass = listElementClass;
    }

    addElement() {
        let element = Library.createElement("div", this.listDiv, "list-ui-element");
        let content = Library.createElement("div", element, "list-ui-element-content");
        let remove = Library.createElement("button", element, "cancel-button");
        remove.innerText = "-";
        remove.style.padding = "8px 15px";
        remove.style.alignSelf = "stretch";
        remove.style.height = "auto";
        remove.list = this;
        remove.element = element;
        remove.addEventListener("click", function() {
            this.list.removeElement(this.list.elements.indexOf(this.element));
        });
        
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