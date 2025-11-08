import { Database } from "./database.js";
import { Library, WidgetStatics, DashboardStatics } from "./library.js";

export class Dashboard {
    board;
    tab;
    tabLabel;
    tabClose;
    boardId;
    defaultDiaperCatConfig = 0;
    exists = false;

    constructor(boardId = -1) {
        this.board = Library.createElement("div", Library.mainDiv, "dashboard");
        this.tab = Library.createElement("div", Library.headerDiv, "dashboard-tab-inactive");
        this.tabLabel = Library.createElement("p", this.tab, "dashboard-tab-label");
        this.tabClose = Library.createElement("button", this.tab, "dashboard-tab-close");
        this.tabClose.innerText = "✕";
        if (boardId < 0) {
            for (let i = 0; i <= DashboardStatics.dashboards.size; i++) {
                if (DashboardStatics.dashboards.has(i))
                    continue;

                boardId = i;
                break;
            }
        }

        this.boardId = boardId;
        DashboardStatics.dashboards.set(this.boardId, this);
        this.saveDashboard();

        this.tabLabel.innerText = `Dashboard ${boardId + 1}`;

        this.tabClose.addEventListener("click", function() {
            this.dashboard.destroy();
        });

        this.tab.addEventListener("click", function () {
            if (!this.dashboard.exists) {
                return;
            }

            DashboardStatics.selectDashboard(this.dashboard);
        });

        this.tabClose.dashboard = this;
        this.tab.dashboard = this;
        this.exists = true;
        this.hideDashboard();

        if (boardId == -1)
            DashboardStatics.selectDashboard(this);
    }

    destroy() {
        if (DashboardStatics.dashboards.size == 1)
            return;

        if (DashboardStatics.selectedDashboard == this) {
            const dashboards = Array.from(DashboardStatics.dashboards.values());
            for (let i = 0; i < dashboards.length; i++) {
                if (dashboards[i] == this) {
                    if (i == 0) {
                        DashboardStatics.selectDashboard(dashboards[1]);
                        break;
                    }
                    
                    DashboardStatics.selectDashboard(dashboards[i - 1]);
                    break;
                }
            }
        }

        this.board.innerHTML = "";
        this.tab.innerHTML = "";
        this.board.remove();
        this.tab.remove();
        DashboardStatics.dashboards.delete(this.boardId);
       Database.deleteFromObjectStore(Database.dashboardStoreName, this.boardId);
        this.exists = false;

        let widgets = Array.from(WidgetStatics.createdWidgets.values());
        for (let i = widgets.length - 1; i >= 0; i--) {
            let widget = widgets[i];
            if (widget.dashboardId == this.boardId)
                widget.destroy();
        }
    }

    saveDashboard() {
        let current = {
            id: this.boardId,
            label: this.getLabel(),
            defaultDiaperCatConfig: this.defaultDiaperCatConfig
        }
        Database.putInObjectStore(Database.dashboardStoreName, current);
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