class DiaperCategoryConfigsListUI {
    list;

    constructor(parentElement) {
        this.list = new ListUI(parentElement, DiaperCategoryConfigUI);
        this.list.onAddElement.addFunction(this, function() {
            settingsDialog.updateDefaultDiaperCatDropdown();
        });
        this.list.onRemoveElement.addFunction(this, function() {
            settingsDialog.updateDefaultDiaperCatDropdown();
        });
    }

    setConfigs(configs) {
        this.list.setLength(configs.length);
        for (let i = 0; i < configs.length; i++) {
            let config = configs[i];
            let listElement = this.list.listElementClassInstances[i];
            listElement.setConfig(config);
        }
    }

    getConfigs() {
        let configs = new Array();
        for (let i = 0; i < this.list.getLength(); i++) {
            let config = this.list.listElementClassInstances[i].getConfig();
            configs.push(config);
        }

        return configs;
    }
}

class DiaperCategoryConfigUI {
    collapsible;
    horizontal;
    configNameField;
    list;

    constructor(parentElement) {
        let name = this.generateUniqueConfigName();
        this.collapsible = new CollapsibleUI(parentElement, name);
        this.configNameField = UIBuilder.createTextInput(this.collapsible.collapsibleContent, "Config Name: ");
        this.configNameField.config = this;
        this.configNameField.addEventListener("input", function() {
            this.config.collapsible.setLabelText(this.value);
            settingsDialog.updateDefaultDiaperCatDropdown();
        });
        this.configNameField.value = name;
        this.list = new ListUI(this.collapsible.collapsibleContent, DiaperCategoryUI);
    }

    setConfig(config) {
        this.setConfigName(config.name);
        let categories = config.categories;
        this.list.setLength(categories.length);
        for (let i = 0; i < categories.length; i++) {
            let category = categories[i];
            let listElement = this.list.listElementClassInstances[i];
            listElement.setCategory(category);
        }
    }

    getConfig() {
        let config = new Object();
        config.name = this.getConfigName();
        config.categories = new Array();
        for (let i = 0; i < this.list.getLength(); i++) {
            let category = this.list.listElementClassInstances[i].getCategory();
            config.categories.push(category);
        }

        return config;
    }

    setConfigName(name) {
        this.collapsible.setLabelText(name);
        this.configNameField.value = name;
    }

    getConfigName() {
        return this.configNameField.value;
    }

    generateUniqueConfigName() {
        let configs = settingsDialog.diaperCategoryConfigList.getConfigs();
        let names = getDiaperCategoryConfigNames(configs);
        let length = settingsDialog.diaperCategoryConfigList.list.getLength();

        let name = "";
        for (let i = 0; i < length + 1; i++) {
            name = `New Config ${i + 1}`;
            if (!names.includes(name))
                break;
        }

        return name;
    }
}

class DiaperCategoryUI {
    horizontal;
    categoryName;
    filter;
    colorPicker;

    constructor(parentElement) {
        parentElement.style.height = "auto";
        this.horizontal = UIBuilder.createHorizontal(parentElement);
        this.horizontal.style.width = "100%";
        this.horizontal.style.height = "100%";
        this.categoryName = UIBuilder.createTextInput(this.horizontal);
        this.filter = new DiaperTypeFilter(this.horizontal);
        this.colorPicker = new ColorPicker(this.horizontal, "horizontal-color-picker");
    }

    setCategory(category) {
        this.categoryName.value = category.label;
        this.colorPicker.setColor(category.color);
        this.filter.setFilter(category.filter);
    }

