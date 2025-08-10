class DashboardAddButton {
    buttonParent;
    button;

    constructor() {
        this.buttonParent = createElement("div", headerDiv, "dashboard-add-parent");
        this.button = createElement("button", this.buttonParent, "dashboard-add-button");
        this.button.innerText = "+";
        this.button.addEventListener("click", function() {
            createDashboard();
        });
    }
}

dashboardAddButton = new DashboardAddButton();