import { SkyHelper } from "#structures";

export default async (client: SkyHelper, err: Error): Promise<void> => {
  client.logger.error(`Client Error:`, err);
};
