import { z } from "zod/v4";
import { Category } from "./Category.js";

const PrefixSubcommandSchema = z.object({
  trigger: z.string(),
  description: z.string(),
});

const MessageValidationSchema = z.object({
  type: z.literal("message"),
  callback: z.any(),
});

const InteractionValidationSchema = z.object({
  type: z.literal("interaction"),
  callback: z.any(), // z.function in v4 doesnt return a schema and it's a pain to convert it to one, so 'any' it is
});

const ValidationSchema = z.union([MessageValidationSchema, InteractionValidationSchema]);

const CommandBaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  prefix: z
    .object({
      minimumArgs: z.number().optional(),
      usage: z.string().optional(),
      subcommands: z.array(PrefixSubcommandSchema).optional(),
      flags: z.array(z.string()).optional(),
      guildOnly: z.boolean().optional(),
      aliases: z.array(z.string()).optional(),
    })
    .optional(),
  data: z.any().optional(), // pure data is bit complex lol
  category: z.union(Category.map((cat) => z.literal(cat.name))),
  userPermissions: z.union([z.bigint(), z.array(z.bigint()), z.string(), z.array(z.string())]).optional(),
  botPermissions: z.union([z.bigint(), z.array(z.bigint()), z.string(), z.array(z.string())]).optional(),
  forSubs: z.array(z.string()).optional(),
  ownerOnly: z.boolean().optional(),
  skipDeploy: z.boolean().optional(),
  validations: z.array(ValidationSchema).optional(),
  cooldown: z.number().optional(),
});

const CommandPredicate = z.union([
  CommandBaseSchema.extend({
    autocomplete: z.any().optional(),
    interactionRun: z.any(),
    messageRun: z.any().optional(),
  }),
  CommandBaseSchema.extend({
    interactionRun: z.any(),
    messageRun: z.never().optional(),
  }),
  CommandBaseSchema.extend({
    messageRun: z.any(),
    interactionRun: z.never().optional(),
  }),
]);

export { CommandPredicate };
