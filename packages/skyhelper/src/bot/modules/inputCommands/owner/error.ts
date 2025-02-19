import type { Command } from "@/structures";

export default {
  name: "error",
  description: "Simulate erro in prod for testing",
  ownerOnly: true,
  category: "Owner",
  prefix: { aliases: ["err"] },
  messageRun() {
    throw new Error("I'm a teeny weeny error.");
  },
} satisfies Command;
