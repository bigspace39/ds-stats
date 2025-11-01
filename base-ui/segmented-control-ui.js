class SegmentedControlUIOption {
    displayLabel;
    value;

    constructor(displayLabel, value) {
        this.displayLabel = displayLabel;
        this.value = value;
    }
}

class SegmentedControlUI {
    horizontalDiv = null;
    options = new Array();
    buttons = new Array();
    selectedButton = null;
    onClick = new Delegate();

    constructor(parentElement, ...options) {
        this.horizontalDiv = createElement("div", parentElement, "horizontal-form");

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            if (typeof option == "string") {
                this.options.push(option);
            }
            else {
                this.options.push(option.value);
                option = option.displayLabel;
            }

            let button = createElement("button", this.horizontalDiv, "segmented-control");
            button.innerText = option;
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

    getSelectedOption() {
        if (this.selectedButton == null)
            return null;

        return this.options[this.selectedButton.index];
    }

    setSelectedOption(option) {
        let index = this.options.indexOf(option);
        if (index == -1)
        {
            console.error(`Tried to set segmented control with option ${option}, but it isn't a possible option!`);
            return;
        }

        this.click(this.buttons[index]);
    }
}