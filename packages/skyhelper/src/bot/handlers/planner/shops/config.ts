import type { DateTime } from "luxon";
import type { ICost, IItem } from "skygame-data";

export interface IRotationItem extends ICost {
  /** Item guid */
  guid: string;
  item?: IItem;
  expectedDate?: DateTime;
}

export interface IRotation extends Array<IRotationItem> {}
export interface INestingConfig {
  permanentItems: IRotation;
  rotations: Array<{ guid: string; items: IRotation }>;
  challengeSpirits: string[];
  legacyFreeItems: string[];
  legacyCorrectionItems: string[];
}
export const nestingconfigs: INestingConfig = {
  challengeSpirits: ["os6ryCdFZ5", "Gp-hW_NCv_", "IhAh5oTvF8"],
  permanentItems: [
    { guid: "pk88jDrFaq", c: 8 },
    { guid: "kjqZOiZkv8", h: 10 },
    { guid: "rtZSEy-6Rz", c: 10 },
    { guid: "t3D6CbSY-E", c: 10 },
    { guid: "pJ_qec46o4", h: 24 },
    { guid: "UhsOYAJONq", c: 23 },
    { guid: "yFLIo5YGNu", ac: 33 },
  ],
  rotations: [
    {
      guid: "RDlP9ysBKl",
      items: [
        { guid: "m1jq0R3vip", ac: 35 },
        { guid: "g0FAk-lWFi", c: 11 },
      ],
    },
    {
      guid: "KHGDNZQYqX",
      items: [
        { guid: "9ZDdv0TG9w", c: 16 },
        { guid: "ch-1pp8DuT", c: 20 },
        { guid: "i1RW5NFFGc", c: 8 },
        { guid: "EQwb6KLMv5", ac: 15 },
      ],
    },
    {
      guid: "h0-5GPP2A2",
      items: [
        { guid: "QLPTcl6MON", c: 60 },
        { guid: "whT_cZQrv5", c: 50 },
        { guid: "raTbmXIzTD", c: 12 },
        { guid: "uOQmeCxRGG", c: 12 },
      ],
    },
    {
      guid: "rovlxVWS72",
      items: [
        { guid: "rMl2rj9Qgv", c: 45 },
        { guid: "9HXJ6pJTXa", c: 10 },
        { guid: "y1UR_gd2PM", c: 18 },
      ],
    },
    {
      guid: "ZQ5lOGMngB",
      items: [
        { guid: "2If2D4W1DF", h: 33 },
        { guid: "wbzLOXS8C_", h: 18 },
        { guid: "2d5HB466-h", h: 12 },
        { guid: "v1NMHHJO7Q", h: 8 },
      ],
    },
    {
      guid: "Db4i3vPwbz",
      items: [
        { guid: "R7mNhWclrv", c: 25 },
        { guid: "AZv6JDJqdb", h: 23 },
        { guid: "dJD-OBSWgc", ac: 8 },
      ],
    },
    {
      guid: "hfP1HluoJS",
      items: [
        { guid: "PABCJmm2HT", c: 20 },
        { guid: "3tQqaibcJk", h: 33 },
        { guid: "-YUvzkL_uS", h: 25 },
        { guid: "RK22qlqiJ5", c: 40 },
      ],
    },
    {
      guid: "Un_YpZoWoE",
      items: [
        { guid: "gbOCxa6g06", c: 25 },
        { guid: "0o0Nvnd4gf", ac: 28 },
        { guid: "8wRmxxKS7h", ac: 16 },
        { guid: "_xcJueC0Rj", c: 50 },
      ],
    },
    {
      guid: "_J7PgLIRyi",
      items: [
        { guid: "dYVs7we_4Q", c: 25 },
        { guid: "x7ZD_lIDh_", c: 10 },
        { guid: "snZQpzP822", c: 40 },
        { guid: "W0x496lay7", h: 18 },
      ],
    },
    {
      guid: "VrSyepmcUa",
      items: [
        { guid: "kjqZOiZkv8", h: 10 },
        { guid: "nZmPXeJKoF", c: 10 },
        { guid: "7pVaQBiTSo", c: 30 },
        { guid: "fjJHoEZUoq", h: 20 },
      ],
    },
    {
      guid: "Z9CHxc5mHB",
      items: [
        { guid: "oa5rIbuWkA", c: 20 },
        { guid: "TaOpfMm1Z1", c: 15 },
        { guid: "_igBIcu6Pg", c: 70 },
      ],
    },
    {
      guid: "hfmk0KrIM7",
      items: [
        { guid: "PRSX9s-tGz", c: 40 },
        { guid: "srZq8IciYN", c: 80 },
      ],
    },
    {
      guid: "AUPuqqCMQ4",
      items: [
        { guid: "-_R3fzw7MF", ac: 25 },
        { guid: "FpXfl3Dpff", h: 45 },
        { guid: "cqPAxA0gAc", c: 90 },
      ],
    },
  ],

  legacyFreeItems: ["_qe1M1aTek"],
  legacyCorrectionItems: ["M-n46rmsiI", "521NL_oVIS"],
};
