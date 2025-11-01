// This is not actually a UI element, this class allows you to specify a function that will determine if the input element is hidden or not.
class EditConditionUI {
    element;
    fn;

    constructor(elementToHide, updateDelegate, conditionThis, conditionFunction) {
        this.element = elementToHide;
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
        if (this.element.show != null && this.element.hide != null) {
            if (result)
                this.element.show();
            else
                this.element.hide();

            return;
        }

        if (this.element.style == null) {
            console.error("EditCondition not supported on the following element:");
            console.error(this.element);
            return;
        }
        
        this.element.style.display = result ? "" : "none";
    }
}