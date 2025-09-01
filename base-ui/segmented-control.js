class SegmentedControl {
    horizontalDiv = null;
    options = new Array();
    buttons = new Array();
    selectedButton = null;
    onClick = new Delegate();

    constructor(parentElement, ...options) {
        this.options = options;
        this.horizontalDiv = createElement("div", parentElement, "horizontal-form");

        for (let i = 0; i < options.length; i++) {
            let button = createElement("button", this.horizontalDiv, "segmented-control");
            button.innerText = options[i];
            button.segmentedControl = this;
            button.index = i;
            button.addEventListener("click", async function() {
                this.segmentedControl.click(this);
            });

            if (this.selectedButton == null) {
                this.click(button);
            }
            this.buttons.push(button);
        }
    }

    click(button) {
        if (this.selectedButton == button)
            return;

        if (this.selectedButton != null)
            this.selectedButton.id = "segmented-control";

        this.selectedButton = button;
        button.id = "selected-segmented-control";
        this.onClick.broadcast(button, this.options[button.index]);
    }
}