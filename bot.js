const { Client, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const http = require('http');
const https = require('https');

const client = new Client({ intents: [1, 2, 512, 32768] });

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1489612859179798588";
const WHITELIST_ROLE_ID = "1498099673406374029";
const JHUB_URL = "https://discord.gg/jhub";

const ZALGO_UP = ['\u030D','\u030E','\u0304','\u0305','\u033F','\u0311','\u0306','\u0310','\u0352','\u0357','\u0351','\u0307','\u0308','\u030A','\u0342','\u0343','\u0344','\u034A','\u034B','\u034C','\u0303','\u0302','\u030C','\u0350','\u0300','\u0301','\u030B','\u030F','\u0312','\u0313','\u0314','\u033D','\u0309','\u0363','\u0364','\u0365','\u0366','\u0367','\u0368','\u0369','\u036A','\u036B','\u036C','\u036D','\u036E','\u036F','\u033E','\u035B','\u0346','\u031A'];
const ZALGO_MID = ['\u0315','\u031B','\u0340','\u0341','\u0358','\u0321','\u0322','\u0327','\u0328','\u0334','\u0335','\u0336','\u034F','\u035C','\u035D','\u035E','\u035F','\u0360','\u0362','\u0338','\u0337','\u0361','\u0489'];
const ZALGO_DOWN = ['\u0316','\u0317','\u0318','\u0319','\u031C','\u031D','\u031E','\u031F','\u0320','\u0324','\u0325','\u0326','\u0329','\u032A','\u032B','\u032C','\u032D','\u032E','\u032F','\u0330','\u0331','\u0332','\u0333','\u0339','\u033A','\u033B','\u033C','\u0345','\u0347','\u0348','\u0349','\u034D','\u034E','\u0353','\u0354','\u0355','\u0356','\u0359','\u035A','\u0323'];

function zalgo(text, intensity = 15) {
    let result = '';
    for (const char of text) {
        result += char;
        const up = Math.floor(Math.random() * intensity) + 1;
        const mid = Math.floor(Math.random() * (intensity / 3)) + 1;
        const down = Math.floor(Math.random() * intensity) + 1;
        for (let i = 0; i < up; i++) result += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
        for (let i = 0; i < mid; i++) result += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
        for (let i = 0; i < down; i++) result += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
    }
    return result;
}

function buildZalgoSpam() {
    const base = `[JHUB](${JHUB_URL}) ON TOP `;
    let filled = zalgo(base, 30);
    while (filled.length < 1990) {
        filled += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
        filled += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
        filled += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
    }
    return filled.slice(0, 1990) + ' @everyone @here';
}

const ARABIC_SPAM = '﷽'.repeat(1950);
const ARABIC_MSG = `[JHUB](${JHUB_URL})\n${ARABIC_SPAM}\n@everyone @here`;

const commands = [
    new SlashCommandBuilder().setName('spam').setDescription('Arabic flood (free)').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('say').setDescription('Make bot say something (free)').addStringOption(o=>o.setName('message').setDescription('What to say').setRequired(true)).setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('blame').setDescription('Frame someone (free)').addUserOption(o=>o.setName('user').setDescription('Who to blame').setRequired(true)).setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('flood').setDescription('JHUB flood (premium)').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('custom-spam').setDescription('Spam anything (premium)').addStringOption(o=>o.setName('text').setDescription('What to spam').setRequired(true)).setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON(),
    new SlashCommandBuilder().setName('l-spam').setDescription('Zalgo lag spam (premium)').setIntegrationTypes([0,1]).setContexts([0,1,2]).toJSON()
];

let blamedUser = null;

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('Alive');
}).listen(process.env.PORT || 3000);

client.once('ready', async () => {
    console.log(`[+] ${client.user.tag} ready`);
    client.user.setStatus('invisible');
    client.user.setActivity(null);
    const rest = new REST({version:'10'}).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), {body:commands});
    console.log('[+] Commands registered');
});

