export default {
  OWNER: ["851588007697580033", "617989475078897675", "616511099659091978"],
  CACHE_SIZE: {
    GUILDS: 500,
    USERS: 200000,
    MEMBERS: 200000,
  },
  PREFIX: "sh!",

  /** Channel ID where quest updates are sent which bot will parse and save to be used later */
  QUEST_UPDATE_CHANNEL: {
    CHANNEL_ID: "896941858620600390", // sky-infographics
    GUILD_ID: "710502237717266491", // (QAR Server) This is not used, only included for documenting
  },

  BOT_ICON: "https://skyhelper.xyz/assets/img/boticon.png",

  SUPPORTED_LANG: ["en-US", "hi", "ru"],

  //  WEB_URL: 'http://localhost:5001',
  WEB_URL: "https://skyhelper.xyz",
  CDN_URL: "https://cdn.imnaiyar.site",

  DASHBOARD: {
    enabled: true,
    /* The URL of the dashboard */
    URL: "https://dash.skyhelper.xyz",

    /** Web URL requesting to the API*/
    WEB_URL: [
      "http://localhost:3000",
      "https://dash.skyhelper.xyz",
      "https://skyhelper.xyz",
      "https://dashboard.skyhelper.xyz",
      "https://preview.skyhelper.xyz",
    ],

    port: process.env.NODE_ENV === "production" ? 5001 : 50001,

    // USERS who can access UpdateTS/Quests/Events page
    ADMINS: ["851588007697580033"],
  },
  Support: "https://discord.com/invite/2rjCRKZsBb",
};
