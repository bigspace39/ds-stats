import { DialogBoxUI } from "../base-ui/dialog-box-ui.js";
import { DashboardStatics, Library, WidgetStatics } from "../library.js";

export class AddWidgetDialog extends DialogBoxUI {
    widgetButtons = new Array();

    constructor() {
        super();
        this.setTitle("Add Widget");

        for (let i = 0; i < WidgetStatics.possibleWidgets.length; i++) {
            let WidgetClass = WidgetStatics.possibleWidgets[i];
            let button = Library.createElement("button", this.content, "widget-add-button");
            button.innerText = WidgetClass.displayName || WidgetClass.name;
            button.addEventListener("click", function() {
                WidgetStatics.createWidget(DashboardStatics.selectedDashboard.boardId, this.widgetIndex);
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