const { Client, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const http = require('http');

const client = new Client({ intents: [] }); // Zero intents — invisible, no presence

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1489612859179798588";

const commands = [
    new SlashCommandBuilder()
        .setName('spam')
        .setDescription('Click button to flood chat')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON(),
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(opt =>
            opt.setName('message').setDescription('What to say').setRequired(true))
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON(),
    new SlashCommandBuilder()
        .setName('blame')
        .setDescription('Blame someone for the raid')
        .addUserOption(opt =>
            opt.setName('user').setDescription('Who to blame').setRequired(true))
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON()
];

// Ghost ping unicode spam — @everyone @here rendered as invisible Unicode lookalikes mixed with real pings
// Uses zero-width chars + unicode homoglyphs to cloak the real ping
const GHOST_PING = '@everyone\u200B\u200C\u200D\uFEFF\u200B @here\u200B\u200C\u200D\uFEFF\u200B';

const SPAM_MSG = `[JHUB](https://discord.gg/jhub) ON TOP\n${'\u06DD'.repeat(50)}\n${GHOST_PING}\n${'\u06DD'.repeat(30)}\n@everyone @here`;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Alive');
}).listen(process.env.PORT || 3000);

let blamedUser = null;

client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} ready — INVISIBLE MODE`);
    // Set status to invisible/offline
    client.user.setStatus('invisible');
    // Remove any activity
    client.user.setActivity(null);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('[+] Commands registered');
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'say') {
        const msg = interaction.options.getString('message');
        await interaction.reply({ content: 'Sent!', ephemeral: true });
        await interaction.followUp({ content: msg });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'blame') {
        const user = interaction.options.getUser('user');
        blamedUser = user;
        await interaction.reply({ content: `Blame set to ${user.tag}`, ephemeral: true });
        return;
    }

    if (interaction.isChatInputCommand() && interaction.commandName === 'spam') {
        const btn = new ButtonBuilder()
            .setCustomId('spam_btn')
            .setLabel('START SPAM')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(btn);
        await interaction.reply({ content: 'Click below to flood', components: [row], ephemeral: true });
        return;
    }

    if (interaction.isButton() && interaction.customId === 'spam_btn') {
        await interaction.reply({ content: 'Flooding...', ephemeral: true });

        if (blamedUser) {
            await interaction.followUp({ content: `Raid executed by ${blamedUser.tag}` }).catch(() => {});
        }

        const promises = [];
        for (let i = 0; i < 99; i++) {
            promises.push(
                interaction.followUp({ content: SPAM_MSG }).catch(() => {})
            );
        }
        await Promise.all(promises);

        if (blamedUser) {
            await interaction.followUp({ content: `Raid executed by ${blamedUser.tag}` }).catch(() => {});
        }

        await interaction.message.delete().catch(() => {});
    }
});

client.login(TOKEN);
