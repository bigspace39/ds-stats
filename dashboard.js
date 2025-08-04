let dashboards = new Map();
let dashboardAddButton = null;

function createDashboard(dashboardId = -1) {
    const dashboard = new Dashboard(dashboardId);
}

function destroyDashboard(dashboardId) {
    let dashboard = dashboards.get(dashboardId);
    dashboard.destroy();
}

class Dashboard {
    board;
    tab;
    tabClose;
    boardId;

    constructor(boardId) {
        this.board = createElement("div", mainDiv, "dashboard");
        this.tab = createElement("div", headerDiv, "dashboard-tab");
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

        this.tabClose.addEventListener("click", function() { this.dashboard.destroy(); });
        this.tabClose.dashboard = this;
    }

    destroy() {
        if (dashboards.size == 1)
            return;

        this.board.innerHTML = "";
        this.tab.innerHTML = "";
        this.board.remove();
        this.tab.remove();
        dashboards.delete(this.boardId);
        this.#saveDashboards();
    }

    #saveDashboards() {
        localStorage.dashboards = JSON.stringify(Array.from(dashboards.keys()));
    }
}