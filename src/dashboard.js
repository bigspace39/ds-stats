import { UIBuilder } from "./base-ui/ui-builder.js";
import { Database, DatabaseStore } from "./database.js";
import { DashboardStatics } from "./library/dashboard-statics.js";
import { ElementStatics } from "./library/element-statics.js";
import { Statics } from "./library/statics.js";
import { WidgetStatics } from "./library/widget-statics.js";

export class Dashboard {
    /** @type {HTMLDivElement} */
    board;
    /** @type {HTMLDivElement} */
    tab;
    /** @type {HTMLParagraphElement} */
    tabLabel;
    /** @type {HTMLButtonElement} */
    tabClose;
    boardId = -1;
    defaultDiaperCatConfig = 0;
    exists = false;

    /**
     * Creates a new dashboard with the given boardId.
     * @param {number} boardId boardId to assign to this dashboard.
     */
    constructor(boardId = -1) {
        this.board = UIBuilder.createElement("div", Statics.mainDiv, "dashboard");
        this.tab = UIBuilder.createElement("div", Statics.headerDiv, "dashboard-tab-inactive");
        this.tabLabel = UIBuilder.createElement("p", this.tab, "dashboard-tab-label");
        this.tabClose = UIBuilder.createElement("button", this.tab, "dashboard-tab-close");
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

        ElementStatics.bindOnClick(this.tabClose, this, function(element) {
            this.destroy();
        });

        ElementStatics.bindOnClick(this.tab, this, function(element) {
            if (!this.exists) {
                return;
            }

            DashboardStatics.selectDashboard(this);
        });

        this.exists = true;
    }

    /**
     * Destroys the dashboard.
     * @returns {void}
     */
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
       Database.deleteFromObjectStore(DatabaseStore.Dashboards, this.boardId);
        this.exists = false;

        let widgets = Array.from(WidgetStatics.createdWidgets.values());
        for (let i = widgets.length - 1; i >= 0; i--) {
            let widget = widgets[i];
            if (widget.dashboardId == this.boardId)
                widget.destroy();
        }
    }

    /**
     * Saves the dashbord to the database.
     */
    saveDashboard() {
        let current = {
            id: this.boardId,
            label: this.getLabel(),
            defaultDiaperCatConfig: this.defaultDiaperCatConfig
        }
        Database.putInObjectStore(DatabaseStore.Dashboards, current);
    }

    /**
     * Shows the dashboard.
     */
    showDashboard() {
        this.tab.id = "dashboard-tab-active";
        this.board.style.display = "";
    }

    /**
     * Hides the dashboard.
     */
    hideDashboard() {
        this.tab.id = "dashboard-tab-inactive";
        this.board.style.display = "none";
    }

    /**
     * Gets the dashboard label.
     * @returns {string} Dashboard label.
     */
    getLabel() {
        return this.tabLabel.innerText;
    }

    /**
     * Sets the dashboard label.
     * @param {string} label New dashboard label.
     */
    setLabel(label) {
        this.tabLabel.innerText = label;
        this.saveDashboard();
    }

    /**
     * Sets the default diaper category config index for this board.
     * @param {number} index Diaper category config index.
     */
    setDefaultDiaperCatConfig(index) {
        this.defaultDiaperCatConfig = index;
        this.saveDashboard();
    }

    /**
     * Sets the label and the default diaper category config for the dashboard.
     * @param {string} labelText Dashboard label.
     * @param {number} diaperCatConfigIndex Diaper category config index.
     */
    setLabelAndDefaultDiaperCatConfig(labelText, diaperCatConfigIndex) {
        this.tabLabel.innerText = labelText;
        this.defaultDiaperCatConfig = diaperCatConfigIndex;
        this.saveDashboard();
    }
}