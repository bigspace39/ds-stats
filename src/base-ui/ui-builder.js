import { Enum } from "../library/enum.js";

export class UIBuilder {
    static #defaultParent = null;

    static setDefaultParent(parent) {
        this.#defaultParent = parent;
    }

    static resetDefaultParent() {
        this.#defaultParent = null;
    }

    static createElement(tag, parentElement, id) {
        let element = document.createElement(tag);
        if (id != null)
            element.id = id;
        
        if (parentElement != null)
            parentElement.appendChild(element);
        
        return element;
    }

    static createHeading(text, parentElement = null) {
        parentElement = this.#getParentElement(parentElement);

        let element = UIBuilder.createElement("h2", parentElement, null);
        element.innerText = text;
        return element;
    }

    static createText(text, parentElement = null) {
        parentElement = this.#getParentElement(parentElement);
        const lastChildIsH2 = parentElement.lastChild != null && parentElement.lastChild.tagName == "H2";
        let element = UIBuilder.createElement("p", parentElement, null);
        element.innerText = text;

        if (parentElement.id != "horizontal-form") {
            element.style.marginTop = lastChildIsH2 ? "0px" : "18px";
            element.style.marginBottom = "6px";
        }
        return element;
    }

    static createButton(text, parentElement = null, buttonStyle = ButtonStyle.Accent) {
        parentElement = this.#getParentElement(parentElement);

        let id = "accent-button";
        if (buttonStyle == ButtonStyle.Cancel)
            id = "cancel-button";

        let element = UIBuilder.createElement("button", parentElement, id);
        element.innerText = text;
        return element;
    }

    static createTextInput(parentElement = null, inlineLabel = null) {
        parentElement = this.#getParentElement(parentElement);

        if (inlineLabel != null) {
            parentElement = UIBuilder.createHorizontal(parentElement);
            let label = UIBuilder.createElement("p", parentElement, "form-inline-label");
            label.innerText = inlineLabel;
        }

        let input = UIBuilder.createElement("input", parentElement, null);
        input.type = "text";
        return input;
    }

    static createTextArea(parentElement = null) {
        parentElement = this.#getParentElement(parentElement);

        let div = UIBuilder.createElement("div", parentElement, null);
        div.style.width = "100%";
        div.style.height = "fit-content";
        let element = UIBuilder.createElement("textarea", div, null);
        return element;
    }

    static createHorizontal(parentElement = null) {
        parentElement = this.#getParentElement(parentElement);
        return UIBuilder.createElement("div", parentElement, "horizontal-form");
    }

    static #getParentElement(parentElement) {
        if (parentElement == null)
        {
            if (this.#defaultParent == null)
                console.error("No default parent set!");

            return this.#defaultParent;
        }

        return parentElement;
    }
}

export class ButtonStyle extends Enum {
    static Accent = "Accent";
    static Cancel = "Cancel";
}