export default {
  OWNER: ["851588007697580033", "616511099659091978"],
  CACHE_SIZE: {
    GUILDS: 500,
    USERS: 200000,
    MEMBERS: 200000,
  },
  PREFIX: process.env.NODE_ENV === "production" ? "." : ",",

  /** Channel ID where quest updates are sent which bot will parse and save to be used later */
  QUEST_UPDATE_CHANNEL: {
    CHANNEL_ID: "896941858620600390", // sky-infographics
    GUILD_ID: "710502237717266491", // (QAR Server) This is not used, only included for documenting
  },

  BOT_STATs: { MESSAGE_ID: "1179858980923768893", CHANNEL: "1158068842040414351" },

  BOT_ICON: "https://skyhelper.xyz/assets/img/boticon.png",

  SUPPORTED_LANG: ["en-US", "hi", "ru"],

  // URLS
  DOCS_URL: "https://docs.skyhelper.xyz",

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

    port: process.env.NODE_ENV === "production" ? 5000 : 5001,

    // USERS who can access UpdateTS/Quests/Events page
    ADMINS: ["851588007697580033"],
  },
  Support: "https://discord.com/invite/2rjCRKZsBb",
};
