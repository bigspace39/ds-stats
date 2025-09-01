// Segmented control UI but where you can select none or multiple options
class MultiSegmentedControl {
    horizontalDiv = null;
    options = new Array();
    buttons = new Array();
    selectedButtons = new Array();
    onClick = new Delegate();
    onSelectButton = new Delegate();
    onDeselectButton = new Delegate();

    constructor(parentElement, ...options) {
        this.options = options;
        this.horizontalDiv = UIBuilder.createHorizontal(parentElement);

        for (let i = 0; i < options.length; i++) {
            let button = createElement("button", this.horizontalDiv, "segmented-control");
            button.innerText = options[i];
            button.segmentedControl = this;
            button.index = i;
            button.addEventListener("click", async function() {
                this.segmentedControl.click(this);
            });

            this.buttons.push(button);
        }
    }

    click(button) {
        if (this.selectedButtons.includes(button)) {
            button.id = "segmented-control";
            let index = this.selectedButtons.indexOf(button);
            this.selectedButtons.splice(index, 1);
            this.onDeselectButton.broadcast(button, this.options[button.index]);
        }
        else {
            button.id = "selected-segmented-control";
            this.selectedButtons.push(button);
            this.onSelectButton.broadcast(button, this.options[button.index]);
        }

        this.onClick.broadcast(button, this.selectedButtons);
    }
}