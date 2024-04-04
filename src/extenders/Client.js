import {
  Client,
  ClientUser,
  DataResolver,
  Routes,
  DiscordjsTypeError,
  DiscordjsErrorCodes,
} from 'discord.js';

Client.prototype.codeBlock = function (content, language = "js") {
  return `\`\`\`${language}\n${content}\`\`\``;
};

ClientUser.prototype.setBanner = async function (image) {
  if (!image) throw new TypeError("Parameter image must be provided");
  if (typeof image !== "string") throw new DiscordjsTypeError(DiscordjsErrorCodes.InvalidType, "image", "string");
  try {
    await this.client.rest.patch(Routes.user(), {
      body: {
        banner: await DataResolver.resolveImage(image),
      },
    });

    return await this.fetch({ force: true });
  } catch (err) {
    throw new Error(err);
  }
};
