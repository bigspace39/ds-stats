import { CollapsibleUI } from "../base-ui/collapsible-ui.js";
import { ColorPickerUI } from "../base-ui/color-picker-ui.js";
import { DialogBoxUI } from "../base-ui/dialog-box-ui.js";
import { DiaperTypeFilterUI } from "../base-ui/diaper-type-filter-ui.js";
import { DropdownUI } from "../base-ui/dropdown-ui.js";
import { FileImportButtonUI } from "../base-ui/file-import-button-ui.js";
import { ListUI } from "../base-ui/list-ui.js";
import { QuestionmarkTooltipUI } from "../base-ui/questionmark-tooltip-ui.js";
import { SegmentedControlUI, SegmentedControlUIOption } from "../base-ui/segmented-control-ui.js";
import { SpinnerUI } from "../base-ui/spinner-ui.js";
import { ButtonStyle, UIBuilder } from "../base-ui/ui-builder.js";
import { API } from "../diapstash-api.js";
import { DashboardStatics, Library, WidgetStatics } from "../library.js";
import { Settings } from "../settings.js";

class DiaperCategoryConfigsListUI {
    list;

    constructor(parentElement) {
        this.list = new ListUI(parentElement, DiaperCategoryConfigUI);
        this.list.onAddElement.addFunction(this, function() {
            Library.settingsDialog.updateDefaultDiaperCatDropdown();
        });
        this.list.onRemoveElement.addFunction(this, function() {
            Library.settingsDialog.updateDefaultDiaperCatDropdown();
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
            Library.settingsDialog.updateDefaultDiaperCatDropdown();
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
        let config = {
            name: this.getConfigName(),
            categories: new Array()
        }

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
        let configs = Library.settingsDialog.diaperCategoryConfigList.getConfigs();
        let names = Settings.getDiaperCategoryConfigNames(configs);
        let length = Library.settingsDialog.diaperCategoryConfigList.list.getLength();

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
        let data = {
            label: this.categoryName.value,
            color: this.colorPicker.getColor(),
            filter: this.filter.getFilter()
        }
        return data;
    }
}

export class SettingsDialog extends DialogBoxUI {
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

        this.footer = Library.createElement("div", this.div, "dialog-footer");
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
            let token = await API.getValidToken();

            if (token == null)
                API.login();
            else
                API.logout();
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
            this.settingsDialog.diaperCategoryConfigList.setConfigs(Settings.defaultDiaperCategoryConfigs);
        });
        this.diaperCategoryConfigList = new DiaperCategoryConfigsListUI(this.content);

        // === Export/Import ===
        horizontal = UIBuilder.createHorizontal();
        UIBuilder.createHeading("Export/Import", horizontal);
        new QuestionmarkTooltipUI(horizontal, "Export/Import dashboards, widgets, and settings in JSON format");
        horizontal = UIBuilder.createHorizontal();
        this.exportButton = UIBuilder.createButton("Export", horizontal);
        this.exportButton.addEventListener("click", async function() {
            Library.saveJsonFile(Library.getExportFileName(), await Library.getExportData());
        });

        this.exportButton.style.marginRight = "10px";
        this.importButton = new FileImportButtonUI(horizontal, "Import");
        this.importButton.onImportText.addFunction(this, function(text) {
            Library.importData(text);
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
            API.fetchData();
        });

        API.onStopFetchAPIData.addFunction(this, function() {
            this.updateAPIDataCount();
        });

