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
}

class Dashboard {
    board;
    tab;
    tabClose;
    boardId;
    exists = false;

    constructor(boardId) {
        this.board = createElement("div", mainDiv, "dashboard");
        this.tab = createElement("div", headerDiv, "dashboard-tab-inactive");
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
        this.#saveDashboards();

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
        this.#saveDashboards();
        this.exists = false;
    }

    showDashboard() {
        this.tab.id = "dashboard-tab-active";
        this.board.style.display = "";
    }

    hideDashboard() {
        this.tab.id = "dashboard-tab-inactive";
        this.board.style.display = "none";
    }

    #saveDashboards() {
        localStorage.dashboards = JSON.stringify(Array.from(dashboards.keys()));
    }
}