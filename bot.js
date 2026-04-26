const { Client, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const http = require('http');

const client = new Client({ intents: [1, 512, 32768] });

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
        .toJSON()
];

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Alive');
}).listen(process.env.PORT || 3000);

client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} ready`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('[+] Commands registered');
});

client.on('interactionCreate', async (interaction) => {
    // /say
    if (interaction.isChatInputCommand() && interaction.commandName === 'say') {
        const msg = interaction.options.getString('message');
        await interaction.reply(msg);
        return;
    }

    // /spam
    if (interaction.isChatInputCommand() && interaction.commandName === 'spam') {
        const btn = new ButtonBuilder()
            .setCustomId('spam_btn')
            .setLabel('START SPAM')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(btn);
        await interaction.reply({ content: 'Click below to flood', components: [row] });
        return;
    }

    // Button spam
    if (interaction.isButton() && interaction.customId === 'spam_btn') {
        await interaction.reply({ content: 'Flooding...', ephemeral: true });

        // Fire all 100 followups at once — no await between them
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(
                interaction.followUp({ content: '@everyone @here RAIDED BY discord.gg/jhub JHUB OWNS U' }).catch(() => {})
            );
        }
        await Promise.all(promises);
    }
});

client.login(TOKEN);
