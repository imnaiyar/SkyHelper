import { setTimeout as wait } from "timers/promises";
import { emojis } from "@skyhelperbot/constants";
import { getSkyGamePlannerData } from "@skyhelperbot/constants/skygame-planner";
import type { PlannerAssetData } from "@skyhelperbot/constants/skygame-planner";
import {
  AllowedMentionsTypes,
  ComponentType,
  MessageFlags,
  type APITextChannel,
  type APIUser,
  type RESTPostAPIChannelMessageJSONBody,
} from "@discordjs/core";
import type { SkyHelper } from "@/structures";
import { updateUserGameStats } from "../utils.js";
import { InteractionCollector } from "./Collector.js";
import { container, section, separator, textDisplay } from "@skyhelperbot/utils";
import { CustomId, store } from "../customId-store.js";
import { DateTime } from "luxon";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    random(): this[number];
  }
}

// prettier-ignore
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

export enum QuestionType {
  ItemToSeason = "ItemToSeason",
  ItemToSpirit = "ItemToSpirit",
  SeasonStartDate = "SeasonStartDate",
  SpiritTSStatus = "SpiritTSStatus",
  SpiritRSStatus = "SpiritRSStatus",
  EventItem = "EventItem",
}

export interface Question {
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options: string[];
  imageUrl?: string;
  hint?: string;
}

/** Guessing game manager */
export class GuessingGame {
  /** Winner of this guessing game */
  public winner: null | APIUser = null;

  /** Mode of this game */
  public mode: "single" | "multi" = "single";

  /** Players participating in this game */
  public players: APIUser[];

  /** Player stats for the game */
  public playerStats = new Map<string, { correct: number; incorrect: number; score: number }>();

  /** Original initiator of the game */
  public initiator: APIUser | null = null;

  /** Whether this game is stopped or not */
  private _stopped = false;

  /** Collector listening for stop */
  private _stopCollector: InteractionCollector<ComponentType.Button> | null = null;

  /** Current question index */
  private currentQuestionIndex = 0;

  /** Total questions in this game */
  private totalQuestions = 5;

  /** Questions for this game */
  private questions: Question[] = [];

  /** Planner data */
  private plannerData: PlannerAssetData | null = null;

  /** Time limit per question in milliseconds */
  private readonly timeLimit = 30000;

  constructor(
    private readonly channel: APITextChannel,
    option: {
      mode: "single" | "multi";
      players: APIUser[];
      gameInitiator?: APIUser;
      totalQuestions?: number;
    },
    readonly client: SkyHelper,
  ) {
    this.mode = option.mode;
    this.players = option.players;
    this.totalQuestions = option.totalQuestions ?? 5;

    for (const player of this.players) {
      this.playerStats.set(player.id, { correct: 0, incorrect: 0, score: 0 });
    }

    if (option.gameInitiator) this.initiator = option.gameInitiator;
  }

  public async initialize() {
    // Load planner data
    this.plannerData = await getSkyGamePlannerData();

    // Generate questions
    this.questions = this.generateQuestions(this.totalQuestions);

    // Send game start message
    await this._sendResponse(
      `🎮 **Sky Guessing Game** 🎮\n\nWelcome! This game will have **${this.totalQuestions}** questions about Sky: Children of the Light.\nYou'll have **30 seconds** to answer each question.\n\nGet ready! The game will start in 3 seconds...`,
    );
    await wait(3000);

    this._collectResponse().catch(this.client.logger.error);
    this._listenForStop();
  }