        this.changesText = UIBuilder.createText("Changes: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchChangesButton = UIBuilder.createButton("Refetch All Changes", horizontal);
        this.fetchChangesSpinner = new SpinnerUI(horizontal, true);
        this.fetchChangesButton.addEventListener("click", async function() {
            Library.settingsDialog.fetchChangesSpinner.show();
            await API.fetchChangeHistory();
            WidgetStatics.updateWidgetsOnSelectedDashboard();
            Library.settingsDialog.updateAPIDataCount();
            Library.settingsDialog.fetchChangesSpinner.hide();
        });

        this.accidentsText = UIBuilder.createText("Accidents: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchAccidentsButton = UIBuilder.createButton("Refetch All Accidents", horizontal);
        this.fetchAccidentsSpinner = new SpinnerUI(horizontal, true);
        this.fetchAccidentsButton.addEventListener("click", async function() {
            Library.settingsDialog.fetchAccidentsSpinner.show();
            await API.fetchAccidentHistory();
            WidgetStatics.updateWidgetsOnSelectedDashboard();
            Library.settingsDialog.updateAPIDataCount();
            Library.settingsDialog.fetchAccidentsSpinner.hide();
        });

        this.typesText = UIBuilder.createText("Types: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchTypesButton = UIBuilder.createButton("Refetch All Types", horizontal);
        this.fetchTypesSpinner = new SpinnerUI(horizontal, true);
        this.fetchTypesButton.addEventListener("click", async function() {
            Library.settingsDialog.fetchTypesSpinner.show();
            await API.fetchAllTypes();
            WidgetStatics.updateWidgetsOnSelectedDashboard();
            Library.settingsDialog.updateAPIDataCount();
            Library.settingsDialog.fetchTypesSpinner.hide();
        });

        this.brandsText = UIBuilder.createText("Brands: 0");
        horizontal = UIBuilder.createHorizontal();
        this.fetchBrandsButton = UIBuilder.createButton("Refetch All Brands", horizontal);
        this.fetchBrandsSpinner = new SpinnerUI(horizontal, true);
        this.fetchBrandsButton.addEventListener("click", async function() {
            Library.settingsDialog.fetchBrandsSpinner.show();
            await API.fetchAllBrands();
            WidgetStatics.updateWidgetsOnSelectedDashboard();
            Library.settingsDialog.updateAPIDataCount();
            Library.settingsDialog.fetchBrandsSpinner.hide();
        });

        UIBuilder.resetDefaultParent();
    }

    async loadSettings() {
        let token = await API.getValidTokenObject();
        if (token == null) {
            this.accountLoggedInText.innerText = "Not currently logged in";
            this.loginButton.innerText = "Login";
        }
        else {
            this.accountLoggedInText.innerText = `Currently logged in as ${token.username}`;
            this.loginButton.innerText = "Logout";
        }

        this.updateAPIDataCount();

        this.diaperCategoryConfigList.setConfigs(Settings.data.diaperCategoryConfigs);

        this.dashboardNameField.value = DashboardStatics.selectedDashboard.getLabel();
        let names = Settings.getDiaperCategoryConfigNames(Settings.data.diaperCategoryConfigs);
        this.defaultDiaperCatDropdown.setOptions(names);
        this.defaultDiaperCatDropdown.setSelectedIndex(DashboardStatics.selectedDashboard.defaultDiaperCatConfig);

        this.autoRefreshFrequencySegControl.setSelectedOption(Settings.data.autoRefreshFrequency);
        this.weekStartsOnSegControl.setSelectedOption(Settings.data.weekStartsOn);
        this.weightUnitSegControl.setSelectedOption(Settings.data.weightUnit);
        this.currencyField.value = Settings.data.currency;
        this.currencyPrefixSegControl.setSelectedOption(Settings.data.currencyIsSuffix);
        this.clockFormatSegControl.setSelectedOption(Settings.data.twentyFourHourClock);

        this.externalDiaperDataTextArea.value = Settings.data.externalDiaperData;
    }

    saveSettings() {
        DashboardStatics.selectedDashboard.setLabelAndDefaultDiaperCatConfig(
            this.dashboardNameField.value, 
            this.defaultDiaperCatDropdown.getSelectedIndex()
        );

        Settings.data.autoRefreshFrequency = this.autoRefreshFrequencySegControl.getSelectedOption();
        Settings.data.weekStartsOn = this.weekStartsOnSegControl.getSelectedOption();
        Settings.data.weightUnit = this.weightUnitSegControl.getSelectedOption();
        Settings.data.currency = this.currencyField.value;
        Settings.data.currencyIsSuffix = this.currencyPrefixSegControl.getSelectedOption();
        Settings.data.twentyFourHourClock = this.clockFormatSegControl.getSelectedOption();

        Settings.data.diaperCategoryConfigs = this.diaperCategoryConfigList.getConfigs();

        Settings.data.externalDiaperData = this.externalDiaperDataTextArea.value;
        Settings.serializeSettings();
        window.location.href = Library.REDIRECT_URI;
    }

    updateAPIDataCount() {
        this.changesText.innerText = `Changes: ${API.changeHistory.length}`;
        this.accidentsText.innerText = `Accidents: ${API.accidentHistory.length}`;
        this.typesText.innerText = `Types: ${API.types.size}`;
        this.brandsText.innerText = `Brands: ${API.brands.size}`;
    }

    show() {
        super.show();
        this.loadSettings();
    }

    updateDefaultDiaperCatDropdown() {
        let configs = this.diaperCategoryConfigList.getConfigs();
        let names = Settings.getDiaperCategoryConfigNames(configs);
        this.defaultDiaperCatDropdown.setOptions(names);
    }
}