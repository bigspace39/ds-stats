class SettingsDialog extends DialogBox {
    footer;
    applyButton;

    // === Account ===
    accountLoggedInText;
    loginButton;

    // === API Data ===
    changesText;
    fetchChangesButton;
    accidentsText;
    fetchAccidentsButton;
    typesText;
    fetchTypesButton;
    brandsText;
    fetchBrandsButton;

    // === Dashboard ===
    dashboardNameField;
    defaultDiaperCatConfig;
    defaultDiaperCatConfigValues = new Array();

    constructor() {
        super();
        this.setTitle("Settings");
        this.hide();

        this.footer = createElement("div", this.div, "dialog-footer");
        this.applyButton = createElement("button", this.footer, "accent-button");
        this.applyButton.innerText = "Apply";

        // === Account ===
        this.createText("h2", "Account");
        this.accountLoggedInText = this.createText("p", "Not currently logged in");
        this.loginButton = this.createButton("Login");

        // === API Data ===
        this.createText("h2", "API Data");
        this.changesText = this.createText("p", "Changes: 0");
        this.fetchChangesButton = this.createButton("Refetch All Changes");
        this.accidentsText = this.createText("p", "Accidents: 0");
        this.fetchAccidentsButton = this.createButton("Refetch All Accidents");
        this.typesText = this.createText("p", "Types: 0");
        this.fetchTypesButton = this.createButton("Refetch All Types");
        this.brandsText = this.createText("p", "Brands: 0");
        this.fetchBrandsButton = this.createButton("Refetch All Brands");

        // === Dashboard ===
        this.createText("h2", "Dashboard");
        this.dashboardNameField = this.createTextField("Dashboard Name: ", "dashboard-name");
        this.defaultDiaperCatConfig = this.createDropdown("Default Diaper Category Config: ", "default-diaper-category-config");
    }

    createText(tag, text, id = null) {
        let element = createElement(tag, this.content, id);
        element.innerText = text;
        return element;
    }

    createButton(text) {
        let element = createElement("button", this.content, "accent-button");
        element.innerText = text;
        return element;
    }

    createTextField(labelText, id = null) {
        let form = createElement("form", this.content, null);
        let label = createElement("label", form, null);
        label.htmlFor = id;
        label.innerText = labelText;
        let input = createElement("input", form, id);
        input.name = id;
        input.type = "text";
        return input;
    }

    createDropdown(labelText, id = null, ...options) {
        let form = createElement("form", this.content, null);
        let label = createElement("label", form, null);
        label.htmlFor = id;
        label.innerText = labelText;
        let select = createElement("select", form, id);
        select.name = id;

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            let optionElement = createElement("option", select);
            optionElement.innerText = option;
            optionElement.value = option.toLowerCase();
        }
        return select;
    }
}

settingsDialog = new SettingsDialog();