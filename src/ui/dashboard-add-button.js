import { UIBuilder } from "../base-ui/ui-builder.js";
import { DashboardStatics } from "../library/dashboard-statics.js";
import { ElementStatics } from "../library/element-statics.js";
import { Statics } from "../library/statics.js";

export class DashboardAddButton {
    static {
        Statics.dashboardAddButton = new DashboardAddButton();
    }

    buttonParent;
    button;

    constructor() {
        this.buttonParent = UIBuilder.createElement("div", Statics.headerDiv, "dashboard-add-parent");
        this.button = UIBuilder.createElement("button", this.buttonParent, "dashboard-add-button");
        this.button.innerText = "+";
        ElementStatics.bindOnClick(this.button, this, function() {
            DashboardStatics.createDashboard();
        });
    }
}