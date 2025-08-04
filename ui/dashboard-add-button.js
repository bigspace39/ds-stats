class DashboardAddButton {
    button;

    constructor() {
        this.button = createElement("button", headerDiv, "dashboard-add-button");
        this.button.innerText = "+";
        this.button.addEventListener("click", function() {
            createDashboard();
        });
    }
}

dashboardAddButton = new DashboardAddButton();