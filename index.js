const { Client, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('SCAN QR INI DI HP KAMU:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('BERHASIL! Bot aktif di GitHub Codespaces.');
});

client.on('message_create', async (msg) => {
    if (msg.body.toLowerCase() === '!ping') {
        msg.reply('Pong! Bot merespon dari cloud.');
    }
});

client.initialize();
