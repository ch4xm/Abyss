import fs from 'fs';
import path from 'path';

import {Client, GatewayIntentBits, Collection, SlashCommandBuilder, ChatInputCommandInteraction, ClientOptions, AutocompleteInteraction} from 'discord.js';

import dotenv from 'dotenv';

dotenv.config()

console.log("[INFO] Bot is starting up...");

interface Command {
  data: SlashCommandBuilder
  execute( interaction: ChatInputCommandInteraction): void
  autocomplete (interaction : AutocompleteInteraction) : void 
}

export class MClient extends Client {
	commands: Collection<string, Command>
	
	constructor(options : ClientOptions) {
		super(options);
		this.commands = new Collection();
	}
}

const client = new MClient({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});


client.commands = new Collection();

const eventsPath : string = path.join(__dirname, 'events');

const eventFiles : string[] = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

console.log("[INFO] Event files finished parsing.");

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

console.log("[INFO] Command files finished parsing.");

client.login(process.env.token);
