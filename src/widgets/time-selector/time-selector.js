import { Widget } from "../widget.js";
import { WidgetStatics } from "../../library/widget-statics.js";
import { UIBuilder } from "../../base-ui/ui-builder.js";
import { DropdownUI } from "../../base-ui/dropdown-ui.js";
import { EnumStatics } from "../../library/enum-statics.js";
import { ElementStatics } from "../../library/element-statics.js";
import { Delegate } from "../../library/delegate.js";

/**
 * @readonly
 * @enum {number}
 */
export let TimeSelectorType = {
    AllTime: 0,
    PastDay: 1,
    PastWeek: 2,
    PastMonth: 3,
    PastYear: 4,
    SpecificDay: 5,
    SpecificWeek: 6,
    SpecificMonth: 7,
    SpecificYear: 8,
    Custom: 9,
}

export class TimeSelectorWidget extends Widget {
    static displayName = "Time Selector";

    static {
        WidgetStatics.possibleWidgets.push(this);
    }

    dropdown;
    navigationDiv;
    prevButton;
    input;
    nextButton;
    todayButton;
    customDateDiv;
    startDateInput;
    endDateInput;
    onUpdate = new Delegate();

    /**
     * @param {HTMLDivElement} dashboardElement The dashboard div element.
     * @param {number} classIndex The class index for the widget.
     * @param {number} dashboardId The dashboardId of the parent dashbaord.
     * @param {number} widgetId The widgetId to assign to this widget.
     * @param {string?} transform The transform style to apply to this widget.
     * @param {Object?} widgetSettings The widget settings.
     */
    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        super(dashboardElement, classIndex, dashboardId, widgetId, transform, widgetSettings);
        this.dropdown = new DropdownUI(this.contentDiv, ...EnumStatics.getDisplayNames(TimeSelectorType));
        this.dropdown.onChange.addFunction(this, this.#onChangeDropdown);

        this.contentDiv.style.width = "280px";
        this.contentDiv.style.height = "75px";
        this.contentDiv.style.display = "flex";
        this.contentDiv.style.flexDirection = "column";
        this.contentDiv.style.justifyContent = "baseline";
        this.contentDiv.style.alignItems = "center";
        this.contentDiv.style.padding = "15px";

        this.navigationDiv = UIBuilder.createElement("div", this.contentDiv, "time-navigation");
        this.navigationDiv.style.display = "none";
        
        this.prevButton = UIBuilder.createElement("button", this.navigationDiv, "time-navigation-button");
        this.prevButton.innerText = "<";
        this.prevButton.style.padding = "2px 20px";
        ElementStatics.bindOnClick(this.prevButton, this, function() {
            this.#onClickArrowButton(false);
        });
        
        this.input = UIBuilder.createElement("input", this.navigationDiv, null);
        ElementStatics.bindOnChange(this.input, this, function(element) {
            this.#validateInput();
        });
        
        this.nextButton = UIBuilder.createElement("button", this.navigationDiv, "time-navigation-button");
        this.nextButton.innerText = ">";
        this.nextButton.style.padding = "2px 20px";
        ElementStatics.bindOnClick(this.nextButton, this, function() {
            this.#onClickArrowButton(true);
        });
        
        this.todayButton = UIBuilder.createElement("button", this.contentDiv, "time-navigation-button");
        this.todayButton.innerText = "Today";
        ElementStatics.bindOnClick(this.todayButton, this, function() {
            this.#onClickTodayButton();
        });
        this.todayButton.style.display = "none";

        this.customDateDiv = UIBuilder.createElement("div", this.contentDiv, null);
        this.customDateDiv.style.display = "none";

        this.startDateInput = UIBuilder.createTextInput(this.customDateDiv, "Start");
        this.startDateInput.type = "datetime-local";
        ElementStatics.bindOnChange(this.startDateInput, this, function(element) {
            this.#validateInput();
        });

        this.endDateInput = UIBuilder.createTextInput(this.customDateDiv, "End");
        this.endDateInput.type = "datetime-local";
        ElementStatics.bindOnChange(this.endDateInput, this, function(element) {
            this.#validateInput();
        });
    }

    /**
     * @param {DropdownUI} dropdown
     * @param {TimeSelectorType} index
     */
    #onChangeDropdown(dropdown, index) {
        this.customDateDiv.style.display = "none";
        this.navigationDiv.style.display = "";
        this.todayButton.style.display = "";
        this.#validateInput();

