const { Client, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const http = require('http');

const client = new Client({ intents: [1, 512, 32768] });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1489612859179798588"; // Your bot's app ID

const commands = [
    new SlashCommandBuilder()
        .setName('spam')
        .setDescription('Click the button to flood the chat')
        .setIntegrationTypes([0, 1])
        .setContexts([0, 1, 2])
        .toJSON()
];

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Alive');
}).listen(process.env.PORT || 3000);

client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} is ready`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('[+] Commands registered');
});

client.on('interactionCreate', async (interaction) => {
    // /spam command — spawns the button
    if (interaction.isChatInputCommand() && interaction.commandName === 'spam') {
        const button = new ButtonBuilder()
            .setCustomId('flood_start')
            .setLabel('CLICK TO SPAM')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(button);
        await interaction.reply({ content: 'Press the button to flood', components: [row], ephemeral: true });
    }

    // Button clicked — flood the channel
    if (interaction.isButton() && interaction.customId === 'flood_start') {
        await interaction.reply({ content: 'Flooding...', ephemeral: true });
        for (let i = 0; i < 100; i++) {
            await interaction.channel.send('@everyone @here RAIDED BY discord.gg/jhub JHUB OWNS U').catch(() => {});
        }
    }
});

client.login(TOKEN);
