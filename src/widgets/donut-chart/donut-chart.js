import { UIBuilder } from "../../base-ui/ui-builder.js";
import { WidgetStatics } from "../../library/widget-statics.js";
import { Widget } from "../widget.js";
import { DonutChartWidgetSettingsDialog } from "./donut-chart-settings.js";

/**
 * @readonly
 * @enum {number}
 */
export let DonutChartStatType = {
    DiapersPerCategoryConfig: 0,
    DiapersPerType: 1,
    AccidentsPerLocation: 2,
    AccidentsPerPosition: 3,
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

    /**
     * @override
     */
    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        super(dashboardElement, classIndex, dashboardId, widgetId, transform, widgetSettings);
        this.label = UIBuilder.createElement("h1", this.contentDiv, "donut-label");
        this.setLabelText("Label");
        this.canvas = UIBuilder.createElement("canvas", this.contentDiv, "donut-chart");
        this.contentDiv.style.width = "200px";
        this.contentDiv.style.height = "260px";
        const config = {
            type: 'doughnut',
            data: this.data,
        };

        // @ts-ignore
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