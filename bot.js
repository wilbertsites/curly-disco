const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const http = require('http');

const client = new Client({ intents: [1, 512, 32768] });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1489612859179798588";
const JOIN_MSG = "join https://discord.gg/pkvG7BGKEZ";

const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('spam').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('say').setDescription('say').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('blame').setDescription('blame').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('flood').setDescription('flood').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('custom-spam').setDescription('custom spam').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('l-spam').setDescription('lag spam').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('fast-flood').setDescription('fast flood').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
];

http.createServer((req, res) => { res.writeHead(200); res.end('Alive'); }).listen(process.env.PORT || 3000);

client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} online`);
    client.user.setStatus('invisible');
    const rest = new REST({version:'10'}).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), {body:commands});
    console.log('[+] Commands registered');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    await interaction.reply({ content: JOIN_MSG, ephemeral: true });
});

client.login(TOKEN);
