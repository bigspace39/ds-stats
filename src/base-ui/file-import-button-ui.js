import { Delegate } from "../library/delegate.js";
import { ElementStatics } from "../library/element-statics.js";
import { UIBuilder } from "./ui-builder.js";

export class FileImportButtonUI {
    /** @type {HTMLButtonElement} */
    button;
    /** @type {HTMLInputElement} */
    input;
    onImportText = new Delegate();

    /**
     * Will create a button that can import a previously exported JSON file.
     * @param {HTMLElement} parentElement The parent element.
     * @param {string} text The text on the import button.
     */
    constructor(parentElement, text) {
        this.button = UIBuilder.createElement("button", parentElement, "accent-button");
        this.button.innerText = text;
        this.input = UIBuilder.createElement("input", parentElement);
        this.input.type = "file";
        this.input.accept = ".json";
        this.input.style.display = "none";

        ElementStatics.bindOnClick(this.button, this, function(element) {
            this.input.click();
        });
        ElementStatics.bindOnChange(this.input, this, function(element) {
            // @ts-ignore
            let file = element.files[0];
            console.log("Uploaded file:");
            console.log(file);
            
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                console.log("File content:");
                console.log(event.target.result);
                this.onImportText.broadcast(event.target.result);
            });
            reader.readAsText(file);
        });
    }

    show() {
        this.button.style.display = "";
    }

    hide() {
        this.button.style.display = "none";
    }
}