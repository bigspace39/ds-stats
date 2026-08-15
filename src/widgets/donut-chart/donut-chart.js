import { UIBuilder } from "../../base-ui/ui-builder.js";
import { WidgetStatics } from "../../library/widget-statics.js";
import { Widget, WidgetConnectionDefinition } from "../widget.js";
import { DonutChartWidgetSettingsDialog } from "./donut-chart-settings.js";
import { TimeSelectorWidget } from "../time-selector/time-selector.js";

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

    getConnectableWidgetClasses() {
        return [new WidgetConnectionDefinition(TimeSelectorWidget, true)];
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
     * @param {HTMLDivElement} dashboardElement The dashboard div element.
     * @param {number} classIndex The class index for the widget.
     * @param {number} dashboardId The dashboardId of the parent dashbaord.
     * @param {number} widgetId The widgetId to assign to this widget.
     * @param {string?} transform The transform style to apply to this widget.
     * @param {Object?} widgetSettings The widget settings.
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

    /**
     * Sets the text of the label at the top of the widget.
     * @param {string} text 
     */
    setLabelText(text) {
        this.label.innerText = text;
    }
}