const sourcebin = require("sourcebin_js");
async function postToBin(content, title) {
  try {
    const response = await sourcebin.create(
      [
        {
          name: " ",
          content,
          languageId: "text",
        },
      ],
      {
        title,
        description: " ",
      }
    );
    return {
      url: response.url,
      short: response.short,
      raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
    };
  } catch (ex) {
    console.error(`postToBin`, ex);
  }
}

module.exports = {
  postToBin,
};
