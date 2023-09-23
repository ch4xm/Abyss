import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import axios, { options } from 'axios';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('Get price information about a stock')
        .addSubcommand(subcommand =>
            subcommand.setName('price')
            .setDescription('Get the current price of a stock')
            .addStringOption(option =>
                option.setName('symbol')
                .setDescription('The stock symbol to search for')
                .setAutocomplete(true)
                .setRequired(true))),

    async autocomplete(interaction: AutocompleteInteraction) {
        let symbol = interaction.options.getString('symbol')!;
        let response = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${process.env.alphavantageApiKey}`);
        let data = response.data;
        let matches = data.bestMatches;
        let options = matches.map((match: any) => {
            return {
                name: match['1. symbol'],
                value: match['1. symbol'],
            }
        });
    },

    async getStockPrice(symbol: string): Promise<string> {
        if (symbol === '') {
            return 'Please enter a valid stock symbol!';
        }

        let response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.alphavantageApiKey}`);
        let data = response.data;
        console.log(response);
        let price: string = data['Global Quote']['05. price'];
        return price;
    },

    async execute(interaction: ChatInputCommandInteraction) {
        let symbol: string = interaction.options.getString('symbol') ?? '';
        let price: string = await this.getStockPrice(symbol);
        await interaction.reply(price);
    },
}