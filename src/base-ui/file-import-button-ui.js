import { Library, Delegate } from "../library.js";

export class FileImportButtonUI {
    button;
    input;
    onImportText = new Delegate();

    constructor(parentElement, text) {
        this.button = Library.createElement("button", parentElement, "accent-button");
        this.button.innerText = text;
        this.input = Library.createElement("input", parentElement);
        this.input.type = "file";
        this.input.accept = ".json";
        this.input.style.display = "none";

        this.button.addEventListener("click", function() {
            this.inputElement.click();
        });
        this.button.inputElement = this.input;
        this.input.addEventListener("change", function() {
            let file = this.files[0];
            console.log("Uploaded file:");
            console.log(file);
            
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                console.log("File content:");
                console.log(event.target.result);
                this.importUI.onImportText.broadcast(event.target.result);
            });
            reader.readAsText(file);
        });
        this.input.importUI = this;
    }

    show() {
        this.button.style.display = "";
    }

    hide() {
        this.button.style.display = "none";
    }
}