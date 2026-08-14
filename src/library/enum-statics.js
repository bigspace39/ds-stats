export class EnumStatics {
    /**
     * Gets the dispaly names (spaces before capital letters) of all members in the enum.
     * @param {Object} inEnum
     * @returns {string[]}
     */
    static getDisplayNames(inEnum) {
        let names = this.getNames(inEnum);
        let displayNames = new Array();
        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let displayName = name.replace(/([A-Z])|(\d+)/g, (_, letter, number) => 
                letter ? ` ${letter}` : ` ${number}`
            ).trim();
            let finalDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            displayNames.push(finalDisplayName);
        }

        return displayNames;
    }

    /**
     * Gets the names of all members in the enum.
     * @param {Object} inEnum
     * @returns {string[]}
     */
    static getNames(inEnum) {
        let names = Object.getOwnPropertyNames(inEnum);
        return names;
    }

    /**
     * Gets all values of all members in the enum.
     * @param {Object} inEnum
     * @returns {any[]}
     */
    static getValues(inEnum) {
        let names = this.getNames(inEnum);
        let values = new Array();

        for (let i = 0; i < names.length; i++) {
            // @ts-ignore
            values.push(inEnum[names[i]]);
        }

        return values;
    }

    /** 
     * Gets the amount of enum members.
     * @param {Object} inEnum
     */
    static getCount(inEnum) {
        this.getNames(inEnum).length;
    }

    /**
     * Gets the name from the member with the given index.
     * @param {Object} inEnum
     * @param {number} index 
     * @returns {string?}
     */
    static nameFromIndex(inEnum, index) {
        let names = this.getNames(inEnum);
        if (index < 0 || index >= names.length) {
            console.error("Tried to get enum name from index with invalid index");
            return null;
        }

        return names[index];
    }

    /**
     * Gets the value of the member with the given index.
     * @param {Object} inEnum
     * @param {number} index 
     * @returns {any}
     */
    static valueFromIndex(inEnum, index) {
        let values = this.getValues(inEnum);
        if (index < 0 || index >= values.length) {
            console.error("Tried to get enum value from index with invalid index");
            return null;
        }

        return values[index];
    }

    /**
     * Gets the index of the member with the given value.
     * @param {Object} inEnum
     * @param {any} value 
     * @returns {number}
     */
    static indexFromValue(inEnum, value) {
        let values = this.getValues(inEnum);

        for (let i = 0; i < values.length; i++) {
            if (values[i] == value)
                return i;
        }

        return -1;
    }
 
    /**
     * Gets the index of the member with the given name.
     * @param {Object} inEnum
     * @param {string} name 
     * @returns {number}
     */
    static indexFromName(inEnum, name) {
        let names = this.getNames(inEnum);

        for (let i = 0; i < names.length; i++) {
            if (names[i] == name)
                return i;
        }

        return -1;
    }
}