import { DialogBoxUI } from "../base-ui/dialog-box-ui.js";
import { DashboardStatics } from "../library/dashboard-statics.js";
import { Library } from "../library/library.js";
import { WidgetStatics } from "../library/widget-statics.js";

class AddWidgetDialog extends DialogBoxUI {
    static {
        Library.addWidgetDialog = new AddWidgetDialog();
    }

    widgetButtons = new Array();

    constructor() {
        super();
        this.setTitle("Add Widget");

        for (let i = 0; i < WidgetStatics.possibleWidgets.length; i++) {
            let WidgetClass = WidgetStatics.possibleWidgets[i];
            let button = Library.createElement("button", this.content, "widget-add-button");
            button.innerText = WidgetClass.displayName || WidgetClass.name;
            button.addEventListener("click", async function() {
                await WidgetStatics.createWidget(DashboardStatics.selectedDashboard.boardId, this.widgetIndex);
                this.dialog.hide();
                WidgetStatics.setInEditMode(true);
            });
            button.widgetIndex = i;
            button.dialog = this;
            this.widgetButtons.push(button);
        }

        this.hide();
    }
}