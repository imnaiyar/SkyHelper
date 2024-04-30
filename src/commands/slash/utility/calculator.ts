import { ApplicationCommandOptionType } from "discord.js";
import {
    SeasonPrices as prices,
    SeasonData as data
} from "#libs/constants/index";
import { SlashCommand } from "#structures";
import moment from "moment-timezone";
export default {
    data: {
        name: "calculator",
        description: "calculate currencies",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                name: "type",
                description: "currency type",
                required: true,
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "Seasonal Currency",
                        value: "seasonal"
                    },
                    {
                        name: "Ascende Candles",
                        value: "ac"
                    }
                ]
            }
        ]
    },
    cooldown: 10,
    category: "Utility",
    async execute(interaction, client) {
        // const type = interaction.options.getString("type");
        const hasPass = interaction.options.getBoolean("pass")!;
        const doneDailies = interaction.options.getBoolean("dailies")!;
        const currentCandles = interaction.options.getInteger("candles")! + (doneDailies ? (hasPass ? 6 : 5) : 0);
        const totalCandles = Object.keys(prices)
            .map(k => {
                const spirit = prices[k];
                return spirit.reduce((acc, value) => acc + value.price, 0);
            })
            .reduce((acc, num) => acc + num, 0);
        const start = moment
            .tz(data.start, "DD-MM-YYYY", client.timezone)
            .startOf("day");
        const end = moment
            .tz(data.end, "DD-MM-YYYY", client.timezone)
            .endOf("day");
        const duration = data.duration;
        const now = moment().tz(client.timezone);
        
        interaction.reply(totalCandles.toString());
    }
} satisfies SlashCommand;
