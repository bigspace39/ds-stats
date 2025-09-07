class DiaperTypeFilterSectionData {
    displayName;
    propertyName;

    constructor(displayName, propertyName) {
        this.displayName = displayName;
        this.propertyName = propertyName;
    }
}

class DiaperTypeFilter {
    button;
    tippy;
    tooltipParentDiv;
    segmentedControls = new Map();

    constructor(parentElement) {
        this.button = createElement("button", parentElement, "diaper-type-filter");
        this.button.role = "button";
        this.button.innerText = "0 filters active";

        this.tooltipParentDiv = createElement("div", null, "diaper-type-filter-edit");
        this.tippy = tippy(this.button, {
            content: this.tooltipParentDiv,
            placement: "right",
            zIndex: 2147483647 - 25,
            theme: "light",
            interactive: true
        });

        this.createSection(new DiaperTypeFilterSectionData("Usage", "usage"), 
            new SegmentedControlOption("Disposable", "DISPOSABLE"), 
            new SegmentedControlOption("Reusable", "REUSABLE")
        );
        this.createSection(new DiaperTypeFilterSectionData("Category", "category"), 
            new SegmentedControlOption("Diaper (Tabs)", "DIAPER"), 
            new SegmentedControlOption("Pull Up", "PULL_UP"),
            new SegmentedControlOption("Pad (Anatomical)", "PAD"),
            new SegmentedControlOption("Insert / Booster", "INSERT_BOOSTER"),
            new SegmentedControlOption("Cover", "COVER"),
            new SegmentedControlOption("All in One", "ALL_IN_ONE"),
            new SegmentedControlOption("Mesh Pants", "MESH_PANTS"),
            new SegmentedControlOption("Flat / Prefold", "FLAT_PREFOLD"),
            new SegmentedControlOption("Fitted", "FITTED")
        );
        this.createSection(new DiaperTypeFilterSectionData("Target", "target"), 
            new SegmentedControlOption("Abdl", "ABDL"),
            new SegmentedControlOption("Medical", "MEDICAL"),
            new SegmentedControlOption("Youth", "YOUTH")
        );
        this.createSection(new DiaperTypeFilterSectionData("Fasteners", "fasteners"), 
            new SegmentedControlOption("Snap", "SNAP"), 
            new SegmentedControlOption("Hook & Loop (Velcro)", "VELCRO"),
            new SegmentedControlOption("Elastic", "ELASTIC"),
            new SegmentedControlOption("Drawstring", "DRAWSTRING"),
            new SegmentedControlOption("Pin", "PIN"),
            new SegmentedControlOption("Adhesive Tab", "ADHESIVE_TAB")
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
        let segmentedControl = new MultiSegmentedControl(this.tooltipParentDiv, ...options);
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
            filter[key] = value.getSelectedOptions();
        });

        return filter;
    }
}