    getCategory() {
        let data = new Object();
        data.label = this.categoryName.value;
        data.color = this.colorPicker.getColor();
        data.filter = this.filter.getFilter();
        return data;
    }
}

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

    // === Global ===
    autoRefreshFrequencySegControl;
    weekStartsOnSegControl;
    weightUnitSegControl;
    currencyField;
    currencyPrefixSegControl;
    clockFormatSegControl;

    // === Diaper Category Configs ===
    diaperCategoryResetToDefaultsButton;
    diaperCategoryConfigList;

    // === External Diaper Data ===
    externalDiaperDataTextArea;

    constructor() {
        super();
        UIBuilder.setDefaultParent(this.content);
        this.setTitle("Settings");
        this.hide();

        this.footer = createElement("div", this.div, "dialog-footer");
        this.applyButton = UIBuilder.createButton("Apply", this.footer);
        this.applyButton.settingsDialog = this;
        this.applyButton.addEventListener("click", function() {
            this.settingsDialog.saveSettings();
        });

        this.revertButton = UIBuilder.createButton("Revert", this.footer, ButtonStyle.Cancel);
        this.revertButton.settingsDialog = this;
        this.revertButton.addEventListener("click", function() {
            this.settingsDialog.loadSettings();
        });

        this.revertButton.style.marginRight = "10px";

        // === Account ===
        UIBuilder.createHeading("Account");
        this.accountLoggedInText = UIBuilder.createText("Not currently logged in");
        this.loginButton = UIBuilder.createButton("Login");
        this.loginButton.addEventListener("click", async function() {
            let token = await getValidToken();

            if (token == null)
                login();
            else
                logout();
        });

        // === API Data ===
        UIBuilder.createHeading("API Data");
        this.fetchNewHistory = UIBuilder.createButton("Fetch New History");
        this.fetchNewHistory.addEventListener("click", function() {
            fetchData();
        });

        onStopFetchAPIData.addFunction(this, function() {
            this.updateAPIDataCount();
        });

        this.changesText = UIBuilder.createText("Changes: 0");
        this.fetchChangesButton = UIBuilder.createButton("Refetch All Changes");
        this.fetchChangesButton.addEventListener("click", async function() {
            settingsDialog.changesText.innerText = "Refetching Changes...";
            await fetchChangeHistory();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
        });

        this.accidentsText = UIBuilder.createText("Accidents: 0");
        this.fetchAccidentsButton = UIBuilder.createButton("Refetch All Accidents");
        this.fetchAccidentsButton.addEventListener("click", async function() {
            settingsDialog.accidentsText.innerText = "Refetching Accidents...";
            await fetchAccidentHistory();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
        });

        this.typesText = UIBuilder.createText("Types: 0");
        this.fetchTypesButton = UIBuilder.createButton("Refetch All Types");
        this.fetchTypesButton.addEventListener("click", async function() {
            settingsDialog.typesText.innerText = "Refetching Types...";
            await fetchAllTypes();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
        });

        this.brandsText = UIBuilder.createText("Brands: 0");
        this.fetchBrandsButton = UIBuilder.createButton("Refetch All Brands");
        this.fetchBrandsButton.addEventListener("click", async function() {
            settingsDialog.brandsText.innerText = "Refetching Brands...";
            await fetchAllBrands();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
        });

        // === Dashboard ===
        UIBuilder.createHeading("Dashboard");
        UIBuilder.createText("Dashboard Name");
        this.dashboardNameField = UIBuilder.createTextInput();
        UIBuilder.createText("Default Diaper Category Config");
        this.defaultDiaperCatDropdown = new DropdownUI(this.content);

        // === Global ===
        UIBuilder.createHeading("Global");
        UIBuilder.createText("Auto Refresh Frequency");
        this.autoRefreshFrequencySegControl = new SegmentedControl(this.content, 
            new SegmentedControlOption("Never", -1),
            new SegmentedControlOption("1 minute", 60),
            new SegmentedControlOption("5 minutes", 60 * 5),
            new SegmentedControlOption("1 hour", 60 * 60)
        );
        UIBuilder.createText("Week Starts On");
        this.weekStartsOnSegControl = new SegmentedControl(this.content, 
            new SegmentedControlOption("Saturday", 6),
            new SegmentedControlOption("Sunday", 0),
            new SegmentedControlOption("Monday", 1)
        );
        UIBuilder.createText("Weight Unit");
        this.weightUnitSegControl = new SegmentedControl(this.content, 
            "g", 
            "kg", 
            "oz", 
            "lb"
        );
        UIBuilder.createText("Currency Prefix/Suffix");
        let horizontal = UIBuilder.createHorizontal();
        this.currencyField = UIBuilder.createTextInput(horizontal);
        this.currencyPrefixSegControl = new SegmentedControl(horizontal, 
            new SegmentedControlOption("Prefix", false),
            new SegmentedControlOption("Suffix", true)
        );
        UIBuilder.createText("Clock Format");
        this.clockFormatSegControl = new SegmentedControl(this.content, 
            new SegmentedControlOption("24h", true),
            new SegmentedControlOption("12h", false)
        );

        // === Diaper Category Configs ===
        UIBuilder.createHeading("Diaper Category Configs");
        this.diaperCategoryResetToDefaultsButton = UIBuilder.createButton("Reset To Defaults");
        this.diaperCategoryResetToDefaultsButton.style.marginBottom = "10px";
        this.diaperCategoryResetToDefaultsButton.settingsDialog = this;
        this.diaperCategoryResetToDefaultsButton.addEventListener("click", function() {
            this.settingsDialog.diaperCategoryConfigList.setConfigs(defaultDiaperCategoryConfigs);
        });
        this.diaperCategoryConfigList = new DiaperCategoryConfigsListUI(this.content);

        // === External Diaper Data ===
        UIBuilder.createHeading("External Diaper Data");
        this.externalDiaperDataTextArea = UIBuilder.createTextArea();

        UIBuilder.resetDefaultParent();
    }

    async loadSettings() {
        let token = await getValidTokenObject();
        if (token == null) {
            this.accountLoggedInText.innerText = "Not currently logged in";
            this.loginButton.innerText = "Login";
        }
        else {
            this.accountLoggedInText.innerText = `Currently logged in as ${token.username}`;
            this.loginButton.innerText = "Logout";
        }

        this.updateAPIDataCount();

        this.diaperCategoryConfigList.setConfigs(settings.diaperCategoryConfigs);

        this.dashboardNameField.value = selectedDashboard.getLabel();
        let names = getDiaperCategoryConfigNames(settings.diaperCategoryConfigs);
        this.defaultDiaperCatDropdown.setOptions(names);
        this.defaultDiaperCatDropdown.setSelectedIndex(selectedDashboard.defaultDiaperCatConfig);

        this.autoRefreshFrequencySegControl.setSelectedOption(settings.autoRefreshFrequency);
        this.weekStartsOnSegControl.setSelectedOption(settings.weekStartsOn);
        this.weightUnitSegControl.setSelectedOption(settings.weightUnit);
        this.currencyField.value = settings.currency;
        this.currencyPrefixSegControl.setSelectedOption(settings.currencyIsSuffix);
        this.clockFormatSegControl.setSelectedOption(settings.twentyFourHourClock);

        this.externalDiaperDataTextArea.value = settings.externalDiaperData;
    }

    saveSettings() {
        selectedDashboard.setLabelAndDefaultDiaperCatConfig(
            this.dashboardNameField.value, 
            this.defaultDiaperCatDropdown.getSelectedIndex()
        );

        settings.autoRefreshFrequency = this.autoRefreshFrequencySegControl.getSelectedOption();
        settings.weekStartsOn = this.weekStartsOnSegControl.getSelectedOption();
        settings.weightUnit = this.weightUnitSegControl.getSelectedOption();
        settings.currency = this.currencyField.value;
        settings.currencyIsSuffix = this.currencyPrefixSegControl.getSelectedOption();
        settings.twentyFourHourClock = this.clockFormatSegControl.getSelectedOption();

        settings.diaperCategoryConfigs = this.diaperCategoryConfigList.getConfigs();

        settings.externalDiaperData = this.externalDiaperDataTextArea.value;
        serializeSettings();
        window.location.href = REDIRECT_URI;
    }

    updateAPIDataCount() {
        this.changesText.innerText = `Changes: ${changeHistory.length}`;
        this.accidentsText.innerText = `Accidents: ${accidentHistory.length}`;
        this.typesText.innerText = `Types: ${types.size}`;
        this.brandsText.innerText = `Brands: ${brands.size}`;
    }

    show() {
        super.show();
        this.loadSettings();
    }

    updateDefaultDiaperCatDropdown() {
        let configs = this.diaperCategoryConfigList.getConfigs();
        let names = getDiaperCategoryConfigNames(configs);
        this.defaultDiaperCatDropdown.setOptions(names);
    }
}

settingsDialog = new SettingsDialog();