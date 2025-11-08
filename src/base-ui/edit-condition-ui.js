export class EditConditionUI {
    elements;
    fn;

    /**
     * Will show/hide the given elements based on a function.
     * @param {*} elementsToHide Either a single element or an array of elements
     * @param {*} updateDelegate The delegate that will update this edit condition
     * @param {*} conditionThis this object within the function
     * @param {*} conditionFunction The function that is run every time the delegate is broadcast, if it returns true the elements will be visible
     */
    constructor(elementsToHide, updateDelegate, conditionThis, conditionFunction) {
        if (Array.isArray(elementsToHide))
            this.elements = elementsToHide;
        else
            this.elements = [elementsToHide];

        this.fn = conditionThis != null ? conditionFunction.bind(conditionThis) : conditionFunction;

        if (updateDelegate != null) {
            updateDelegate.addFunction(this, function() {
                this.update();
            });
        }

        this.update();
    }

    update() {
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