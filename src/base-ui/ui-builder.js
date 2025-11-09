import { Enum } from "../library/enum.js";

export class UIBuilder {
    static #defaultParent = null;

    /**
     * Sets the default parent for the UIBuilder, allows for passing in null as the parent in createUI functions.
     * @param {HTMLElement} parent The parent element.
     */
    static setDefaultParent(parent) {
        this.#defaultParent = parent;
    }

    /**
     * Resets a previously set default parent.
     */
    static resetDefaultParent() {
        this.#defaultParent = null;
    }

    /**
     * Creates a new html element with the given tag, parent and id.
     * @template {keyof HTMLElementTagNameMap} K
     * @param {K} tag The element tag name.
     * @param {HTMLElement} [parentElement] The parent element.
     * @param {string} [id] The element's id.
     * @returns {HTMLElementTagNameMap[K]} The created element.
     */
    static createElement(tag, parentElement = null, id = null) {
        parentElement = this.#getParentElement(parentElement);

        let element = document.createElement(tag);
        if (id != null)
            element.id = id;
        
        if (parentElement != null)
            parentElement.appendChild(element);
        
        return element;
    }

    /**
     * Creates a heading element with the specified text.
     * @param {string} text The text content of the heading element.
     * @param {HTMLElement} parentElement The parent element, can be null if default parent is set.
     * @returns {HTMLHeadingElement} The created element.
     */
    static createHeading(text, parentElement = null) {
        parentElement = this.#getParentElement(parentElement);

        let element = UIBuilder.createElement("h2", parentElement, null);
        element.innerText = text;
        return element;
    }

    /**
     * Creates a paragraph element with the specified text.
     * @param {string} text The text content of the paragraph element.
     * @param {HTMLElement} parentElement The parent element, can be null if default parent is set.
     * @returns {HTMLParagraphElement} The created element.
     */
    static createText(text, parentElement = null) {
        parentElement = this.#getParentElement(parentElement);
        // @ts-ignore
        const lastChildIsH2 = parentElement.lastChild != null && parentElement.lastChild.tagName == "H2";
        let element = UIBuilder.createElement("p", parentElement, null);
        element.innerText = text;

        if (parentElement.id != "horizontal-form") {
            element.style.marginTop = lastChildIsH2 ? "0px" : "18px";
            element.style.marginBottom = "6px";
        }
        return element;
    }

    /**
     * Creates a button with the specified label.
     * @param {string} label The label text of the button.
     * @param {HTMLElement} parentElement The parent element, can be null if default parent is set.
     * @param {string} buttonStyle The id of the button, use ButtonStyle here!
     * @returns {HTMLButtonElement} The created element.
     */
    static createButton(label, parentElement = null, buttonStyle = ButtonStyle.Accent) {
        parentElement = this.#getParentElement(parentElement);

        let id = "accent-button";
        if (buttonStyle == ButtonStyle.Cancel)
            id = "cancel-button";

        let element = UIBuilder.createElement("button", parentElement, id);
        element.innerText = label;
        return element;
    }

    /**
     * Creates a text input field.
     * @param {HTMLElement} parentElement The parent element, can be null if default parent is set.
     * @param {*} inlineLabel 
     * @returns {HTMLInputElement} The created element.
     */
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

    /**
     * Creates a text area.
     * @param {HTMLElement} parentElement The parent element, can be null if default parent is set.
     * @returns {HTMLTextAreaElement} The created element.
     */
    static createTextArea(parentElement = null) {
        parentElement = this.#getParentElement(parentElement);

        let div = UIBuilder.createElement("div", parentElement, null);
        div.style.width = "100%";
        div.style.height = "fit-content";
        let element = UIBuilder.createElement("textarea", div, null);
        return element;
    }

    /**
     * Creates a horizontal flex box div (row).
     * @param {HTMLElement} parentElement The parent element, can be null if default parent is set.
     * @returns {HTMLDivElement} The created element.
     */
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