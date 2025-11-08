import { WidgetSettingsDialog } from "../widget-settings.js";
import { MonthCalendarWidget } from "../month-calendar/month-calendar.js";
import { UIBuilder } from "../../base-ui/ui-builder.js";
import { SelectConnectedWidgetButtonUI } from "../../base-ui/select-connected-widget-button-ui.js";
import { DropdownUI } from "../../base-ui/dropdown-ui.js";
import { MultiSegmentedControlUI } from "../../base-ui/multi-segmented-control-ui.js";
import { SegmentedControlUIOption } from "../../base-ui/segmented-control-ui.js";
import { DonutChartStatType } from "./donut-chart.js";
import { EditConditionUI } from "../../base-ui/edit-condition-ui.js";

export class DonutChartWidgetSettingsDialog extends WidgetSettingsDialog {
    selectMonthGraphButton;
    statTypeDropdown;
    accidentTypeSegmentedControl;
    
    constructor(widget) {
        super(widget);
        UIBuilder.setDefaultParent(this.content);

        // === Time Period ===
        UIBuilder.createHeading("Time Period");
        this.selectMonthGraphButton = new SelectConnectedWidgetButtonUI(this.content, this.widget, MonthCalendarWidget);

        // === Stat Type ===
        UIBuilder.createHeading("Stat Type");
        this.statTypeDropdown = new DropdownUI(this.content, ...DonutChartStatType.getDisplayNames());
        this.accidentTypeSegmentedControl = new MultiSegmentedControlUI(this.content, 
            new SegmentedControlUIOption("Wetting", 0),
            new SegmentedControlUIOption("Messing", 1)
        );
        new EditConditionUI(this.accidentTypeSegmentedControl, this.statTypeDropdown.onChange, this, function() {
            return this.statTypeDropdown.getSelectedIndex() == DonutChartStatType.AccidentsPerLocation || 
                this.statTypeDropdown.getSelectedIndex() == DonutChartStatType.AccidentsPerPosition;
        });
    }

    setSettingsDefaults(settings) {
        settings.connectedMonthCalendarId = -1;
        settings.statType = DonutChartStatType.DiapersPerCategoryConfig;
    }

    loadSettings(settings) {
        this.selectMonthGraphButton.setConnectedWidgetId(settings.connectedMonthCalendarId);
        this.statTypeDropdown.setSelectedIndex(settings.statType);
    }

    saveSettings(settings) {
        settings.connectedMonthCalendarId = this.selectMonthGraphButton.getConnectedWidgetId();
        settings.statType = this.statTypeDropdown.getSelectedIndex();
    }
}