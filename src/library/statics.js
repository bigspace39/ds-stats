export class Statics {
    static REDIRECT_URI = window.location.protocol == "https:" ? "https://bigspace39.github.io/ds-stats/" : "http://localhost:8080/";
    static mainDiv = document.getElementById("main");
    static headerDiv = document.getElementById("header");

    static addWidgetDialog;
    static dashboardAddButton;
    static loginPrompt;
    static settingsDialog;
    static toolbar;
}