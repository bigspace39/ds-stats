import { Delegate } from "../library/delegate.js";

export class EditConditionUI {
    elements;
    fn;

    /**
     * Will show/hide the given elements based on a function.
     * @param {any[]} elementsToHide The array of elements to hide, either HTMLElement or an object with show/hide functions.
     * @param {Delegate} updateDelegate The delegate that will update this edit condition
     * @param {Object} conditionThis this object within the function
     * @param {function() : boolean} conditionFunction The function that is run every time the delegate is broadcast, if it returns true the elements will be visible
     */
    constructor(elementsToHide, updateDelegate, conditionThis, conditionFunction) {
        this.elements = elementsToHide;
        this.fn = conditionThis != null ? conditionFunction.bind(conditionThis) : conditionFunction;

        if (updateDelegate != null) {
            updateDelegate.addFunction(this, function() {
                this.#update();
            });
        }

        this.#update();
    }

    #update() {
        let result = this.fn();

        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            if (element.show != null && element.hide != null) {
                if (result)
                    element.show();
                else
                    element.hide();
    
                continue;
            }
    
            if (element.style == null) {
                console.error("EditCondition not supported on the following element:");
                console.error(element);
                continue;
            }
            
            element.style.display = result ? "" : "none";
        }
    }
}