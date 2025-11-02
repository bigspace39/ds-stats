class DonutChart extends Widget {
    static displayName = "Donut Chart";

    static {
        possibleWidgets.push(this);
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
        this.contentDiv.style.height = "250px";
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
        this.data.datasets[0].data[0]++;
        this.chart.data = this.data;
        this.chart.update();
    }
}