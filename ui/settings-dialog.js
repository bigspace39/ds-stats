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
        this.filter = new DiaperTypeFilterUI(this.horizontal);
        this.colorPicker = new ColorPickerUI(this.horizontal, "horizontal-color-picker");
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

class SettingsDialog extends DialogBoxUI {
    footer;
    applyButton;
    revertButton;
    lastElementWasH2 = false;

    // === Account ===
    accountLoggedInText;
    loginButton;

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

    // === Export/Import ===
    exportButton;
    importButton;

    // === External Diaper Data ===
    externalDiaperDataTextArea;

    // === API Data ===
    fetchNewHistory;
    changesText;
    fetchChangesButton;
    fetchChangesSpinner;
    accidentsText;
    fetchAccidentsButton;
    fetchAccidentsSpinner;
    typesText;
    fetchTypesButton;
    fetchTypesSpinner;
    brandsText;
    fetchBrandsButton;
    fetchBrandsSpinner;

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

        // === Dashboard ===
        UIBuilder.createHeading("Dashboard");
        UIBuilder.createText("Dashboard Name");
        this.dashboardNameField = UIBuilder.createTextInput();
        UIBuilder.createText("Default Diaper Category Config");
        this.defaultDiaperCatDropdown = new DropdownUI(this.content);

        // === Global ===
        UIBuilder.createHeading("Global");
        UIBuilder.createText("Auto Refresh Frequency");
        this.autoRefreshFrequencySegControl = new SegmentedControlUI(this.content, 
            new SegmentedControlUIOption("Never", -1),
            new SegmentedControlUIOption("1 minute", 60),
            new SegmentedControlUIOption("5 minutes", 60 * 5),
            new SegmentedControlUIOption("1 hour", 60 * 60)
        );
        UIBuilder.createText("Week Starts On");
        this.weekStartsOnSegControl = new SegmentedControlUI(this.content, 
            new SegmentedControlUIOption("Saturday", 6),
            new SegmentedControlUIOption("Sunday", 0),
            new SegmentedControlUIOption("Monday", 1)
        );
        UIBuilder.createText("Weight Unit");
        this.weightUnitSegControl = new SegmentedControlUI(this.content, 
            "g", 
            "kg", 
            "oz", 
            "lb"
        );
        UIBuilder.createText("Currency Prefix/Suffix");
        let horizontal = UIBuilder.createHorizontal();
        this.currencyField = UIBuilder.createTextInput(horizontal);
        this.currencyPrefixSegControl = new SegmentedControlUI(horizontal, 
            new SegmentedControlUIOption("Prefix", false),
            new SegmentedControlUIOption("Suffix", true)
        );
        UIBuilder.createText("Clock Format");
        this.clockFormatSegControl = new SegmentedControlUI(this.content, 
            new SegmentedControlUIOption("24h", true),
            new SegmentedControlUIOption("12h", false)
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

        // === Export/Import ===
        horizontal = UIBuilder.createHorizontal();
        UIBuilder.createHeading("Export/Import", horizontal);
        new QuestionmarkTooltipUI(horizontal, "Export/Import dashboards, widgets, and settings in JSON format");
        horizontal = UIBuilder.createHorizontal();
        this.exportButton = UIBuilder.createButton("Export", horizontal);
        this.exportButton.addEventListener("click", async function() {
            saveJsonFile(getExportFileName(), await getExportData());
        });

        this.exportButton.style.marginRight = "10px";
        this.importButton = new FileImportButtonUI(horizontal, "Import");
        this.importButton.onImportText.addFunction(this, function(text) {
            importData(text);
        });

        // === External Diaper Data ===
        horizontal = UIBuilder.createHorizontal();
        UIBuilder.createHeading("External Diaper Data", horizontal);
        new QuestionmarkTooltipUI(horizontal, "Format:\nY[YEAR]\n[AmountOfDiapers]:[DiaperTypeID] [Optional Comment]\nExample:\nY2020\n10:26 ABU Space M\n21:9 Tena Slip Active Fit Ultima M");
        this.externalDiaperDataTextArea = UIBuilder.createTextArea();

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
        horizontal = UIBuilder.createHorizontal();
        this.fetchChangesButton = UIBuilder.createButton("Refetch All Changes", horizontal);
        this.fetchChangesSpinner = new SpinnerUI(horizontal, true);
        this.fetchChangesButton.addEventListener("click", async function() {
            settingsDialog.fetchChangesSpinner.show();
            await fetchChangeHistory();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
            settingsDialog.fetchChangesSpinner.hide();
        });

        this.accidentsText = UIBuilder.createText("Accidents: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchAccidentsButton = UIBuilder.createButton("Refetch All Accidents", horizontal);
        this.fetchAccidentsSpinner = new SpinnerUI(horizontal, true);
        this.fetchAccidentsButton.addEventListener("click", async function() {
            settingsDialog.fetchAccidentsSpinner.show();
            await fetchAccidentHistory();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
            settingsDialog.fetchAccidentsSpinner.hide();
        });

        this.typesText = UIBuilder.createText("Types: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchTypesButton = UIBuilder.createButton("Refetch All Types", horizontal);
        this.fetchTypesSpinner = new SpinnerUI(horizontal, true);
        this.fetchTypesButton.addEventListener("click", async function() {
            settingsDialog.fetchTypesSpinner.show();
            await fetchAllTypes();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
            settingsDialog.fetchTypesSpinner.hide();
        });

        this.brandsText = UIBuilder.createText("Brands: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchBrandsButton = UIBuilder.createButton("Refetch All Brands", horizontal);
        this.fetchBrandsSpinner = new SpinnerUI(horizontal, true);
        this.fetchBrandsButton.addEventListener("click", async function() {
            settingsDialog.fetchBrandsSpinner.show();
            await fetchAllBrands();
            updateWidgetsOnSelectedDashboard();
            settingsDialog.updateAPIDataCount();
            settingsDialog.fetchBrandsSpinner.hide();
        });

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