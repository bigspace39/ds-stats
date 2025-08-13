class MonthCalendar extends Widget {
    static {
        possibleWidgets.push(new MonthCalendar());
    }

    monthHeader = null;
    monthLabel = null;
    monthPrice = null;
    navigationDiv = null;
    prevButton = null;
    todayButton = null;
    nextButton = null;
    weekdays = null;
    dates = new Array();
    datesTextBoxes = new Array();
    statusBars = new Array();
    selectedMonth;

    create(dashboardElement, classIndex, dashboardId, widgetId = -1) {
        super.create(dashboardElement, classIndex, dashboardId, widgetId);
        
        this.contentDiv.style.display = "flex";
        this.contentDiv.style.flexDirection = "column";

        this.monthHeader = createElement("div", this.contentDiv, "month-header");
        this.monthLabel = createElement("p", this.monthHeader, "month-label");
        this.monthLabel = createElement("p", this.monthHeader, "month-label");
        this.monthLabel.innerText = "January 2025";
        this.monthPrice = createElement("p", this.monthHeader, "month-price");
        this.monthPrice.innerText = "100 kr";
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
            this.today();
        }
    }

    update() {
        let monthStr = this.selectedMonth.toLocaleString(dateLocale, { month: 'long' });
        monthStr += ' ' + this.selectedMonth.getFullYear();
        this.monthLabel.innerText = monthStr;

        if (data.price != null && data.price != '') {
            monthPrice.innerText = toCurrencyString(parseFloat(data.price).toFixed(2));
        }
        else {
            monthPrice.innerText = toCurrencyString(0);
        }

        // TODO: FINISH
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
        // TODO: FINISH
    }
}