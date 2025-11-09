export class Enum {
    // Assign default indices to each member if value is undefined
    static init() {
        let names = this.getNames();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let value = this[name];
            if (value === undefined)
                this[name] = i;
        }

        Object.freeze(this);
    }

    static getDisplayNames() {
        let names = this.getNames();
        let displayNames = new Array();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let displayName = name.replace(/([A-Z])/g, " $1");
            let finalDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            displayNames.push(finalDisplayName);
        }

        return displayNames;
    }

    static getNames() {
        let names = Object.getOwnPropertyNames(this);
        names = names.slice(1, -2);
        return names;
    }

    static getValues() {
        let names = this.getNames();
        let values = new Array();

        for (let i = 0; i < names.length; i++) {
            values.push(this[names[i]]);
        }

        return values;
    }

    static getCount() {
        this.getNames().length;
    }

    static nameFromIndex(index) {
        let names = Enum.getNames();
        if (index < 0 || index >= names.length) {
            console.error("Tried to get enum name from index with invalid index");
            return;
        }

        return names[index];
    }

    static valueFromIndex(index) {
        let values = this.getValues();
        if (index < 0 || index >= values.length) {
            console.error("Tried to get enum value from index with invalid index");
            return;
        }

        return values[index];
    }

    static indexFromValue(value) {
        let values = this.getValues();

        for (let i = 0; i < values.length; i++) {
            if (values[i] == value)
                return i;
        }

        return -1;
    }

    static indexFromName(name) {
        let names = this.getNames();

        for (let i = 0; i < names.length; i++) {
            if (names[i] == name)
                return i;
        }

        return -1;
    }
}