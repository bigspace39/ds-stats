import { Library, Delegate } from "../library.js";
import { UIBuilder } from "./ui-builder.js";

// Segmented control UI but where you can select none or multiple options
export class MultiSegmentedControlUI {
    horizontalDiv = null;
    options = new Array();
    buttons = new Array();
    selectedButtons = new Array();
    onClick = new Delegate();
    onSelectButton = new Delegate();
    onDeselectButton = new Delegate();

    constructor(parentElement, ...options) {
        this.horizontalDiv = UIBuilder.createHorizontal(parentElement);

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            if (typeof option == "string") {
                this.options.push(option);
            }
            else {
                this.options.push(option.value);
                option = option.displayLabel;
            }

            let button = Library.createElement("button", this.horizontalDiv, "segmented-control");
            button.innerText = option;
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

    hasAnySelectedOptions() {
        return this.selectedButtons.length > 0;
    }

    getSelectedOptions() {
        let selectedOptions = new Array();
        for (let i = 0; i < this.selectedButtons.length; i++) {
            let button = this.selectedButtons[i];
            let option = this.options[button.index];
            selectedOptions.push(option);
        }

        return selectedOptions;
    }

    setSelectedOptions(selectedOptions) {
        for (let i = 0; i < this.buttons.length; i++) {
            let button = this.buttons[i];
            let option = this.options[i];
            let currentlySelected = this.selectedButtons.includes(button);
            let shouldBeSelected = selectedOptions.includes(option);
            if (currentlySelected != shouldBeSelected)
                this.click(button);
        }
    }

    show() {
        this.horizontalDiv.style.display = "";
    }

    hide() {
        this.horizontalDiv.style.display = "none";
    }
}