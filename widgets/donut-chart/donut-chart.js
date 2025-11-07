class DonutChartWidget extends Widget {
    static displayName = "Donut Chart";

    static {
        possibleWidgets.push(this);
    }

    getSettingsDialogClass() {
        return DonutChartWidgetSettingsDialog;
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
        this.setLabelText("Label");
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

    setLabelText(text) {
        this.label.innerText = text;
    }
}

class DonutChartWidgetSettingsDialog extends WidgetSettingsDialog {
    selectMonthGraphButton;
    connectedMonthGraphText;
    
    constructor(widget) {
        super(widget);
        UIBuilder.setDefaultParent(this.content);

        this.selectMonthGraphButton = new SelectConnectedWidgetButtonUI(this.content, this.widget, "MonthCalendarWidget");
    }

    setSettingsDefaults(settings) {
        settings.connectedMonthCalendarId = -1;
    }

    loadSettings(settings) {
        this.selectMonthGraphButton.setConnectedWidgetId(settings.connectedMonthCalendarId);
    }

    saveSettings(settings) {
        settings.connectedMonthCalendarId = this.selectMonthGraphButton.getConnectedWidgetId();
    }
}