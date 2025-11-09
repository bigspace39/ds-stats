export class Statics {
    static REDIRECT_URI = window.location.protocol == "https:" ? "https://bigspace39.github.io/ds-stats/" : "http://localhost:8080/";
    static mainDiv = document.getElementById("main");
    static headerDiv = document.getElementById("header");

    /** @type {import("../ui/add-widget-dialog.js").AddWidgetDialog} */
    static addWidgetDialog;
    /** @type {import("../ui/dashboard-add-button.js").DashboardAddButton} */
    static dashboardAddButton;
    /** @type {import("../ui/login-prompt.js").LoginPrompt} */
    static loginPrompt;
    /** @type {import("../ui/settings-dialog.js").SettingsDialog} */
    static settingsDialog;
    /** @type {import("../ui/toolbar.js").Toolbar} */
    static toolbar;
}