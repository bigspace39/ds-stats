import { UIBuilder } from "../base-ui/ui-builder.js";
import { DashboardStatics } from "../library/dashboard-statics.js";
import { Statics } from "../library/statics.js";

class DashboardAddButton {
    static {
        Statics.dashboardAddButton = new DashboardAddButton();
    }

    buttonParent;
    button;

    constructor() {
        this.buttonParent = UIBuilder.createElement("div", Statics.headerDiv, "dashboard-add-parent");
        this.button = UIBuilder.createElement("button", this.buttonParent, "dashboard-add-button");
        this.button.innerText = "+";
        this.button.addEventListener("click", function() {
            DashboardStatics.createDashboard();
        });
    }
}