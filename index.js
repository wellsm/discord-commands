const { Client, Intents, MessageEmbed } = require('discord.js');

const Compute = require('@google-cloud/compute');
const compute = new Compute();

require('dotenv/config');

const zone = compute.zone(process.env.INSTANCE_ZONE);
const vm = zone.vm(process.env.INSTANCE_NAME);

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const channel = () => client.channels.cache.get(process.env.DISCORD_CHANNEL);

const TIME_INTERVAL = process.env.INSTANCE_INTERVAL;
const TIME_TO_STOP  = process.env.INSTANCE_TIME_STOP;

const STATUSES = {
    'TERMINATED': '```diff\n- desligado\n```',
    'RUNNING': '```diff\n+ ligado\n```',
    'STOPPING': '```diff\n- desligando\n```'
};

const COLOR = 15088719;
const NO_IP = '```-```';

const IP = (ip) => ip != '' ? ('```:ip:9876```').replace(':ip', ip) : NO_IP;
const STOP_IN  = () => TIME_TO_STOP < 1 ? `${TIME_TO_STOP * 60} segundos` : `${TIME_TO_STOP} minutos`;
const INTERVAL = () => `${TIME_INTERVAL} minutos`;

let INSTANCE_INTERVAL = null;
let INSTANCE_TIMEOUT = null;
let STATUS = null;

const GET_STATUS = async () => STATUS || (STATUS = (await vm.get()).shift().metadata.status);

const SET_INSTANCE_INTERVAL = () => setInterval(() => {
    const embed = new MessageEmbed()
        .setColor(COLOR)
        .setTitle('hey moçada')
        .setDescription(`tem alguem ai?\no server irá desligar em ${STOP_IN()}\ndigite o comando abaixo e continue playando`)
        .addField('comando', "```/continue```", true);

    channel().send({ embeds: [embed] });

    clearTimeout(INSTANCE_TIMEOUT);

    INSTANCE_TIMEOUT = SET_INSTANCE_TIMEOUT();
}, TIME_INTERVAL * 60 * 1000);

const SET_INSTANCE_TIMEOUT = () => setTimeout(() => commands.instance.stop("vixi.... lascou, ve se lembra de desligar da próxima vez!"), TIME_TO_STOP * 60 * 1000);

const commands = {
    instance: {
        start: async (interaction) => {
            const embed = new MessageEmbed()
                .setColor(COLOR)
                .setDescription('ôooopa chefia, ta iniciando, da uma segurada');

            await interaction.reply({ embeds: [embed] });
            await vm.start();

            return setTimeout(async () => {
                const instance = (await vm.get()).shift();
                const status = STATUS = instance.metadata.status;
                const ip = instance.metadata.networkInterfaces.shift().accessConfigs.shift().natIP || '';

                const embed = new MessageEmbed()
                    .setColor(COLOR)
                    .setDescription('vai jogar agora e me deixa em paz\ne ve lembra de desligar')
                    .addField('status', STATUSES[status] || status, true)
                    .addField('ip', IP(ip), true);
                
                await interaction.editReply({ embeds: [embed] });

                INSTANCE_INTERVAL = SET_INSTANCE_INTERVAL();
            }, 30 * 1000);
        },
        stop: async (interaction, description = "finalmente vai dormir ein. lembrou que tem que trabalhar amanhã é?") => {
            const status = await GET_STATUS();
            const embed = new MessageEmbed()
                .setColor(COLOR)
                .setDescription(`server ja ta desligado quirido(a)\ndigite o comando abaixo e bora chupar`)
                .addField('comando', "```/start```", true);

            if (status == 'TERMINATED') {
                return interaction.reply({ embeds: [embed] });
            }

            embed.setDescription(description)
                .spliceFields(0, 1);

            await interaction.reply({ embeds: [embed] });
            await vm.stop();

            clearInterval(INSTANCE_INTERVAL);
            clearTimeout(INSTANCE_TIMEOUT);

            return setTimeout(() => commands.instance.status(interaction, "ta desligado quirido(a), agora vai chupar ota coisa"), 30 * 1000);
        },
        status: async (interaction, description = '') => {
            const instance = (await vm.get()).shift();
            const status = STATUS = instance.metadata.status;
            const ip = instance.metadata.networkInterfaces.shift().accessConfigs.shift().natIP || '';

            const embed = new MessageEmbed()
                .setColor(COLOR)
                .setDescription(description)
                .addField('status', STATUSES[status] || status, true)
                .addField('ip', IP(ip), true);

            return description == ''
                ? interaction.reply({ embeds: [embed] })
                : interaction.followUp({ embeds: [embed] });
        },
        continue: async (interaction) => {
            const status = await GET_STATUS();
            const embed = new MessageEmbed()
                .setColor(COLOR)
                .setDescription(`server ta desligado quirido(a)\ndigite o comando abaixo e bora chupar`)
                .addField('comando', "```/start```", true);

            if (status == 'TERMINATED') {
                return interaction.reply({ embeds: [embed] });
            }

            clearInterval(INSTANCE_INTERVAL);
            clearTimeout(INSTANCE_TIMEOUT);

            INSTANCE_INTERVAL = SET_INSTANCE_INTERVAL();

            embed.setDescription(`pode jogar mais um poquinho ta bom? voces tem mais ${INTERVAL()}`)
                .spliceFields(0, 1);

            return interaction.reply({ embeds: [embed] });
        },
    },
};

client.once('ready', () => console.log('Ready'));

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) {
        return;
    }

	const { commandName } = interaction;

	if (
        !commands.instance.hasOwnProperty(commandName)
        || interaction.channelId != process.env.DISCORD_CHANNEL
    ) {
        return;
    }

    console.log(`${new Date().toLocaleString()} - User: ${interaction.user.username} - Command: ${commandName}`);

    commands.instance[commandName](interaction);
});

client.login(process.env.DISCORD_TOKEN);