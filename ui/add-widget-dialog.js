class AddWidgetDialog extends DialogBox {
    widgetButtons = new Array();

    constructor() {
        super();
        this.setTitle("Add Widget");

        for (let i = 0; i < possibleWidgets.length; i++) {
            let button = createElement("button", this.content, "widget-add-button");
            button.innerText = possibleWidgets[i].constructor.name;
            button.addEventListener("click", function() {
                createWidget(selectedDashboard.boardId, this.widgetIndex);
                this.dialog.hide();
                setInEditMode(true);
            });
            button.widgetIndex = i;
            button.dialog = this;
            this.widgetButtons.push(button);
        }

        this.hide();
    }
}

addWidgetDialog = new AddWidgetDialog();