        switch (index) {
            case TimeSelectorType.AllTime:
            case TimeSelectorType.PastDay:
            case TimeSelectorType.PastWeek:
            case TimeSelectorType.PastMonth:
            case TimeSelectorType.PastYear:
                this.navigationDiv.style.display = "none";
                this.todayButton.style.display = "none";
                break;
            case TimeSelectorType.SpecificDay:
                this.input.type = "date";
                break;
            case TimeSelectorType.SpecificWeek:
                this.input.type = "week";
                break;
            case TimeSelectorType.SpecificMonth:
                this.input.type = "month";
                break;
            case TimeSelectorType.SpecificYear:
                this.input.type = "year";
                break;
            case TimeSelectorType.Custom:
                this.navigationDiv.style.display = "none";
                this.todayButton.style.display = "none";
                this.customDateDiv.style.display = "";
                break;
        }
    }

    /** @param {boolean} next */
    #onClickArrowButton(next) {
        let index = this.dropdown.getSelectedIndex();
        let currentDate = new Date();
        switch (index) {
            case TimeSelectorType.AllTime:
            case TimeSelectorType.PastDay:
            case TimeSelectorType.PastWeek:
            case TimeSelectorType.PastMonth:
            case TimeSelectorType.PastYear:
            case TimeSelectorType.Custom:
                break;
            case TimeSelectorType.SpecificDay:
            {
                let date = new Date(this.input.value);
                if (next)
                    date.setUTCDate(date.getUTCDate() + 1);
                else
                    date.setUTCDate(date.getUTCDate() - 1);

                if (date > currentDate)
                    return;

                let str = date.toISOString().split("T")[0];
                this.input.value = str;
                break;
            }
            case TimeSelectorType.SpecificWeek:
            {
                // TODO: Implement
                break;
            }
            case TimeSelectorType.SpecificMonth:
            {
                let date = new Date(this.input.value);
                if (next)
                    date.setUTCMonth(date.getUTCMonth() + 1);
                else
                    date.setUTCMonth(date.getUTCMonth() - 1);

                if (date > currentDate)
                    return;

                let str = date.toISOString().split("T")[0];
                let parts = str.split("-");
                str = `${parts[0]}-${parts[1]}`;
                this.input.value = str;
                break;
            }
            case TimeSelectorType.SpecificYear:
            {
                let date = new Date(this.input.value);
                if (next)
                    date.setUTCFullYear(date.getUTCFullYear() + 1);
                else
                    date.setUTCFullYear(date.getUTCFullYear() - 1);

                if (date > currentDate)
                    return;

                let str = `${date.getFullYear()}`;
                this.input.value = str;
                break;
            }
        }

        this.onUpdate.broadcast();
    }

    #onClickTodayButton() {
        let index = this.dropdown.getSelectedIndex();
        let currentDate = new Date();
        switch (index) {
            case TimeSelectorType.AllTime:
            case TimeSelectorType.PastDay:
            case TimeSelectorType.PastWeek:
            case TimeSelectorType.PastMonth:
            case TimeSelectorType.PastYear:
            case TimeSelectorType.Custom:
                break;
            case TimeSelectorType.SpecificDay:
            {
                let str = currentDate.toISOString().split("T")[0];
                if (str == this.input.value)
                    return;

                this.input.value = str;
                break;
            }
            case TimeSelectorType.SpecificWeek:
            {
                // TODO: Implement
                break;
            }
            case TimeSelectorType.SpecificMonth:
            {
                let str = currentDate.toISOString().split("T")[0];
                let parts = str.split("-");
                str = `${parts[0]}-${parts[1]}`;
                if (str == this.input.value)
                    return;

                this.input.value = str;
                break;
            }
            case TimeSelectorType.SpecificYear:
            {
                let str = `${currentDate.getFullYear()}`;
                if (str == this.input.value)
                    return;

                this.input.value = str;
                break;
            }
        }

        this.onUpdate.broadcast();
    }

    #validateInput() {
        // TODO: Implement
        let index = this.dropdown.getSelectedIndex();
        switch (index) {
            case TimeSelectorType.AllTime:
            case TimeSelectorType.PastDay:
            case TimeSelectorType.PastWeek:
            case TimeSelectorType.PastMonth:
            case TimeSelectorType.PastYear:
                break;
            case TimeSelectorType.SpecificDay:
                break;
            case TimeSelectorType.SpecificWeek:
                break;
            case TimeSelectorType.SpecificMonth:
                break;
            case TimeSelectorType.SpecificYear:
                break;
            case TimeSelectorType.Custom:
                break;
        }
    }

    /**
     * Returns the start date for the selected time period
     * @returns {Date?}
     */
    getStartDate() {
        // TODO: Implement
        let index = this.dropdown.getSelectedIndex();

        switch (index) {
            case TimeSelectorType.AllTime:
                return null;
            case TimeSelectorType.PastDay:
                break;
            case TimeSelectorType.PastWeek:
                break;
            case TimeSelectorType.PastMonth:
                break;
            case TimeSelectorType.PastYear:
                break;
            case TimeSelectorType.SpecificDay:
                break;
            case TimeSelectorType.SpecificWeek:
                break;
            case TimeSelectorType.SpecificMonth:
                break;
            case TimeSelectorType.SpecificYear:
                break;
            case TimeSelectorType.Custom:
                break;
        }
    }

    /**
     * Returns the end date for the selected time period
     * @returns {Date?}
     */
    getEndDate() {
        // TODO: Implement
        let index = this.dropdown.getSelectedIndex();

        switch (index) {
            case TimeSelectorType.AllTime:
                return null;
            case TimeSelectorType.PastDay:
                break;
            case TimeSelectorType.PastWeek:
                break;
            case TimeSelectorType.PastMonth:
                break;
            case TimeSelectorType.PastYear:
                break;
            case TimeSelectorType.SpecificDay:
                break;
            case TimeSelectorType.SpecificWeek:
                break;
            case TimeSelectorType.SpecificMonth:
                break;
            case TimeSelectorType.SpecificYear:
                break;
            case TimeSelectorType.Custom:
                break;
        }
    }
}