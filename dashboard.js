let dashboards = new Map();

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
    boardId;

    constructor(boardId) {
        this.board = createElement("div", mainDiv, "dashboard");
        this.tab = createElement("div", headerDiv, "dashboard-tab");
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
    }

    destroy() {
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