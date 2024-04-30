export interface SeasonPrices {
    [key: string]: {
        item: string;
        icon: string;
        price: number;
        pass?: boolean;
    }[];
}
/**
 * Spirit prices of the current season (For calculator)
 */
export const SeasonPrices: SeasonPrices = {
    "Nesting Nook": [
        { item: "Shelf", icon: "", price: 16 },
        { item: "Blessings Node", icon: "", price: 20 },
        { item: "Spice Rack", icon: "", price: 26 },
        { item: "Blessings Node", icon: "", price: 30 },
        { item: "Heart", icon: "", price: 3, pass: true }
    ],
    "Nesting Atrium": [
        { item: "Floor Light", icon: "", price: 16 },
        { item: "Blessings Node", icon: "", price: 20 },
        { item: "Nesting Atrium Hair", icon: "", price: 24 },
        { item: "Blessings Node", icon: "", price: 28 },
        { item: "Heart", icon: "", price: 3, pass: true }
    ],
    "Nesting Loft": [
        { item: "Blessings Node", icon: "", price: 12 },
        { item: "Chair", icon: "", price: 20 },
        { item: "Blessing Nodes", icon: "", price: 28 },
        { item: "Paintings", icon: "", price: 36 },
        { item: "Heart", icon: "", price: 3, pass: true }
    ],
    "Nesting Solarium": [
        { item: "Blessings Node", icon: "", price: 14 },
        { item: "Hanging Planter", icon: "", price: 22 },
        { item: "Blessings Node", icon: "", price: 30 },
        { item: "Table", icon: "", price: 34 },
        { item: "Heart", icon: " ", price: 3, pass: true }
    ]
} as const;

export const SeasonData = {
    name: "Season of Nesting",
    start: "15-04-2024",
    end: "30-06-2024",
    duration: 77
} as const;
