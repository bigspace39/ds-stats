class DonutChartWidget extends Widget {
    static displayName = "Donut Chart";

    static {
        possibleWidgets.push(this);
    }

    getSettingsDialogClass() {
        return DonutChartWidgetSettingsDialog;
    }

    setSettingsDefaults(settings) {
        settings.connectedMonthCalendarId = -1;
    }

    canvas;
    label;
    chart;
    data = {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    };

    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        super(dashboardElement, classIndex, dashboardId, widgetId, transform, widgetSettings);
        this.label = createElement("h1", this.contentDiv, "donut-label");
        this.label.innerText = "Label";
        this.canvas = createElement("canvas", this.contentDiv, "donut-chart");
        this.contentDiv.style.width = "200px";
        this.contentDiv.style.height = "260px";
        const config = {
            type: 'doughnut',
            data: this.data,
        };

        this.chart = new Chart(
            this.canvas,
            config
        );
    }

    async update_implementation() {
        this.chart.data = this.data;
        this.chart.update();
    }
}

class DonutChartWidgetSettingsDialog extends WidgetSettingsDialog {
    selectMonthGraphButton;
    connectedMonthGraphText;
    
    constructor(widget) {
        super(widget);
        UIBuilder.setDefaultParent(this.content);

        UIBuilder.createText("Connected Month Graph");
        let horizontal = UIBuilder.createHorizontal();
        this.selectMonthGraphButton = new SelectConnectedWidgetButtonUI(horizontal, "Select", this.widget, "MonthCalendarWidget");
        this.selectMonthGraphButton.onSelectConnectedWidget.addFunction(this, function(monthCalendar) {
            this.widget.settings.connectedMonthCalendarId = monthCalendar.widgetId;
            this.widget.saveWidget();
            this.updateConnectedMonthCalendarText();
        });
        this.connectedMonthGraphText = UIBuilder.createText("None", horizontal);
        this.connectedMonthGraphText.style.marginLeft = "6px";
    }

    loadSettings() {
        this.updateConnectedMonthCalendarText();
    }

    saveSettings() {

    }

    updateConnectedMonthCalendarText() {
        let monthWidget = createdWidgets.get(this.widget.settings.connectedMonthCalendarId);
        if (!monthWidget || !widgetIsOfClass(monthWidget, "MonthCalendarWidget")) {
            this.connectedMonthGraphText.innerText = "None";
            return;
        }
        let WidgetClass = possibleWidgets[monthWidget.classIndex];
        this.connectedMonthGraphText.innerText = WidgetClass.displayName + " (" + monthWidget.widgetId + ")";
    }
}