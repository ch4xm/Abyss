// Run this to sync all the commands in the commands folder with the specified discord server
// Seperate file cause we don't need to sync commands every time bot starts up
// Credits to discord.js docs

import { REST, RESTPutAPIApplicationCommandsResult, Routes } from 'discord.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10'

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';


dotenv.config();

let commands : any[] = [];
// Grab all the command files from the commands directory you created earlier
let foldersPath : string = path.join(__dirname, 'commands');
let commandFolders : string[] = fs.readdirSync(foldersPath);


// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles : string[] = fs.readdirSync(commandsPath).filter((file:string) => file.endsWith('.js') || file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath : string = path.join(commandsPath, file);
		const command = require(filePath);
		commands.push(command.data.toJSON());
	}
}

// Construct and prepare an instance of the REST module
let rest = new REST({ version: '10' }).setToken(process.env.token!);

rest.on("restDebug", console.log);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		commands.forEach(command => {
			command.integration_types = [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
            command.contexts = [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]
		})
		
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.clientId!),
			{ body: commands },
		) as RESTPutAPIApplicationCommandsResult;

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
