import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { InteractionCollector } from "../src/bot/utils/classes/Collector";
import { InteractionType } from "@discordjs/core";
import { EventEmitter } from "node:events";

class MockClient extends EventEmitter {}

describe("InteractionCollector", () => {
  let client: MockClient;

  beforeEach(() => {
    client = new MockClient();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should collect interactions that pass the filter", () => {
    const filter = jest.fn().mockReturnValue(true) as () => boolean;
    const collector = new InteractionCollector(client, { filter });

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });

    expect(collector.collected).toContain(interaction);
    expect(filter).toHaveBeenCalledWith(interaction);
  });

  it("should not collect interactions that do not pass the filter", () => {
    const filter = jest.fn().mockReturnValue(false) as () => boolean;
    const collector = new InteractionCollector(client, { filter });

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });

    expect(collector.collected).not.toContain(interaction);
    expect(filter).toHaveBeenCalledWith(interaction);
  });

  it("should stop collecting after reaching the max limit", () => {
    const collector = new InteractionCollector(client, { max: 1 });

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });

    expect(collector.ended).toBe(true);
  });

  it("should stop collecting after the timeout", () => {
    jest.useFakeTimers();
    const collector = new InteractionCollector(client, { timeout: 1000 });
    expect(collector.ended).toBe(false);

    jest.advanceTimersByTime(1000);

    expect(collector.ended).toBe(true);
  });

  it("should stop collecting after being idle", () => {
    jest.useFakeTimers();
    const collector = new InteractionCollector(client, { idle: 1000 });

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });
    expect(collector.ended).toBe(false);

    jest.advanceTimersByTime(1000);

    expect(collector.ended).toBe(true);
  });

  it("should emit 'collect' event when an interaction is collected", () => {
    const collector = new InteractionCollector(client, {});
    const collectListener = jest.fn();
    collector.on("collect", collectListener);

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });

    expect(collectListener).toHaveBeenCalledWith(interaction);
  });

  it("should emit 'end' event when the collector stops", () => {
    const collector = new InteractionCollector(client, { max: 1 });
    const endListener = jest.fn();
    collector.on("end", endListener);

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });

    expect(endListener).toHaveBeenCalledWith([interaction], "max");
  });

  it("should remove listener when stopped", () => {
    new InteractionCollector(client, { max: 1 });

    const interaction = { type: InteractionType.MessageComponent, data: { component_type: 2 } };
    client.emit("INTERACTION_CREATE", { data: interaction });

    expect(client.listenerCount("INTERACTION_CREATE")).toBe(0);
  });
});
