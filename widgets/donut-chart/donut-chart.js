class DonutChartStatType extends Enum {
    static DiapersPerCategoryConfig;
    static DiapersPerType;
    static AccidentsPerLocation;
    static AccidentsPerPosition;

    static {
        super.init();
    }
}

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
    statTypeDropdown;
    accidentTypeSegmentedControl;
    
    constructor(widget) {
        super(widget);
        UIBuilder.setDefaultParent(this.content);

        // === Time Period ===
        UIBuilder.createHeading("Time Period");
        this.selectMonthGraphButton = new SelectConnectedWidgetButtonUI(this.content, this.widget, "MonthCalendarWidget");

        // === Stat Type ===
        UIBuilder.createHeading("Stat Type");
        this.statTypeDropdown = new DropdownUI(this.content, ...DonutChartStatType.getDisplayNames());
        this.accidentTypeSegmentedControl = new MultiSegmentedControlUI(this.content, 
            new SegmentedControlUIOption("Wetting", 0),
            new SegmentedControlUIOption("Messing", 1)
        );
        new EditConditionUI(this.accidentTypeSegmentedControl, this.statTypeDropdown.onChange, this, function() {
            return this.statTypeDropdown.getSelectedIndex() == DonutChartStatType.AccidentsPerLocation || 
                this.statTypeDropdown.getSelectedIndex() == DonutChartStatType.AccidentsPerPosition;
        });
    }

    setSettingsDefaults(settings) {
        settings.connectedMonthCalendarId = -1;
        settings.statType = DonutChartStatType.DiapersPerCategoryConfig;
    }

    loadSettings(settings) {
        this.selectMonthGraphButton.setConnectedWidgetId(settings.connectedMonthCalendarId);
        this.statTypeDropdown.setSelectedIndex(settings.statType);
    }

    saveSettings(settings) {
        settings.connectedMonthCalendarId = this.selectMonthGraphButton.getConnectedWidgetId();
        settings.statType = this.statTypeDropdown.getSelectedIndex();
    }
}