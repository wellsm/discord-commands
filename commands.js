const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

require('dotenv/config');

const COMMANDS = [
    new SlashCommandBuilder()
        .setName('start')
        .setDescription('esse é brabo. inicia o server e retorna os dados para conexão')
        .addSubcommand(subcommand =>
            subcommand
                .setName('valheim')
                .setDescription('Valheim')
        ),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('minhas condolências, esse aqui desliga o server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('valheim')
                .setDescription('Valheim')
        ),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('básicão. exibe o status do server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('valheim')
                .setDescription('Valheim')
        ),
    new SlashCommandBuilder()
        .setName('continue')
        .setDescription('tu é o viciadão memo hein, esse te deixa jogar mais um pouco')
        .addSubcommand(subcommand =>
            subcommand
                .setName('valheim')
                .setDescription('Valheim')
        ),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_SERVER), { body: [] })
	.then(() => console.log('Clean all commands.'))
	.catch(console.error);

rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_SERVER), { body: COMMANDS })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);