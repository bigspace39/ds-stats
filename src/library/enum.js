export class Enum {
    // Assign default indices to each member if value is undefined
    static init() {
        let names = this.getNames();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            // @ts-ignore
            let value = this[name];
            if (value === undefined)
                // @ts-ignore
                this[name] = i;
        }

        Object.freeze(this);
    }

    /**
     * Gets the dispaly names (spaces before capital letters) of all members in the enum.
     * @returns {string[]}
     */
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

    /**
     * Gets the names of all members in the enum.
     * @returns {string[]}
     */
    static getNames() {
        let names = Object.getOwnPropertyNames(this);
        names = names.slice(1, -2);
        return names;
    }

    /**
     * Gets all values of all members in the enum.
     * @returns {any[]}
     */
    static getValues() {
        let names = this.getNames();
        let values = new Array();

        for (let i = 0; i < names.length; i++) {
            // @ts-ignore
            values.push(this[names[i]]);
        }

        return values;
    }

    /** 
     * Gets the amount of enum members.
     */
    static getCount() {
        this.getNames().length;
    }

    /**
     * Gets the name from the member with the given index.
     * @param {number} index 
     * @returns {string?}
     */
    static nameFromIndex(index) {
        let names = Enum.getNames();
        if (index < 0 || index >= names.length) {
            console.error("Tried to get enum name from index with invalid index");
            return null;
        }

        return names[index];
    }

    /**
     * Gets the value of the member with the given index.
     * @param {number} index 
     * @returns {any}
     */
    static valueFromIndex(index) {
        let values = this.getValues();
        if (index < 0 || index >= values.length) {
            console.error("Tried to get enum value from index with invalid index");
            return null;
        }

        return values[index];
    }

    /**
     * Gets the index of the member with the given value.
     * @param {any} value 
     * @returns {number}
     */
    static indexFromValue(value) {
        let values = this.getValues();

        for (let i = 0; i < values.length; i++) {
            if (values[i] == value)
                return i;
        }

        return -1;
    }
 
    /**
     * Gets the index of the member with the given name.
     * @param {string} name 
     * @returns {number}
     */
    static indexFromName(name) {
        let names = this.getNames();

        for (let i = 0; i < names.length; i++) {
            if (names[i] == name)
                return i;
        }

        return -1;
    }
}