async function checkPremium(interaction) {
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    
    if (!guildId) {
        await interaction.reply({content:'Join discord.gg/jhub first', ephemeral:true});
        return false;
    }

    if (interaction.member && interaction.member.roles && interaction.member.roles.cache.has(WHITELIST_ROLE_ID)) {
        return true;
    }

    return new Promise((resolve) => {
        const options = {
            hostname: 'discord.com',
            path: `/api/v10/guilds/${guildId}/members/${userId}`,
            method: 'GET',
            headers: { 'Authorization': `Bot ${TOKEN}` }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const memberData = JSON.parse(data);
                    if (memberData.roles && memberData.roles.includes(WHITELIST_ROLE_ID)) {
                        resolve(true);
                    } else {
                        interaction.reply({content:'You are not whitelisted', ephemeral:true}).catch(()=>{});
                        resolve(false);
                    }
                } else {
                    interaction.reply({content:'Join discord.gg/jhub first', ephemeral:true}).catch(()=>{});
                    resolve(false);
                }
            });
        });
        req.on('error', () => {
            interaction.reply({content:'Join discord.gg/jhub first', ephemeral:true}).catch(()=>{});
            resolve(false);
        });
        req.end();
    });
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = interaction.commandName;

    // FREE
    if (cmd === 'say') {
        const msg = interaction.options.getString('message');
        await interaction.reply({content:'Sent!', ephemeral:true});
        await interaction.followUp({content:msg});
        return;
    }

    if (cmd === 'blame') {
        blamedUser = interaction.options.getUser('user');
        await interaction.reply({content:`Blame set to ${blamedUser.tag}`, ephemeral:true});
        return;
    }

    if (cmd === 'spam') {
        await interaction.reply({content:'Flooding...', ephemeral:true});
        if (blamedUser) {
            const embed = new EmbedBuilder().setTitle('RAID EXECUTED').setDescription(`**${blamedUser.tag}** is responsible.`).setColor(0xff0000).setThumbnail(blamedUser.displayAvatarURL()).setFooter({text:'JHUB ON TOP'});
            await interaction.followUp({content:`${blamedUser}`, embeds:[embed]}).catch(()=>{});
        }
        const p = [];
        for (let i=0;i<100;i++) p.push(interaction.followUp({content:ARABIC_MSG}).catch(()=>{}));
        await Promise.all(p);
        if (blamedUser) {
            const embed = new EmbedBuilder().setTitle('RAID EXECUTED').setDescription(`**${blamedUser.tag}** is responsible.`).setColor(0xff0000).setThumbnail(blamedUser.displayAvatarURL()).setFooter({text:'JHUB ON TOP'});
            await interaction.followUp({content:`${blamedUser}`, embeds:[embed]}).catch(()=>{});
        }
        return;
    }

    // PREMIUM
    const premium = await checkPremium(interaction);
    if (!premium) return;

    if (cmd === 'flood') {
        await interaction.reply({content:'Flooding...', ephemeral:true});
        const p = [];
        for (let i=0;i<100;i++) p.push(interaction.followUp({content:`[JHUB](${JHUB_URL}) ON TOP @everyone @here`}).catch(()=>{}));
        await Promise.all(p);
        return;
    }

    if (cmd === 'custom-spam') {
        const text = interaction.options.getString('text');
        await interaction.reply({content:`Spamming: ${text}`, ephemeral:true});
        const p = [];
        for (let i=0;i<100;i++) p.push(interaction.followUp({content:text}).catch(()=>{}));
        await Promise.all(p);
        return;
    }

    if (cmd === 'l-spam') {
        await interaction.reply({content:'Lag spam incoming...', ephemeral:true});
        const p = [];
        for (let i=0;i<100;i++) p.push(interaction.followUp({content:buildZalgoSpam()}).catch(()=>{}));
        await Promise.all(p);
        return;
    }
});

client.login(TOKEN);
