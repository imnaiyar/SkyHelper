import { EventEmitter } from "node:events";
import { MessageCollector } from "../src/bot/utils/classes/Collector";
import type { SkyHelper } from "../src/bot/structures/Client";
import type { APIChannel, APIMessage, GatewayMessageCreateDispatchData, ToEventProps } from "@discordjs/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("MessageCollector", () => {
  let client: SkyHelper;
  let channel: APIChannel;
  let message: APIMessage;

  beforeEach(() => {
    client = new EventEmitter() as unknown as SkyHelper;
    channel = { id: "123" } as APIChannel;
    message = { id: "456", channel_id: "123" } as APIMessage;
  });

  it("should collect messages that pass the filter", () => {
    const collector = new MessageCollector(client, {
      channel,
      filter: (msg) => msg.id === "456",
    });

    client.emit("MESSAGE_CREATE", { data: message } as ToEventProps<GatewayMessageCreateDispatchData>);
    expect(collector.collected).toContain(message);
  });

  it("should not collect messages that do not pass the filter", () => {
    const collector = new MessageCollector(client, {
      channel,
      filter: (msg) => msg.id === "789",
    });

    client.emit("MESSAGE_CREATE", { data: message } as ToEventProps<GatewayMessageCreateDispatchData>);
    expect(collector.collected).not.toContain(message);
  });

  it("should stop collecting after reaching the max limit", () => {
    const collector = new MessageCollector(client, {
      channel,
      max: 1,
    });

    const stopSpy = vi.spyOn(collector, "stop");

    client.emit("MESSAGE_CREATE", { data: message } as ToEventProps<GatewayMessageCreateDispatchData>);
    expect(stopSpy).toHaveBeenCalledWith("max");
  });

  it("should stop collecting after the timeout", () => {
    vi.useFakeTimers();
    const collector = new MessageCollector(client, {
      channel,
      timeout: 1000,
    });

    const stopSpy = vi.spyOn(collector, "stop");

    vi.advanceTimersByTime(1000);
    expect(stopSpy).toHaveBeenCalledWith("timeout");
    vi.useRealTimers();
  });

  it("should stop collecting after being idle", () => {
    vi.useFakeTimers();
    const collector = new MessageCollector(client, {
      channel,
      idle: 1000,
    });

    const stopSpy = vi.spyOn(collector, "stop");

    client.emit("MESSAGE_CREATE", { data: message } as ToEventProps<GatewayMessageCreateDispatchData>);
    vi.advanceTimersByTime(1000);
    expect(stopSpy).toHaveBeenCalledWith("timeout");
    vi.useRealTimers();
  });

  it("should emit 'collect' event when a message is collected", () => {
    const collector = new MessageCollector(client, {
      channel,
    });

    const collectSpy = vi.fn();
    collector.on("collect", collectSpy);

    client.emit("MESSAGE_CREATE", { data: message } as ToEventProps<GatewayMessageCreateDispatchData>);
    expect(collectSpy).toHaveBeenCalledWith(message);
  });

  it("should emit 'end' event when stopped", () => {
    const collector = new MessageCollector(client, {
      channel,
    });

    const endSpy = vi.fn();
    collector.on("end", endSpy);

    collector.stop("test");
    expect(endSpy).toHaveBeenCalledWith([], "test");
  });
});
