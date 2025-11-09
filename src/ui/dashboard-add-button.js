import { DashboardStatics } from "../library/dashboard-statics.js";
import { Library } from "../library/library.js";

class DashboardAddButton {
    static {
        Library.dashboardAddButton = new DashboardAddButton();
    }

    buttonParent;
    button;

    constructor() {
        this.buttonParent = Library.createElement("div", Library.headerDiv, "dashboard-add-parent");
        this.button = Library.createElement("button", this.buttonParent, "dashboard-add-button");
        this.button.innerText = "+";
        this.button.addEventListener("click", function() {
            DashboardStatics.createDashboard();
        });
    }
}