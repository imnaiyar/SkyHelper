import { type OnModuleInit, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Client } from "discord.js";
import { getUserID, type UserSession } from "../utils/discord.js";
import { Logger } from "@nestjs/common";
import { SkyHelper } from "#structures";
async function initClient(client: Client) {
  client.on("ready", () => {
    if (client.user != null) {
      Logger.log(`Logged in as ${client.user.tag}!`, "DASHBOARD");
    }
  });

  await client.login(process.env.TOKEN);
}

@Injectable()
export class BotService extends SkyHelper implements OnModuleInit {
  constructor() {
    super();
  }

  onModuleInit() {
    return initClient(this);
  }

  public async checkPermissions(user: UserSession, guildID: string) {
    const guild = this.guilds.cache.get(guildID);
    if (guild == null) throw new HttpException("Guild Not found", HttpStatus.NOT_FOUND);

    const userID = await getUserID(user.access_token);
    const member = await guild?.members.fetch(userID);

    if (!member?.permissions.has("Administrator") && guild.ownerId !== member.id) {
      throw new HttpException("Missing permissions", HttpStatus.BAD_REQUEST);
    }
  }
}
