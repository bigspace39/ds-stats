class MonthCalendar extends Widget {
    static {
        possibleWidgets.push(new MonthCalendar());
    }

    monthHeader = null;
    monthLabel = null;
    navigationDiv = null;
    prevButton = null;
    todayButton = null;
    nextButton = null;
    weekdays = null;
    dates = new Array();
    datesTextBoxes = new Array();
    statusBars = new Array();

    create(dashboardElement, classIndex, dashboardId, widgetId = -1) {
        super.create(dashboardElement, classIndex, dashboardId, widgetId);
        
        this.contentDiv.style.display = "flex";
        this.contentDiv.style.flexDirection = "column";

        this.monthHeader = createElement("div", this.contentDiv, "month-header");
        this.monthLabel = createElement("p", this.monthHeader, "month-label");
        this.monthLabel.innerText = "January 2025";
        this.navigationDiv = createElement("div", this.monthHeader, "month-navigation");

        this.prevButton = createElement("button", this.navigationDiv, "month-navigation-button");
        this.prevButton.innerText = "<";
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
        this.nextButton.calendar = this;
        this.nextButton.addEventListener("click", function() {
            this.calendar.next();
        });

        this.weekdays = createElement("div", this.contentDiv, "weekdays");

        for (let weekdayInt = 0; weekdayInt < 7; weekdayInt++) {
            let weekdayDate = new Date(2025, 0, 5 + weekdayInt + firstDayOfTheWeek);
            const weekday = weekdayDate.toLocaleString(dateLocale, { weekday: 'long' });

            const button = createElement("button", weekdays, "weekday");
            button.innerText = weekday;
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
    }

    prev() {

    }

    today() {

    }

    next() {

    }

    onClickMonthGraphDate(index) {

    }
}