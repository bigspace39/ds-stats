import { Delegate } from "./delegate.js";

/**
 * @template T
 * @template U
 * @callback ElementStaticFunction
 * @this {U}
 * @param {T} element
 * @param {...any} args
 * @returns {void}
 */

export class ElementStatics {
    /**
     * Binds a given function to the given element's click event.
     * @template {HTMLElement} T
     * @template {Object} U
     * @param {T} element he element to bind to.
     * @param {U} thisObj this object within the function.
     * @param {ElementStaticFunction<T, U>} func The function to bind to the element's click event.
     * @param {...any} extraParams Any extra params to pass into the function
     */
    static bindOnClick(element, thisObj, func, ...extraParams) {
        this.#bindHelper("click", element, thisObj, func, ...extraParams);
    }

    /**
     * Binds a given function to the given element's change event.
     * @template {HTMLElement} T
     * @template {Object} U
     * @param {T} element he element to bind to.
     * @param {U} thisObj this object within the function.
     * @param {ElementStaticFunction<T, U>} func The function to bind to the element's change event.
     * @param {...any} extraParams Any extra params to pass into the function
     */
    static bindOnChange(element, thisObj, func, ...extraParams) {
        this.#bindHelper("change", element, thisObj, func, ...extraParams);
    }

    /**
     * Binds a given function to the given element's input event.
     * @template {HTMLElement} T
     * @template {Object} U
     * @param {T} element he element to bind to.
     * @param {U} thisObj this object within the function.
     * @param {ElementStaticFunction<T, U>} func The function to bind to the element's input event.
     * @param {...any} extraParams Any extra params to pass into the function
     */
    static bindOnInput(element, thisObj, func, ...extraParams) {
        this.#bindHelper("input", element, thisObj, func, ...extraParams);
    }

    static #bindHelper(event, element, thisObj, func, ...extraParams) {
        let delegate = new Delegate();
        delegate.addFunction(thisObj, func);
        // @ts-ignore
        element.clickDelegate = delegate;
        // @ts-ignore
        element.extraParams = extraParams;
        element.addEventListener(event, function() {
            // @ts-ignore
            this.clickDelegate.broadcast(this, ...this.extraParams);
        });
    }
}