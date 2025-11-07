class MonthCalendarWidget extends Widget {
    static displayName = "Month Calendar";

    static {
        possibleWidgets.push(this);
    }

    getSettingsDialogClass() {
        return MonthCalendarWidgetSettingsDialog;
    }

    monthHeader = null;
    monthLabel = null;
    monthPrice = null;
    navigationDiv = null;
    prevButton = null;
    todayButton = null;
    nextButton = null;
    weekdays = null;
    firstDateIndex;
    dates = new Array();
    datesTextBoxes = new Array();
    statusBars = new Array();
    statusBarSections = new Array();
    tippyInstances = new Array();
    selectedMonth;

    days = new Map();
    changeBeforeMonth = null;
    accumulatedPercentage = 0.0;
    price = 0;

    constructor(dashboardElement, classIndex, dashboardId, widgetId = -1, transform = null, widgetSettings = null) {
        super(dashboardElement, classIndex, dashboardId, widgetId, transform, widgetSettings);
        
        this.contentDiv.style.display = "flex";
        this.contentDiv.style.flexDirection = "column";

        this.monthHeader = createElement("div", this.contentDiv, "month-header");
        this.monthLabel = createElement("p", this.monthHeader, "month-label");
        this.monthLabel.innerText = "January 2025";
        this.monthPrice = createElement("p", this.monthHeader, "month-price");
        this.monthPrice.innerText = "100 kr";
        this.navigationDiv = createElement("div", this.monthHeader, "month-navigation");

        this.prevButton = createElement("button", this.navigationDiv, "month-navigation-button");
        this.prevButton.innerText = "<";
        this.prevButton.style.padding = "2px 20px";
        this.prevButton.calendar = this;
        this.prevButton.addEventListener("click", function() {
            this.calendar.prev();
        });

        this.todayButton = createElement("button", this.navigationDiv, "month-navigation-button");
        this.todayButton.innerText = "Today";
        this.todayButton.calendar = this;
        this.todayButton.addEventListener("click", function() {
            this.calendar.today();
        });

        this.nextButton = createElement("button", this.navigationDiv, "month-navigation-button");
        this.nextButton.innerText = ">";
        this.nextButton.style.padding = "2px 20px";
        this.nextButton.calendar = this;
        this.nextButton.addEventListener("click", function() {
            this.calendar.next();
        });

        this.weekdays = createElement("div", this.contentDiv, "weekdays");

        for (let weekdayInt = 0; weekdayInt < 7; weekdayInt++) {
            let weekdayDate = new Date(2025, 0, 5 + weekdayInt + settings.weekStartsOn);
            const weekday = getWeekdayStrFromDate(weekdayDate);

            const button = createElement("button", this.weekdays, "weekday");
            button.innerText = weekday;
            button.inert = true;
        }

        for (let row = 0; row < 6; row++) {
            const week = createElement("div", this.contentDiv, "week");
            for (let weekdayInt = 0; weekdayInt < 7; weekdayInt++) {
                const buttonParent = createElement("div", week, "date-parent");
                const button = createElement("button", buttonParent, "date");
                const buttonTextBox = createElement("p", buttonParent, "date-content");
                this.dates.push(button);
                this.datesTextBoxes.push(buttonTextBox);

                let index = this.dates.length - 1;
                button.calendar = this;
                button.index = index;
                button.addEventListener('click', function() {
                    this.calendar.onClickMonthGraphDate(this.index);
                });
            }

            const statusBar = createElement("div", week, "status-bar");
            this.statusBars.push(statusBar);
        }

        this.today();
    }

    async update_implementation() {
        let monthStr = getMonthStrFromDate(this.selectedMonth);
        monthStr += ' ' + this.selectedMonth.getFullYear();
        this.monthLabel.innerText = monthStr;

        this.prepareMonthData();

        this.monthPrice.innerText = toCurrencyString(parseFloat(this.price).toFixed(2));

        const currentDate = new Date();
        let current = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), 1);
        let maxDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);
        let enable = false;
        let done = false;
        for (let i = 0; i < this.dates.length; i++) {
            let button = this.dates[i];
            let buttonTextBox = this.datesTextBoxes[i];
            if (!enable && !done) {
                if (current.getDay() == (i + settings.weekStartsOn) % 7) {
                    enable = true;
                    this.firstDateIndex = i;
                }
            }

            button.id = enable ? 'date' : 'gap';
            if (enable && current.getFullYear() == currentDate.getFullYear() && 
                current.getMonth() == currentDate.getMonth() && 
                current.getDate() == currentDate.getDate()) {
                button.id = 'current-date';
            }
            if (enable) {
                button.inert = false;
                const date = current.getDate();
                button.innerText = date;

                if (this.days.has(date)) {
                    let day = this.days.get(date);
                    buttonTextBox.innerText = day.length;
                }
                else {
                    buttonTextBox.innerText = '';
                }

                if (current.getDate() == maxDate.getDate()) {
                    done = true;
                    enable = false;
                }
                else {
                    current.setDate(current.getDate() + 1);
                }
            }
            else {
                button.innerText = '';
                buttonTextBox.innerText = '';
                button.inert = true;
            }
        }

        const dayLengthInMinutes = 60 * 24;
        const weekLengthInMinutes = dayLengthInMinutes * 7;
        const monthStartDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), 1);

        for(let i = 0; i < this.statusBarSections.length; i++) {
            this.statusBarSections[i].remove();
        }
        this.statusBarSections = new Array();

        for(let i = 0; i < this.tippyInstances.length; i++) {
            this.tippyInstances[i].destroy();
        }
        this.tippyInstances = new Array();
        
        this.accumulatedPercentage = 0.0;
        let lastChange = this.changeBeforeMonth;
        if (this.firstDateIndex > 0) {
            const percentage = (this.firstDateIndex * (100.0 / 7.0));
            this.addStatusBarSection(percentage, 'transparent');
        }

        let monthChanges = new Array();
        monthChanges.push(this.changeBeforeMonth);

        for (let i = 0; i < this.days.size; i++) {
            let day = this.days.get(i + 1);

            for (let j = 0; j < day.length; j++) {
                monthChanges.push(day[j]);
            }
        }

        for (let i = 0; i < monthChanges.length; i++) {
            const change = monthChanges[i];
            if (change == null)
                continue;

            const startDate = change.startTime;
            const lastEndDate = lastChange != null ? lastChange.endTime : null;
            let notWearingDurationBeforeCurrent = (startDate - lastEndDate) / 1000.0 / 60.0;
            if (i == 1 && (lastChange == null || lastEndDate < monthStartDate)) {
                notWearingDurationBeforeCurrent = (startDate - monthStartDate) / 1000.0 / 60.0;
            }
            if (i > 0 && notWearingDurationBeforeCurrent > 0.001) {
                const percentage = (notWearingDurationBeforeCurrent / weekLengthInMinutes) * 100.0;
                this.addStatusBarSection(percentage, notWearingColor, notWearingLabel);
            }

            const category = await getMainCategoryFromChange(change);
            const color = category == null ? "#0000002d" : category.color;
            let changeDurationInMins = ((change.endTime != null ? change.endTime : new Date()) - change.startTime) / 1000.0 / 60.0;
            let percentage = (changeDurationInMins / weekLengthInMinutes) * 100.0;
            if (i == 0) {
                if (lastEndDate < monthStartDate)
                    continue;

                let durationInMins = (change.endTime - monthStartDate) / 1000.0 / 60.0;
                percentage = (durationInMins / weekLengthInMinutes) * 100.0;
            }
            this.addStatusBarSection(percentage, color, change.changeString);
            lastChange = change;
        }

        let monthMaxPercentage = (((maxDate.getDate() + this.firstDateIndex) * dayLengthInMinutes) / weekLengthInMinutes) * 100.0;
        let remainingPercentage = monthMaxPercentage - this.accumulatedPercentage;
        let isViewingCurrentMonth = currentDate.getFullYear() == this.selectedMonth.getFullYear() && currentDate.getMonth() == this.selectedMonth.getMonth();
        if (remainingPercentage > 0.001 && !isViewingCurrentMonth) {
            this.addStatusBarSection(remainingPercentage, notWearingColor, notWearingLabel);
        }
    }

    addStatusBarSection(percentage, color, tooltip = null) {
        let baseAcc = this.accumulatedPercentage % 100;
        let maxPercentage = 100.0 - baseAcc;
        let index = Math.trunc(this.accumulatedPercentage / 100.0);
        let statusBar = this.statusBars[index];

        const dayLengthInMinutes = 60 * 24;
        const weekLengthInMinutes = dayLengthInMinutes * 7;
        const maxDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);
        let done = false;
        
        let currentPercentage = Math.min(percentage, maxPercentage);
        let monthMaxPercentage = (((maxDate.getDate() + this.firstDateIndex) * dayLengthInMinutes) / weekLengthInMinutes) * 100.0;
        if ((this.accumulatedPercentage + currentPercentage) > monthMaxPercentage) {
            currentPercentage = monthMaxPercentage - this.accumulatedPercentage;
            done = true;
        }

        const transparent = color == "transparent";
        const section = createElement("div", statusBar, transparent ? "status-bar-section-dummy" : "status-bar-section");
        section.style.backgroundColor = color;
        section.style.width = currentPercentage + '%';
        this.statusBarSections.push(section);

        if (!transparent && tooltip != null) {
            let tippyInstance = tippy(section, {
                content: tooltip,
                placement: "bottom"
            });
            this.tippyInstances.push(tippyInstance);
        }

        if (!done && percentage > maxPercentage && index < this.statusBars.length - 1) {
            this.accumulatedPercentage = (index + 1) * 100.0;
            this.addStatusBarSection(percentage - currentPercentage, color, tooltip);
        }
        else {
            this.accumulatedPercentage += currentPercentage;
        }
    }

    prev() {
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() - 1);
        this.update();
    }

    today() {
        const currentDate = new Date();
        this.selectedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth());
        this.update();
    }

    next() {
        const currentDate = new Date();
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() + 1);
        if ((this.selectedMonth.getFullYear() == currentDate.getFullYear() && this.selectedMonth.getMonth() > currentDate.getMonth()) ||
            this.selectedMonth.getFullYear() > currentDate.getFullYear()) {
            this.selectedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth());
        }

        this.update();
    }

    onClickMonthGraphDate(index) {

    }

    prepareMonthData() {
        this.days = new Map();
        this.changeBeforeMonth = null;
        this.price = 0;
        if (changeHistory.length == 0)
            return;

        let maxMonthDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);

        const lastChange = changeHistory[changeHistory.length - 1];
        const lastChangeStartDate = new Date(lastChange.startTime);
        if (maxMonthDate > lastChangeStartDate) {
            maxMonthDate = new Date(lastChangeStartDate.getFullYear(), lastChangeStartDate.getMonth(), lastChangeStartDate.getDate());
        }

        for (let i = 1; i <= maxMonthDate.getDate(); i++) {
            this.days.set(i, new Array());
        }

        for (let i = 0; i < changeHistory.length; i++) {
            const change = changeHistory[i];
            if (change.startTime.getFullYear() != this.selectedMonth.getFullYear() || 
                change.startTime.getMonth() != this.selectedMonth.getMonth())
            {
                if (change.startTime < this.selectedMonth)
                    this.changeBeforeMonth = change;

                continue;
            }
            
            let current = change;

            if (current.price != null)
                this.price += parseFloat(current.price);

            const date = change.startTime.getDate();
            this.days.get(date).push(current);
        }
    }
}

class MonthCalendarWidgetSettingsDialog extends WidgetSettingsDialog {
    constructor(widget) {
        super(widget);
    }

    setSettingsDefaults(settings) {

    }

    loadSettings(settings) {

    }

    saveSettings(settings) {

    }
}