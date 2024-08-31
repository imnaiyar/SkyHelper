interface ExpressionLevel {
  title: string;
  description?: string;
  image: string;
}

type CollectibleTypes =
  | "Cape"
  | "Mask"
  | "Instrument"
  | "Instruments"
  | "Prop"
  | "Props"
  | "Face Accessory"
  | "Hair"
  | "Shoes"
  | "Hair Accessory"
  | "Music Sheet"
  | "Outfit"
  | "Neck Accessory";
interface Collectible {
  /** Name of the collectible */
  name: string;

  /** Type of this collectible */
  type?: CosmeticTypes;

  /** Emoji icon of the collectible */
  icon: string;

  /** Link to the collectible images (preview) */
  images: {
    /** Description of the image (to display on the embed) */
    description: string;

    /** The image's link */
    image: string;
  }[];

  /** Cosmetic Cost (absent for items that are unlocked via season pass and the spirit has yet to return as a TS)*/
  price?: string;

  /** If this was season pass exclusive */
  isSP?: boolean;

  /** Seasonal price, if any */
  spPrice?: string;

  /** Any extra notes about this collectible */
  notes?: string[];

  /**
   * Whether to skip including in the friendship tree calculations
   *  ! NOTE: This is for the future in case I decide to incorporate progress tracking
   */
  skipTree?: boolean;
}

type ExpressionType = "Emote" | "Stance" | "Call" | "Friend Action";
interface BaseSpiritData {
  /** Name of the spirit */
  name: string;
  /** Spirits preview image link */
  image?: string;

  /** Any extra title to add (To be displayed on the embed) */
  extra?: string;

  /** Type of the spirit (seasonal, or regular) */
  type: string;

  /** The realm where the spirit can be found, if any */
  realm?: string;

  /** Icon that represents the spirit (only applied if the spirit doesn't have an expression) */
  icon?: string;

  /** Expression of the spirit, if any */
  expression?: {
    /** Type of expression */
    type: ExpressionType;

    /** Icon of the expression */
    icon: string;

    /** Expression levels */
    level: ExpressionLevel[];
  };

  /** Collectibles offered by this spirit */
  collectibles?: Collectible[];
}

export interface SeasonalSpiritData extends BaseSpiritData {
  type: "Seasonal Spirit";
  season: string;
  current?: boolean;
  ts: {
    eligible: boolean;
    returned: boolean;
    total?: string;

    /**
     * Should usually be a string in the array indicating their visit dates (end date is then calculated by adding 3 days to it).
     * It should be array for Special visits with 1st element as their visit date and 2nd their departure.
     * If an array, only the first element should contain the Special Visit tag (SV#1) as 2nd element is not parsed
     */
    dates: (string[] | string)[];
  };
  tree?: {
    by: string;
    total: string;
    image: string;
  };
  location?: {
    by: string;
    description?: string;
    image: string;
  };
}

export interface RegularSpiritData extends BaseSpiritData {
  type: "Regular Spirit";
  main: {
    description: string;
    total?: string;
    image: string;
  };
}
export type SpiritsData = SeasonalSpiritData | RegularSpiritData;
