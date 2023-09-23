import { Interaction , Events} from "discord.js";
import { MClient } from "../main";


module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction : Interaction) {
    let client = interaction.client as MClient;
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No execute command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
			
		} else if (interaction.isAutocomplete()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No autocomplete command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			}
			catch (error) {
				console.error(`Error autocompleting ${interaction.commandName}`);
				console.error(error);
			}
		}
	},
};
