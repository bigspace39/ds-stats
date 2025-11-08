import { Enum, Library, WidgetStatics } from "../../library.js";
import { Widget } from "../widget.js";
import { DonutChartWidgetSettingsDialog } from "./donut-chart-settings.js";

export class DonutChartStatType extends Enum {
    static DiapersPerCategoryConfig;
    static DiapersPerType;
    static AccidentsPerLocation;
    static AccidentsPerPosition;

    static {
        super.init();
    }
}

export class DonutChartWidget extends Widget {
    static displayName = "Donut Chart";

    static {
        WidgetStatics.possibleWidgets.push(this);
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
        this.label = Library.createElement("h1", this.contentDiv, "donut-label");
        this.setLabelText("Label");
        this.canvas = Library.createElement("canvas", this.contentDiv, "donut-chart");
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