import { Library, Delegate } from "../library.js";

export class ToggleUI {
    label;
    input;
    span;
    onToggle = new Delegate();

    constructor(parentElement, toggled = false) {
        this.label = Library.createElement("label", parentElement, "toggle");
        this.input = Library.createElement("input", this.label);
        this.input.type = "checkbox";
        this.span = Library.createElement("span", this.label, "toggle-slider");
        this.setToggled(toggled);

        this.input.addEventListener("click", function() {
            this.toggleUI.onToggle.broadcast(this.toggleUI, this.checked);
        });
        this.input.toggleUI = this;
    }

    setToggled(toggled) {
        if (this.isToggled() == toggled)
            return;

        this.input.checked = toggled;
        this.onToggle.broadcast(this, toggled);
    }

    isToggled() {
        return this.input.checked;
    }

    show() {
        this.label.style.display = "";
    }

    hide() {
        this.label.style.display = "none";
    }
}