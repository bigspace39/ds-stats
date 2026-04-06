import { WidgetSettingsDialog } from "../widget-settings.js";
import { MonthCalendarWidget } from "../month-calendar/month-calendar.js";
import { UIBuilder } from "../../base-ui/ui-builder.js";
import { SelectConnectedWidgetButtonUI } from "../../base-ui/select-connected-widget-button-ui.js";
import { DropdownUI } from "../../base-ui/dropdown-ui.js";
import { MultiSegmentedControlUI } from "../../base-ui/multi-segmented-control-ui.js";
import { SegmentedControlUIOption } from "../../base-ui/segmented-control-ui.js";
import { DonutChartStatType } from "./donut-chart.js";
import { EditConditionUI } from "../../base-ui/edit-condition-ui.js";
import { EnumStatics } from "../../library/enum-statics.js";

export class DonutChartWidgetSettingsDialog extends WidgetSettingsDialog {
    selectMonthGraphButton;
    statTypeDropdown;
    accidentTypeSegmentedControl;
    
    /** @param {import("../widget-settings.js").Widget} widget */
    constructor(widget) {
        super(widget);
        UIBuilder.setDefaultParent(this.content);

        // === Time Period ===
        UIBuilder.createHeading("Time Period");
        this.selectMonthGraphButton = new SelectConnectedWidgetButtonUI(this.content, this.widget, MonthCalendarWidget);

        // === Stat Type ===
        UIBuilder.createHeading("Stat Type");
        this.statTypeDropdown = new DropdownUI(this.content, ...EnumStatics.getDisplayNames(DonutChartStatType));
        this.accidentTypeSegmentedControl = new MultiSegmentedControlUI(this.content, 
            new SegmentedControlUIOption("Wetting", 0),
            new SegmentedControlUIOption("Messing", 1)
        );
        new EditConditionUI([this.accidentTypeSegmentedControl], this.statTypeDropdown.onChange, this, 
            /** @this {DonutChartWidgetSettingsDialog} */
            function() {
                return this.statTypeDropdown.getSelectedIndex() == DonutChartStatType.AccidentsPerLocation || 
                    this.statTypeDropdown.getSelectedIndex() == DonutChartStatType.AccidentsPerPosition;
            }
        );
    }

    /** @param {any} settings */
    setSettingsDefaults(settings) {
        settings.connectedMonthCalendarId = -1;
        settings.statType = DonutChartStatType.DiapersPerCategoryConfig;
    }

    /** @param {any} settings */
    loadSettings(settings) {
        this.selectMonthGraphButton.setConnectedWidgetId(settings.connectedMonthCalendarId);
        this.statTypeDropdown.setSelectedIndex(settings.statType);
    }

    /** @param {any} settings */
    saveSettings(settings) {
        settings.connectedMonthCalendarId = this.selectMonthGraphButton.getConnectedWidgetId();
        settings.statType = this.statTypeDropdown.getSelectedIndex();
    }
}