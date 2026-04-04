declare namespace SettingTypes {
    interface SettingsData {
        autoRefreshFrequency: number,
        weekStartsOn: number,
        weightUnit: string,
        currency: string,
        currencyIsSuffix: boolean,
        twentyFourHourClock: boolean,
        diaperCategoryConfigs: DiaperCategoryConfig[],
        externalDiaperData: string,
    }

    interface DiaperCategoryConfig {
        name: string,
        categories: DiaperCategory[],
    }

    interface DiaperCategory {
        label: string,
        color: string,
        filter: any
    }
}