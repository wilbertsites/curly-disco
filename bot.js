const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

const client = new Client({ intents: [1, 512, 32768] });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1497740024983195668";

const commands = [
    new SlashCommandBuilder()
        .setName('raid')
        .setDescription('Spam the channel with JHUB')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('What to say')
                .setRequired(true))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('flood')
        .setDescription('Spam discord.gg/jhub')
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
    console.log('[+] Slash commands registered');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'say') {
        const msg = interaction.options.getString('message');
        await interaction.reply({ content: 'Sent!', ephemeral: true });
        await interaction.channel.send(msg);
    }

    if (interaction.commandName === 'raid') {
        await interaction.reply({ content: 'Spamming...', ephemeral: true });
        for (let i = 0; i < 100; i++) {
            interaction.channel.send('@everyone @here RAIDED BY discord.gg/jhub JHUB OWNS U').catch(() => {});
        }
    }

    if (interaction.commandName === 'flood') {
        await interaction.reply({ content: 'Flooding...', ephemeral: true });
        for (let i = 0; i < 100; i++) {
            interaction.channel.send('discord.gg/jhub').catch(() => {});
        }
    }
});

client.login(TOKEN);
