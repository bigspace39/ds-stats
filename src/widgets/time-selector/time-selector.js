import { Widget } from "../widget.js";
import { WidgetStatics } from "../../library/widget-statics.js";
import { UIBuilder } from "../../base-ui/ui-builder.js";
import { DropdownUI } from "../../base-ui/dropdown-ui.js";
import { EnumStatics } from "../../library/enum-statics.js";

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
    input;

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
        this.dropdown.onChange.addFunction(this, this.onChangeDropdown);

        this.contentDiv.style.width = "250px";
        this.contentDiv.style.height = "75px";
        this.contentDiv.style.display = "flex";
        this.contentDiv.style.flexDirection = "column";
        this.contentDiv.style.justifyContent = "baseline";
        this.contentDiv.style.alignItems = "center";
        this.contentDiv.style.padding = "15px";
        
        this.input = UIBuilder.createElement("input", this.contentDiv, null);
        this.input.style.display = "none";
    }

    /**
     * @param {DropdownUI} dropdown
     * @param {TimeSelectorType} index
     */
    onChangeDropdown(dropdown, index) {
        switch (index) {
            case TimeSelectorType.AllTime:
            case TimeSelectorType.PastDay:
            case TimeSelectorType.PastWeek:
            case TimeSelectorType.PastMonth:
            case TimeSelectorType.PastYear:
                this.input.style.display = "none";
                break;
            case TimeSelectorType.SpecificDay:
                this.input.style.display = "";
                this.input.type = "date";
                break;
            case TimeSelectorType.SpecificWeek:
                this.input.style.display = "";
                this.input.type = "week";
                if (this.input.type != "week")
                    console.log("Week not supported!");
                break;
            case TimeSelectorType.SpecificMonth:
                this.input.style.display = "";
                this.input.type = "month";
                break;
            case TimeSelectorType.SpecificYear:
                this.input.style.display = "";
                this.input.type = "year";
                break;
            case TimeSelectorType.Custom:
                this.input.style.display = "none";
                break;
        }
    }
}