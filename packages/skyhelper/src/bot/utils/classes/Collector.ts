import type { SkyHelper } from "@/structures/Client";
import type { ComponentInteractionMap, MessageComponentType } from "@/types/interactions";
import {
  type APIChannel,
  type APIMessage,
  type APIModalSubmitInteraction,
  type GatewayInteractionCreateDispatchData,
  type GatewayMessageCreateDispatchData,
  InteractionType,
  type ToEventProps,
} from "@discordjs/core";
import { EventEmitter } from "node:events";

export interface CollectorOptions<Int extends unknown> {
  filter?: (collected: Int) => boolean;
  max?: number;
  timeout?: number;
  idle?: number;
}

declare interface Collector<Int> {
  on(event: "collect", listener: (interaction: Int) => unknown): this;
  on(event: "end", listener: (collected: Int[], reason: string) => unknown): this;
  once(event: "collect", listener: (interaction: Int) => unknown): this;
  once(event: "end", listener: (collected: Int[], reason: string) => unknown): this;
}

abstract class Collector<Int> extends EventEmitter {
  collected: Int[] = [];
  timer: NodeJS.Timeout | undefined;
  filter: (int: Int) => boolean;
  public ended: boolean = false;

  public constructor(
    readonly client: SkyHelper,
    options: CollectorOptions<Int> = {},
  ) {
    super();
    this.filter = options.filter ?? (() => true);
    this.timer = options.timeout
      ? setTimeout(() => this.stop("timeout"), options.timeout)
      : options.idle
        ? setTimeout(() => this.stop("timeout"), options.idle)
        : undefined;
    this.listener = this.listener.bind(this);

    /* client.addListener("INTERACTION_CREATE", this.listener); */
  }

  // this is implemented in the child classes
  listener(_k: any) {
    /* if (int.type !== this.type) return;
    if (
      this.type === InteractionType.MessageComponent &&
      int.type === InteractionType.MessageComponent &&
      this.componentType &&
      int.data.component_type !== this.componentType
    ) {
      return;
    }
    if (this.message && this.message.id !== int.message?.id) return;

    if (this.channel && this.channel.id !== int.channel?.id) return;
    const passesFilter = this.filter(int as Int);
    if (!passesFilter) return;
    this.emit("collect", int);

    this.collected.push(int as Int);
    if (this.options.idle) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.end("timeout"), this.options.idle);
    }

    if (this.options.max && this.collected.length >= this.options.max) this.end("max"); */
  }

  public stop(reason: string) {
    clearTimeout(this.timer);
    this.emit("end", this.collected, reason);
    this.ended = true;
  }
}

export interface InteractionCollectorOptions<
  TComponent extends MessageComponentType,
  TType extends InteractionType.ModalSubmit | InteractionType.MessageComponent = InteractionType.MessageComponent,
> extends CollectorOptions<
    TType extends InteractionType.ModalSubmit ? APIModalSubmitInteraction : ComponentInteractionMap[TComponent]
  > {
  message?: APIMessage;
  channel?: APIChannel;
  componentType?: TComponent;
  interactionType?: TType;
}

export class InteractionCollector<
  TComponent extends MessageComponentType,
  TType extends InteractionType.ModalSubmit | InteractionType.MessageComponent = InteractionType.MessageComponent,
> extends Collector<TType extends InteractionType.ModalSubmit ? APIModalSubmitInteraction : ComponentInteractionMap[TComponent]> {
  public message: APIMessage | null = null;
  public channel: APIChannel | null = null;
  public interactionType: TType = InteractionType.MessageComponent as TType;
  public componentType: TComponent | null = null;
  constructor(
    readonly client: SkyHelper,
    readonly options: InteractionCollectorOptions<TComponent, TType>,
  ) {
    super(client, options);
    if (options.message) this.message = options.message;
    if (options.channel) this.channel = options.channel;
    if (options.componentType) this.componentType = options.componentType;
    if (options.interactionType) this.interactionType = options.interactionType;
    client.addListener("INTERACTION_CREATE", this.listener);
  }
  override listener({ data: int }: ToEventProps<GatewayInteractionCreateDispatchData>) {
    if (int.type !== this.interactionType) return;
    if (
      this.interactionType === InteractionType.MessageComponent &&
      int.type === InteractionType.MessageComponent &&
      this.componentType &&
      int.data.component_type !== this.componentType
    ) {
      return;
    }

    if (this.message && this.message.id !== int.message?.id) return;

    if (this.channel && this.channel.id !== int.channel?.id) return;
    // @ts-expect-error
    const passesFilter = this.filter(int);
    if (!passesFilter) return;
    this.emit("collect", int);

    // @ts-expect-error
    this.collected.push(int as Int);
    if (this.options.idle) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.stop("timeout"), this.options.idle);
    }

    if (this.options.max && this.collected.length >= this.options.max) this.stop("max");
  }
  override stop(reason?: string) {
    this.client.removeListener("INTERACTION_CREATE", this.listener);
    clearTimeout(this.timer);
    this.emit("end", this.collected, reason || "stopped");
    this.ended = true;
  }
}
export interface MessageCollectorOptions extends CollectorOptions<APIMessage> {
  channel?: APIChannel;
}
export class MessageCollector extends Collector<APIMessage> {
  public channel: APIChannel | null = null;
  constructor(
    readonly client: SkyHelper,
    readonly options: MessageCollectorOptions,
  ) {
    super(client, options);
    if (options.channel) this.channel = options.channel;
    client.addListener("MESSAGE_CREATE", this.listener);
  }
  override listener({ data: message }: ToEventProps<GatewayMessageCreateDispatchData>) {
    if (this.channel && this.channel.id !== message.channel_id) return;
    const passesFilter = this.filter(message);
    if (!passesFilter) return;
    this.emit("collect", message);

    this.collected.push(message);
    if (this.options.idle) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.stop("timeout"), this.options.idle);
    }

    if (this.options.max && this.collected.length >= this.options.max) this.stop("max");
  }
  override stop(reason?: string) {
    this.client.removeListener("MESSAGE_CREATE", this.listener);
    clearTimeout(this.timer);
    this.emit("end", this.collected, reason || "stopped");
    this.ended = true;
  }
}
export { Collector };
