declare namespace APITypes {
    interface Change {
        id: number,
        startTime: Date,
        endTime: Date | null,
        tags: string[],
        note: string | null,
        state: string | null,
        wetness: number | null,
        messyLevel: number | null,
        leak: boolean | null,
        messyOverflow: boolean | null,
        changePeriod: string | null,
        diapers: [
            {
                order: number,
                typeId: number,
                variantId: string | null,
                size: string,
                price: number | null,
                name: string
            }
        ],
        price: number,
        changeString: string
    }

    interface Accident {
        id: string,
        type: string,
        precisionTime: string,
        linkedChangeId: number | null,
        level: number | null,
        causeLeak: boolean | null,
        when: Date | null,
        cause: string | null,
        location: string | null,
        position: string | null
    }

    interface Type {
        id: number,
        name: string,
        brand_code: string | null,
        brand: {
            name: string
        },
        discontinued: boolean,
        discontinuedDate: string | null,
        releaseDate: string | null,
        usage: string,
        category: string,
        target: string[],
        fasteners: string[],
        tabsPerSide: number | null,
        backingMaterial: string | null,
        landingZone: boolean | null,
        wetnessIndicator: boolean | null,
        createdAt: string,
        updatedAt: string | null,
        primaryImage: {
            url: string,
            representation: string | null
        },
        variants: [{
            id: string,
            name: string,
            primaryImage: {
                url: string,
                representation: string | null
            }
        }],
        sizes: [
            {
                size: string
            }
        ],
        alternativeNames: []
    }

    interface Brand {
        code: string,
        name: string,
        image: string | null
    }

    interface AuthToken {
        access_token: string,
        refresh_token: string,
        access_expires_at: number,
        username: string
    }
}