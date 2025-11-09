/// <reference types="tippy.js" />
import { Statics } from "../library/statics.js";
import { UIBuilder } from "./ui-builder.js";
import { SegmentedControlUIOption } from "./segmented-control-ui.js";
import { MultiSegmentedControlUI } from "./multi-segmented-control-ui.js";

export class DiaperTypeFilterUISectionData {
    displayName;
    propertyName;

    constructor(displayName, propertyName) {
        this.displayName = displayName;
        this.propertyName = propertyName;
    }
}

export class DiaperTypeFilterUI {
    button;
    tippy;
    tooltipParentDiv;
    segmentedControls = new Map();

    constructor(parentElement) {
        this.button = UIBuilder.createElement("button", parentElement, "diaper-type-filter");
        this.button.role = "button";
        this.button.innerText = "0 filters active";

        this.tooltipParentDiv = UIBuilder.createElement("div", null, "diaper-type-filter-edit");
        this.tippy = tippy(this.button, {
            content: this.tooltipParentDiv,
            placement: "right",
            zIndex: 2147483647 - 25,
            theme: "light",
            interactive: true
        });

        this.createSection(new DiaperTypeFilterUISectionData("Usage", "usage"), 
            new SegmentedControlUIOption("Disposable", "DISPOSABLE"), 
            new SegmentedControlUIOption("Reusable", "REUSABLE")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Category", "category"), 
            new SegmentedControlUIOption("Diaper (Tabs)", "DIAPER"), 
            new SegmentedControlUIOption("Pull Up", "PULL_UP"),
            new SegmentedControlUIOption("Pad (Anatomical)", "PAD"),
            new SegmentedControlUIOption("Insert / Booster", "INSERT_BOOSTER"),
            new SegmentedControlUIOption("Cover", "COVER"),
            new SegmentedControlUIOption("All in One", "ALL_IN_ONE"),
            new SegmentedControlUIOption("Mesh Pants", "MESH_PANTS"),
            new SegmentedControlUIOption("Flat / Prefold", "FLAT_PREFOLD"),
            new SegmentedControlUIOption("Fitted", "FITTED")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Target", "target"), 
            new SegmentedControlUIOption("Abdl", "ABDL"),
            new SegmentedControlUIOption("Medical", "MEDICAL"),
            new SegmentedControlUIOption("Youth", "YOUTH")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Fasteners", "fasteners"), 
            new SegmentedControlUIOption("Snap", "SNAP"), 
            new SegmentedControlUIOption("Hook & Loop (Velcro)", "VELCRO"),
            new SegmentedControlUIOption("Elastic", "ELASTIC"),
            new SegmentedControlUIOption("Drawstring", "DRAWSTRING"),
            new SegmentedControlUIOption("Pin", "PIN"),
            new SegmentedControlUIOption("Adhesive Tab", "ADHESIVE_TAB")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Backing Material", "backingMaterial"), 
            new SegmentedControlUIOption("Cloth", "CLOTH"), 
            new SegmentedControlUIOption("Plastic", "PLASTIC")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Wetness Indicator", "wetnessIndicator"), 
            new SegmentedControlUIOption("Yes", "true"), 
            new SegmentedControlUIOption("No", "false")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Landing Zone", "landingZone"), 
            new SegmentedControlUIOption("Yes", "true"), 
            new SegmentedControlUIOption("No", "false")
        );
        this.createSection(new DiaperTypeFilterUISectionData("Tabs Per Side", "tabsPerSide"), 
            new SegmentedControlUIOption("2", "2"), 
            new SegmentedControlUIOption("4", "4")
        );

        this.segmentedControls.forEach((value, key, map) => {
            value.onClick.addFunction(this, this.updateLabel);
        });
    }

    updateLabel() {
        let filterCount = 0;
        
        this.segmentedControls.forEach((value, key, map) => {
            if (value.hasAnySelectedOptions())
                filterCount++;
        });

        this.button.innerText = `${filterCount} filter${filterCount != 1 ? "s" : ""} active`;
    }

    createSection(sectionData, ...options) {
        UIBuilder.createHeading(sectionData.displayName, this.tooltipParentDiv);
        let segmentedControl = new MultiSegmentedControlUI(this.tooltipParentDiv, ...options);
        this.segmentedControls.set(sectionData.propertyName, segmentedControl);
    }

    setFilter(filter) {
        this.segmentedControls.forEach((value, key, map) => {
            if (filter[key]) {
                value.setSelectedOptions(filter[key]);
            }
            else {
                value.setSelectedOptions(new Array());
            }
        });
    }

    getFilter() {
        let filter = new Object();
        this.segmentedControls.forEach((value, key, map) => {
            if (value.hasAnySelectedOptions())
                filter[key] = value.getSelectedOptions();
        });

        return filter;
    }

    show() {
        this.button.style.display = "";
    }

    hide() {
        this.button.style.display = "none";
    }
}