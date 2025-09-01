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
    diaperCategoryElements = new Array();

    constructor() {
        super();
        UIBuilder.setDefaultParent(this.content);
        this.setTitle("Settings");
        this.hide();

        this.footer = createElement("div", this.div, "dialog-footer");
        this.applyButton = UIBuilder.createButton("Apply", this.footer);
        this.revertButton = UIBuilder.createButton("Revert", this.footer, ButtonStyle.Cancel);
        this.revertButton.style.marginRight = "10px";

        // === Account ===
        UIBuilder.createHeading("Account");
        this.accountLoggedInText = UIBuilder.createText("Not currently logged in");
        this.loginButton = UIBuilder.createButton("Login");

        // === API Data ===
        UIBuilder.createHeading("API Data");
        this.fetchNewHistory = UIBuilder.createButton("Fetch New History");
        this.changesText = UIBuilder.createText("Changes: 0");
        this.fetchChangesButton = UIBuilder.createButton("Refetch All Changes");
        this.accidentsText = UIBuilder.createText("Accidents: 0");
        this.fetchAccidentsButton = UIBuilder.createButton("Refetch All Accidents");
        this.typesText = UIBuilder.createText("Types: 0");
        this.fetchTypesButton = UIBuilder.createButton("Refetch All Types");
        this.brandsText = UIBuilder.createText("Brands: 0");
        this.fetchBrandsButton = UIBuilder.createButton("Refetch All Brands");

        // === Dashboard ===
        UIBuilder.createHeading("Dashboard");
        UIBuilder.createText("Dashboard Name");
        this.dashboardNameField = UIBuilder.createTextInput();
        UIBuilder.createText("Default Diaper Category Config");
        this.defaultDiaperCatDropdown = UIBuilder.createDropdown();

        // === Global ===
        UIBuilder.createHeading("Global");
        UIBuilder.createText("Auto Refresh Frequency");
        this.autoRefreshFrequencySegControl = new SegmentedControl(this.content, "Never", "1 minute", "5 minutes", "1 hour");
        UIBuilder.createText("Week Starts On");
        this.weekStartsOnSegControl = new SegmentedControl(this.content, "Saturday", "Sunday", "Monday");
        UIBuilder.createText("Weight Unit");
        this.weightUnitSegControl = new SegmentedControl(this.content, "g", "kg", "oz", "lb");
        UIBuilder.createText("Currency Prefix/Suffix");
        let horizontal = UIBuilder.createHorizontal();
        this.currencyField = UIBuilder.createTextInput(horizontal);
        this.currencyPrefixSegControl = new SegmentedControl(horizontal, "Prefix", "Suffix");
        UIBuilder.createText("Clock Format");
        this.hourClockFormatDropdown = new SegmentedControl(this.content, "24h", "12h");

        // === Diaper Category Configs ===
        UIBuilder.createHeading("Diaper Category Configs");

        this.diaperCategoryConfigList = new ListUI(this.content);
        this.diaperCategoryConfigList.onAddElement.addFunction(this, function(content) {
            let diaperCategoryConfig = new DiaperCategoryConfigUI(content);
            this.diaperCategoryElements.push(diaperCategoryConfig);
        });

        this.diaperCategoryConfigList.onRemoveElement.addFunction(this, function(index) {
            this.diaperCategoryElements.splice(index, 1);
        });

        UIBuilder.resetDefaultParent();
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
}

settingsDialog = new SettingsDialog();

class DiaperCategoryConfigUI {
    collapsible;
    horizontal;
    configNameField;
    list;
    listCategories = new Array();

    constructor(parentElement) {
        this.collapsible = new CollapsibleUI(parentElement, "Default");
        this.configName = UIBuilder.createTextInput(this.collapsible.collapsibleContent, "Config Name: ");
        this.list = new ListUI(this.collapsible.collapsibleContent);
        this.list.onAddElement.addFunction(this, function(content) {
            content.style.height = "auto";
            let diaperCategory = new DiaperCategoryUI(content);
            this.listCategories.push(diaperCategory);
        });
        this.list.onRemoveElement.addFunction(this, function(index) {
            this.listCategories.splice(index, 1);
        });
    }
}

class DiaperCategoryUI {
    horizontal;
    categoryName;
    filter;
    colorPicker;

    constructor(parentElement) {
        this.horizontal = UIBuilder.createHorizontal(parentElement);
        this.horizontal.style.width = "100%";
        this.horizontal.style.height = "100%";
        this.categoryName = UIBuilder.createTextInput(this.horizontal);
        this.filter = new DiaperTypeFilter(this.horizontal);
        this.colorPicker = new ColorPicker(this.horizontal, "horizontal-color-picker");
    }
}