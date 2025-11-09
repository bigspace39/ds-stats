import { DialogBoxUI } from "../base-ui/dialog-box-ui.js";
import { UIBuilder } from "../base-ui/ui-builder.js";
import { DashboardStatics } from "../library/dashboard-statics.js";
import { ElementStatics } from "../library/element-statics.js";
import { Statics } from "../library/statics.js";
import { WidgetStatics } from "../library/widget-statics.js";

export class AddWidgetDialog extends DialogBoxUI {
    static {
        Statics.addWidgetDialog = new AddWidgetDialog();
    }

    widgetButtons = new Array();

    constructor() {
        super();
        this.setTitle("Add Widget");

        for (let i = 0; i < WidgetStatics.possibleWidgets.length; i++) {
            let WidgetClass = WidgetStatics.possibleWidgets[i];
            let button = UIBuilder.createElement("button", this.content, "widget-add-button");
            button.innerText = WidgetClass.displayName || WidgetClass.name;

            ElementStatics.bindOnClick(button, this, async function(button, widgetIndex) {
                await WidgetStatics.createWidget(DashboardStatics.selectedDashboard.boardId, widgetIndex);
                this.hide();
                WidgetStatics.setInEditMode(true);
            }, i);
            
            this.widgetButtons.push(button);
        }

        this.hide();
    }
}