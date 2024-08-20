import type { Event } from "#structures";

const errorHandler: Event<"error"> = async (client, err): Promise<void> => {
  client.logger.error(`Client Error:`, err);
};

export default errorHandler;
