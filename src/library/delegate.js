/**
 * @template T 
 * @callback DelegateFunction
 * @this {T}
 * @param {...any} args
 * @returns {void}
 */

export class Delegate {
    /** @type {Set<function>} */
    functions;

    constructor() {
        this.functions = new Set();
    }

    /**
     * Binds a function to this delegate.
     * @template T
     * @param {T} thisObj this object within the function.
     * @param {DelegateFunction<T>} fn Function to bind.
     */
    addFunction(thisObj, fn) {
        const boundFn = thisObj ? fn.bind(thisObj) : fn;
        this.functions.add(boundFn);
        return boundFn;
    }

    /**
     * Unbinds a function from this delegate.
     * @param {function} fn Function to remove.
     */
    removeFunction(fn) {
        this.functions.delete(fn);
    }

    /**
     * Broadcasts this delegate with optional arguments.
     * @param  {...any} args Optional arguments
     */
    broadcast(...args) {
        for (let fn of this.functions) {
            fn(...args);
        }
    }

    /**
     * Clears all bound functions from this delegate.
     */
    clear() {
        this.functions.clear();
    }
}