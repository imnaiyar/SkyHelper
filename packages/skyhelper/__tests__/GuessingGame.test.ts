import type { APITextChannel, APIUser } from "@discordjs/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SkyHelper } from "../src/bot/structures/index";
import { GuessingGame } from "../src/bot/utils/classes/GuessingGame";

describe("GuessingGame", () => {
  let channel: APITextChannel;
  let client: SkyHelper;
  let players: APIUser[];

  beforeEach(() => {
    channel = { id: "test-channel" } as APITextChannel;
    client = {
      api: {
        channels: {
          createMessage: vi.fn(),
        },
      },
      logger: {
        error: vi.fn(),
      },
      awaitMessages: vi.fn().mockResolvedValue([{ content: "A", author: { id: "player1" } }]),
      schemas: {
        getUser: vi.fn().mockResolvedValue({
          save: vi.fn(),
        }),
      },
      gameData: new Map(),
      user: { id: "bot-id" },
      utils: {
        getUserAvatar: vi.fn().mockReturnValue("avatar-url"),
      },
    } as unknown as SkyHelper;
    players = [{ id: "player1", username: "Player 1" } as APIUser, { id: "player2", username: "Player 2" } as APIUser];
  });

  it("should initialize a single player game", () => {
    const game = new GuessingGame(
      channel,
      {
        mode: "single",
        players: [players[0]],
        gameInitiator: players[0],
      },
      client,
    );
    expect(game.players.length).toBe(1);
    expect(game.mode).toBe("single");
    expect(game.playerStats.size).toBe(1);
  });

  it("should initialize a multi player game", () => {
    const game = new GuessingGame(
      channel,
      {
        mode: "multi",
        players,
        gameInitiator: players[0],
      },
      client,
    );
    expect(game.players.length).toBe(2);
    expect(game.mode).toBe("multi");
    expect(game.playerStats.size).toBe(2);
  });

  it("should initialize player stats correctly", () => {
    const game = new GuessingGame(
      channel,
      {
        mode: "single",
        players: [players[0]],
      },
      client,
    );
    const stats = game.playerStats.get(players[0].id);
    expect(stats).toBeDefined();
    expect(stats?.correct).toBe(0);
    expect(stats?.incorrect).toBe(0);
    expect(stats?.score).toBe(0);
  });

  it("should set custom total questions", () => {
    const game = new GuessingGame(
      channel,
      {
        mode: "single",
        players: [players[0]],
        totalQuestions: 10,
      },
      client,
    );
    expect(game["totalQuestions"]).toBe(10);
  });
});
