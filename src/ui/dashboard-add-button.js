import { Dashboard } from "../dashboard.js";
import { Library } from "../library.js";

export class DashboardAddButton {
    buttonParent;
    button;

    constructor() {
        this.buttonParent = Library.createElement("div", Library.headerDiv, "dashboard-add-parent");
        this.button = Library.createElement("button", this.buttonParent, "dashboard-add-button");
        this.button.innerText = "+";
        this.button.addEventListener("click", function() {
            new Dashboard();
        });
    }
}