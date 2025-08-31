class SettingsDialog extends DialogBox {
    footer;
    applyButton;
    revertButton;
    lastElementWasH2 = false;

    // === Account ===
    accountLoggedInText;
    loginButton;

    // === API Data ===
    fetchNewHistory;
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
    defaultDiaperCatDropdown;
    defaultDiaperCatValues = new Array();

    // === Global ===
    autoRefreshFrequencySegControl;
    weekStartsOnSegControl;
    weightUnitSegControl;
    currencyField;
    currencyPrefixSegControl;
    hourClockFormatDropdown;

    // === Diaper Category Configs ===
    diaperCategoryConfigList;
    diaperCategoryElements;

    constructor() {
        super();
        this.setTitle("Settings");
        this.hide();

        this.footer = createElement("div", this.div, "dialog-footer");
        this.applyButton = createElement("button", this.footer, "accent-button");
        this.applyButton.innerText = "Apply";

        this.revertButton = createElement("button", this.footer, "cancel-button");
        this.revertButton.innerText = "Revert";
        this.revertButton.style.marginRight = "10px";

        // === Account ===
        this.createText("h2", "Account");
        this.accountLoggedInText = this.createText("p", "Not currently logged in");
        this.loginButton = this.createButton("Login");

        // === API Data ===
        this.createText("h2", "API Data");
        this.fetchNewHistory = this.createButton("Fetch New History");
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
        this.createText("p", "Dashboard Name");
        this.dashboardNameField = this.createInputElement("text");
        this.createText("p", "Default Diaper Category Config");
        this.defaultDiaperCatDropdown = this.createDropdown();

        // === Global ===
        this.createText("h2", "Global");
        this.createText("p", "Auto Refresh Frequency");
        this.autoRefreshFrequencySegControl = new SegmentedControl(this.content, "Never", "1 minute", "5 minutes", "1 hour");
        this.createText("p", "Week Starts On");
        this.weekStartsOnSegControl = new SegmentedControl(this.content, "Saturday", "Sunday", "Monday");
        this.createText("p", "Weight Unit");
        this.weightUnitSegControl = new SegmentedControl(this.content, "g", "kg", "oz", "lb");
        this.createText("p", "Currency Prefix/Suffix");
        let horizontal = createElement("div", this.content, "horizontal-form");
        this.currencyField = this.createInputElement("text", horizontal);
        this.currencyPrefixSegControl = new SegmentedControl(horizontal, "Prefix", "Suffix");
        this.createText("p", "Clock Format");
        this.hourClockFormatDropdown = new SegmentedControl(this.content, "24h", "12h");

        // === Diaper Category Configs ===
        this.createText("h2", "Diaper Category Configs");

        this.diaperCategoryConfigList = new ListUI(this.content);
        this.diaperCategoryConfigList.onAddElement.addFunction(this, function(content) {
            let diaperCategoryConfig = new DiaperCategoryConfigUI(content);
        });
    }

    update() {
        this.autoRefreshFrequencySegControl.updateBorderRadius();
        this.weekStartsOnSegControl.updateBorderRadius();
        this.weightUnitSegControl.updateBorderRadius();
        this.currencyPrefixSegControl.updateBorderRadius();
        this.hourClockFormatDropdown.updateBorderRadius();
    }

    show() {
        super.show();
        this.update();
    }

    createText(tag, text, parentElement = null, id = null) {
        if (parentElement == null)
            parentElement = this.content;

        let element = createElement(tag, parentElement, id);
        element.innerText = text;
        if (tag == "p") {
            element.style.marginTop = this.lastElementWasH2 ? "0px" : "18px";
            element.style.marginBottom = "6px";
        }
        this.lastElementWasH2 = tag == "h2";
        return element;
    }

    createButton(text, parentElement = null) {
        if (parentElement == null)
            parentElement = this.content;

        let element = createElement("button", parentElement, "accent-button");
        element.innerText = text;
        this.lastElementWasH2 = false;
        return element;
    }

    createInputElement(type, parentElement = null, id = null) {
        if (parentElement == null)
            parentElement = this.content;

        let input = createElement("input", parentElement, id);
        input.type = type;
        this.lastElementWasH2 = false;
        return input;
    }

    createDropdown(parentElement = null, id = null, ...options) {
        if (parentElement == null)
            parentElement = this.content;

        let select = createElement("select", parentElement, id);

        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            let optionElement = createElement("option", select);
            optionElement.innerText = option;
            optionElement.value = option.toLowerCase();
        }
        this.lastElementWasH2 = false;
        return select;
    }
}

settingsDialog = new SettingsDialog();

class DiaperCategoryConfigUI {
    collapsible;
    horizontal;
    configNameField;
    list;

    constructor(parentElement) {
        this.collapsible = new CollapsibleUI(parentElement, "Default");
        this.horizontal = createElement("div", this.collapsible.collapsibleContent, "horizontal-form");
        let label = createElement("p", this.horizontal, "form-inline-label");
        label.innerText = "Config Name: ";
        this.configName = settingsDialog.createInputElement("text", this.horizontal);
        this.list = new ListUI(this.collapsible.collapsibleContent);
        this.list.onAddElement.addFunction(this, function(content) {
            content.style.height = "auto";
            let diaperCategory = new DiaperCategoryUI(content);
        });
    }
}

class DiaperCategoryUI {
    horizontal;
    categoryName;
    filter;
    colorPicker;

    constructor(parentElement) {
        this.horizontal = createElement("div", parentElement, "horizontal-form");
        this.horizontal.style.width = "100%";
        this.horizontal.style.height = "100%";
        this.categoryName = settingsDialog.createInputElement("text", this.horizontal);
        this.filter = new DiaperTypeFilter(this.horizontal);
        this.colorPicker = new ColorPicker(this.horizontal, "horizontal-color-picker");
    }
}