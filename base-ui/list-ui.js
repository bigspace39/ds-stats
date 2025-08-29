class ListUI {
    listDiv = null;
    onAddElement = new Delegate();
    onRemoveElement = new Delegate();
    elements = new Array();
    addButton = null;

    constructor(parentElement) {
        this.listDiv = createElement("div", parentElement, "list-ui");
        this.addButton = createElement("button", parentElement, "accent-button");
        this.addButton.innerText = "+";
        this.addButton.style.padding = "8px 15px";
        this.addButton.list = this;
        this.addButton.addEventListener("click", function() {
            this.list.addElement();
        });
    }

    addElement() {
        let element = createElement("div", this.listDiv, "list-ui-element");
        let content = createElement("div", element, "list-ui-element-content");
        let remove = createElement("button", element, "cancel-button");
        remove.innerText = "-";
        remove.style.padding = "8px 15px";
        remove.style.alignSelf = "stretch";
        remove.style.height = "auto";
        remove.list = this;
        remove.element = element;
        remove.addEventListener("click", function() {
            this.list.removeElement(this.list.elements.indexOf(this.element));
        });
        this.elements.push(element);
        this.onAddElement.broadcast(content);
    }

    removeElement(index) {
        let element = this.elements[index];
        element.innerHTML = "";
        element.remove();
        this.elements.splice(index, 1);
        this.onRemoveElement.broadcast(index);
    }
}