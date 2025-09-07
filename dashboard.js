let dashboards = new Map();
let dashboardAddButton = null;
let selectedDashboard = null;

function createDashboard(dashboardId = -1) {
    const dashboard = new Dashboard(dashboardId);
    dashboard.hideDashboard();

    if (dashboardId == -1)
        selectDashboard(dashboard);

    return dashboard;
}

function destroyDashboard(dashboardId) {
    let dashboard = dashboards.get(dashboardId);
    dashboard.destroy();
}

function selectDashboard(dashboard) {
    if (selectedDashboard != null) {
        selectedDashboard.hideDashboard();
    }

    dashboard.showDashboard();
    selectedDashboard = dashboard;

    let widgets = Array.from(createdWidgets.values());
    for (let i = widgets.length - 1; i >= 0; i--) {
        let widget = widgets[i];
        if (widget.dashboardId == dashboard.boardId)
            widget.update();
    }
}

class Dashboard {
    board;
    tab;
    tabLabel;
    tabClose;
    boardId;
    defaultDiaperCatConfig = 0;
    exists = false;

    constructor(boardId) {
        this.board = createElement("div", mainDiv, "dashboard");
        this.tab = createElement("div", headerDiv, "dashboard-tab-inactive");
        this.tabLabel = createElement("p", this.tab, "dashboard-tab-label");
        this.tabClose = createElement("button", this.tab, "dashboard-tab-close");
        this.tabClose.innerText = "✕";
        if (boardId < 0) {
            for (let i = 0; i <= dashboards.size; i++) {
                if (dashboards.has(i))
                    continue;

                boardId = i;
                break;
            }
        }

        this.boardId = boardId;
        dashboards.set(this.boardId, this);
        this.saveDashboard();

        this.tabLabel.innerText = `Dashboard ${boardId + 1}`;

        this.tabClose.addEventListener("click", function() {
            this.dashboard.destroy();
        });

        this.tab.addEventListener("click", function () {
            if (!this.dashboard.exists) {
                return;
            }

            selectDashboard(this.dashboard);
        });

        this.tabClose.dashboard = this;
        this.tab.dashboard = this;
        this.exists = true;
    }

    destroy() {
        if (dashboards.size == 1)
            return;

        if (selectedDashboard == this) {
            const tempDashboards = Array.from(dashboards.values());
            for (let i = 0; i < tempDashboards.length; i++) {
                if (tempDashboards[i] == this) {
                    if (i == 0) {
                        selectDashboard(tempDashboards[1]);
                        break;
                    }
                    
                    selectDashboard(tempDashboards[i - 1]);
                    break;
                }
            }
        }

        this.board.innerHTML = "";
        this.tab.innerHTML = "";
        this.board.remove();
        this.tab.remove();
        dashboards.delete(this.boardId);
        deleteFromObjectStore(dashboardStoreName, this.boardId);
        this.exists = false;

        let widgets = Array.from(createdWidgets.values());
        for (let i = widgets.length - 1; i >= 0; i--) {
            let widget = widgets[i];
            if (widget.dashboardId == this.boardId)
                widget.destroy();
        }
    }

    saveDashboard() {
        let current = new Object();
        current.id = this.boardId;
        current.label = this.getLabel();
        current.defaultDiaperCatConfig = this.defaultDiaperCatConfig;
        putInObjectStore(dashboardStoreName, current);
    }

    showDashboard() {
        this.tab.id = "dashboard-tab-active";
        this.board.style.display = "";
    }

    hideDashboard() {
        this.tab.id = "dashboard-tab-inactive";
        this.board.style.display = "none";
    }

    getLabel() {
        return this.tabLabel.innerText;
    }

    setLabel(text) {
        this.tabLabel.innerText = text;
        this.saveDashboard();
    }

    setDefaultDiaperCatConfig(index) {
        this.defaultDiaperCatConfig = index;
        this.saveDashboard();
    }

    setLabelAndDefaultDiaperCatConfig(labelText, diaperCatConfigIndex) {
        this.tabLabel.innerText = labelText;
        this.defaultDiaperCatConfig = diaperCatConfigIndex;
        this.saveDashboard();
    }
}