  private generateQuestions(count: number): Question[] {
    const questions: Question[] = [];
    const questionTypes = Object.values(QuestionType);

    for (let i = 0; i < count; i++) {
      const type = questionTypes.random();
      const question = this.generateQuestion(type);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  private generateQuestion(type: QuestionType): Question | null {
    if (!this.plannerData) return null;

    switch (type) {
      case QuestionType.ItemToSeason:
        return this.generateItemToSeasonQuestion();
      case QuestionType.ItemToSpirit:
        return this.generateItemToSpiritQuestion();
      case QuestionType.SeasonStartDate:
        return this.generateSeasonStartDateQuestion();
      case QuestionType.SpiritTSStatus:
        return this.generateSpiritTSStatusQuestion();
      case QuestionType.SpiritRSStatus:
        return this.generateSpiritRSStatusQuestion();
      case QuestionType.EventItem:
        return this.generateEventItemQuestion();
      default:
        return null;
    }
  }

  private generateItemToSeasonQuestion(): Question | null {
    if (!this.plannerData) return null;

    // Get items that have a season reference
    const seasonItems = this.plannerData.items.filter((item) => item.season?.name);
    if (seasonItems.length === 0) return null;

    const item = seasonItems.random();
    const correctSeason = item.season!.name;

    // Get other seasons as wrong options
    const otherSeasons = this.plannerData.seasons
      .filter((s) => s.name !== correctSeason)
      .map((s) => s.name)
      .slice(0, 3);

    const options = this.shuffleArray([correctSeason, ...otherSeasons]);

    return {
      type: QuestionType.ItemToSeason,
      question: `Which season brought this item: **${item.name}**?`,
      correctAnswer: correctSeason,
      options,
      imageUrl: item.icon,
      hint: item.type,
    };
  }

  private generateItemToSpiritQuestion(): Question | null {
    if (!this.plannerData) return null;

    // Get items that have a spirit reference through nodes
    const itemsWithSpirits = this.plannerData.items.filter(
      (item) => item.nodes && item.nodes.length > 0 && item.nodes[0]?.root?.spiritTree?.spirit?.name,
    );

    if (itemsWithSpirits.length === 0) return null;

    const item = itemsWithSpirits.random();
    const correctSpirit = item.nodes![0]!.root!.spiritTree!.spirit!.name;

    // Get other spirits as wrong options
    const otherSpirits = this.plannerData.spirits
      .filter((s) => s.name !== correctSpirit)
      .map((s) => s.name)
      .slice(0, 3);

    const options = this.shuffleArray([correctSpirit, ...otherSpirits]);

    return {
      type: QuestionType.ItemToSpirit,
      question: `Which spirit offers this item: **${item.name}**?`,
      correctAnswer: correctSpirit,
      options,
      imageUrl: item.icon,
      hint: item.type,
    };
  }

  private generateSeasonStartDateQuestion(): Question | null {
    if (!this.plannerData) return null;

    const seasonsWithDates = this.plannerData.seasons.filter((s) => s.date);
    if (seasonsWithDates.length === 0) return null;

    const season = seasonsWithDates.random();
    const startDate = DateTime.fromISO(season.date!);
    const correctAnswer = startDate.toFormat("MMMM yyyy");

    // Generate wrong dates (nearby months/years)
    const wrongDates = [
      startDate.minus({ months: 1 }).toFormat("MMMM yyyy"),
      startDate.plus({ months: 1 }).toFormat("MMMM yyyy"),
      startDate.minus({ months: 3 }).toFormat("MMMM yyyy"),
    ];

    const options = this.shuffleArray([correctAnswer, ...wrongDates]);

    return {
      type: QuestionType.SeasonStartDate,
      question: `When did the **${season.name}** begin?`,
      correctAnswer,
      options,
      hint: season.shortName,
    };
  }

  private generateSpiritTSStatusQuestion(): Question | null {
    if (!this.plannerData) return null;

    // Get seasonal spirits
    const seasonalSpirits = this.plannerData.spirits.filter((s) => s.season);
    if (seasonalSpirits.length === 0) return null;

    const spirit = seasonalSpirits.random();
    const hasReturnedAsTS = spirit.ts && spirit.ts.length > 0;
    const correctAnswer = hasReturnedAsTS ? "Yes" : "No";

    return {
      type: QuestionType.SpiritTSStatus,
      question: `Has **${spirit.name}** ever returned as a Traveling Spirit?`,
      correctAnswer,
      options: ["Yes", "No"],
      imageUrl: spirit.imageUrl,
      hint: spirit.season?.name,
    };
  }

  private generateSpiritRSStatusQuestion(): Question | null {
    if (!this.plannerData) return null;

    // Get seasonal spirits
    const seasonalSpirits = this.plannerData.spirits.filter((s) => s.season);
    if (seasonalSpirits.length === 0) return null;

    const spirit = seasonalSpirits.random();
    const hasReturnedAsRS = this.plannerData.returningSpirits.some((rs) =>
      rs.spirits?.some((rsSpirit) => rsSpirit.spirit.guid === spirit.guid),
    );
    const correctAnswer = hasReturnedAsRS ? "Yes" : "No";

    return {
      type: QuestionType.SpiritRSStatus,
      question: `Has **${spirit.name}** ever returned as part of a Returning/Seasonal Spirit event?`,
      correctAnswer,
      options: ["Yes", "No"],
      imageUrl: spirit.imageUrl,
      hint: spirit.season?.name,
    };
  }

  private generateEventItemQuestion(): Question | null {
    if (!this.plannerData) return null;

    // Get items from events
    const eventItems = this.plannerData.items.filter(
      (item) => item.nodes && item.nodes.length > 0 && item.nodes[0]?.root?.spiritTree?.eventInstanceSpirit?.eventInstance?.name,
    );

    if (eventItems.length === 0) return null;

    const item = eventItems.random();
    const correctEvent = item.nodes![0]!.root!.spiritTree!.eventInstanceSpirit!.eventInstance!.name!;

    // Get other events as wrong options
    const otherEvents = this.plannerData.events
      .filter((e) => e.name !== correctEvent)
      .map((e) => e.name)
      .slice(0, 3);

    const options = this.shuffleArray([correctEvent, ...otherEvents]);

    return {
      type: QuestionType.EventItem,
      question: `Which event brought this item: **${item.name}**?`,
      correctAnswer: correctEvent,
      options,
      imageUrl: item.icon,
      hint: item.type,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  }

  private async _collectResponse(): Promise<any> {
    if (this._stopped) return;
    if (this.currentQuestionIndex >= this.questions.length) {
      return this._endGame();
    }

    const question = this.questions[this.currentQuestionIndex]!;
    await this._sendResponse(this._getQuestionMessage(question));

    const res = await this._getCollectorResponse();
    if (this._stopped) return;

    if (res === "Timeout") {
      await this._sendResponse(
        `⏱️ Time's up! The correct answer was: **${question.correctAnswer}**\n\n-# Moving to next question...`,
      );
      await wait(2000);
      this.currentQuestionIndex++;
      return this._collectResponse();
    }

    const isCorrect = res.content.toLowerCase() === question.correctAnswer.toLowerCase();
    const player = this.playerStats.get(res.author.id);
    if (player) {
      if (isCorrect) {
        player.correct++;
        player.score += 10;
      } else {
        player.incorrect++;
      }
    }

    if (isCorrect) {
      await this._sendResponse(`✅ Correct! <@${res.author.id}> got it right!\n\n-# Moving to next question...`);
    } else {
      await this._sendResponse(
        `❌ Incorrect! <@${res.author.id}> guessed "${res.content}". The correct answer was: **${question.correctAnswer}**\n\n-# Moving to next question...`,
      );
    }

    await wait(2000);
    this.currentQuestionIndex++;
    return this._collectResponse();
  }

  private _getQuestionMessage(question: Question): RESTPostAPIChannelMessageJSONBody {
    const embed = {
      title: `Question ${this.currentQuestionIndex + 1}/${this.totalQuestions}`,
      description: question.question,
      color: 0x00aff4,
      fields: question.options.map((opt, idx) => ({
        name: `${String.fromCharCode(65 + idx)}) ${opt}`,
        value: "\u200b",
        inline: true,
      })),
      footer: {
        text: `Type your answer (A, B, C, or D) • ${this.timeLimit / 1000}s to answer`,
      },
    };

    if (question.imageUrl) {
      embed.image = { url: question.imageUrl };
    }

    if (question.hint) {
      embed.footer.text += ` • Hint: ${question.hint}`;
    }

    return {
      embeds: [embed],
    };
  }

  private async _getCollectorResponse() {
    const res = await this.client
      .awaitMessages({
        channel: this.channel,
        timeout: this.timeLimit,
        filter: (m) => {
          const isPlayer = this.players.some((p) => p.id === m.author.id);
          if (!isPlayer) return false;

          const content = m.content.toLowerCase().trim();
          const currentQuestion = this.questions[this.currentQuestionIndex]!;

          // Check if it's a letter answer (A, B, C, D)
          if (content.length === 1 && /[a-d]/.test(content)) {
            const index = content.charCodeAt(0) - 97;
            m.content = currentQuestion.options[index] ?? "";
            return true;
          }

          // Check if it's a direct answer
          return currentQuestion.options.some((opt) => opt.toLowerCase() === content);
        },
        max: 1,
      })
      .catch(() => null);

    if (!res || res.length === 0) return "Timeout";
    return res[0];
  }

  private async _sendResponse(payload: RESTPostAPIChannelMessageJSONBody | string): Promise<any> {
    const createPayload = typeof payload === "string" ? { content: payload } : payload;
    return await this.client.api.channels.createMessage(this.channel.id, {
      ...createPayload,
      allowed_mentions: {
        parse: [AllowedMentionsTypes.User],
      },
    });
  }

  private _listenForStop(): void {
    if (!this.initiator) return;
    this._stopCollector = new InteractionCollector(this.client, {
      componentType: 2,
      filter: (i) => store.deserialize(i.data.custom_id).id === CustomId.SkyGameEndGame,
      channel: this.channel,
    });
    const initiator = this.initiator;
    this._stopCollector.on("collect", async (i) => {
      if ((i.member?.user ?? i.user!).id !== initiator.id) {
        await this.client.api.interactions.reply(i.id, i.token, {
          content: "Only this game's initiator can end the game.",
          flags: 64,
        });
        return;
      }
      this._stopped = true;

      await this.client.api.interactions.reply(i.id, i.token, {
        content: "The game was stopped by the game initiator!",
      });

      if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

      return this._endGame("stopped-game");
    });
  }

  private async _endGame(reason?: string): Promise<void> {
    this.client.gameData.delete(this.channel.id);
    if (this._stopCollector && !this._stopCollector.ended) this._stopCollector.stop();

    if (reason === "stopped-game") {
      return;
    }

    // Calculate winner
    let maxScore = 0;
    let winner: APIUser | null = null;
    for (const player of this.players) {
      const stats = this.playerStats.get(player.id)!;
      if (stats.score > maxScore) {
        maxScore = stats.score;
        winner = player;
      }
    }

    // Create results message
    const resultsEmbed = {
      title: "🎮 Game Over! 🎮",
      description: `**Results**\n\n${this.players
        .map((p) => {
          const stats = this.playerStats.get(p.id)!;
          return `<@${p.id}>: ${stats.correct}/${this.totalQuestions} correct (${stats.score} points)`;
        })
        .join("\n")}`,
      color: 0x00ff00,
      footer: {
        text: winner ? `Winner: ${winner.username}` : "No winner",
      },
    };

    await this._sendResponse({ embeds: [resultsEmbed] });

    // Update player stats
    for (const player of this.players) {
      const stats = this.playerStats.get(player.id)!;
      const isWinner = winner?.id === player.id;
      await updateUserGameStats(player, "guessing", this.mode === "single" ? "singleMode" : "doubleMode", isWinner);
    }
  }
}
