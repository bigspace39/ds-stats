class UIBuilder {
    static defaultParent = null;

    static setDefaultParent(parent) {
        this.defaultParent = parent;
    }

    static resetDefaultParent() {
        this.defaultParent = null;
    }

    static createHeading(text, parentElement = null) {
        parentElement = this.#getParentElement(parentElement);

        let element = createElement("h2", parentElement, null);
        element.innerText = text;
        return element;
    }

    static createText(text, parentElement = null) {
        parentElement = this.#getParentElement(parentElement);

        const lastChildIsH2 = parentElement.lastChild != null && parentElement.lastChild.tagName == "H2";
        let element = createElement("p", parentElement, null);
        element.innerText = text;
        element.style.marginTop = lastChildIsH2 ? "0px" : "18px";
        element.style.marginBottom = "6px";
        return element;
    }

    static createButton(text, parentElement = null, buttonStyle = ButtonStyle.Accent) {
        parentElement = this.#getParentElement(parentElement);

        let id = "accent-button";
        if (buttonStyle == ButtonStyle.Cancel)
            id = "cancel-button";

        let element = createElement("button", parentElement, id);
        element.innerText = text;
        return element;
    }

    static createTextInput(parentElement = null, inlineLabel = null) {
        parentElement = this.#getParentElement(parentElement);

        if (inlineLabel != null) {
            parentElement = UIBuilder.createHorizontal(parentElement);
            let label = createElement("p", parentElement, "form-inline-label");
            label.innerText = inlineLabel;
        }

        let input = createElement("input", parentElement, null);
        input.type = "text";
        return input;
    }

    static createDropdown(parentElement = null, ...options) {
        parentElement = this.#getParentElement(parentElement);
        let select = createElement("select", parentElement, null);

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            let optionElement = createElement("option", select);
            optionElement.innerText = option;
            optionElement.value = option.toLowerCase();
        }
        
        return select;
    }

    static createHorizontal(parentElement = null) {
        parentElement = this.#getParentElement(parentElement);
        return createElement("div", parentElement, "horizontal-form");
    }

    static #getParentElement(parentElement) {
        if (parentElement == null)
        {
            if (this.defaultParent == null)
                console.error("No default parent set!");

            return this.defaultParent;
        }

        return parentElement;
    }
}

class ButtonStyle {
    static Accent = "Accent";
    static Cancel = "Cancel";
}