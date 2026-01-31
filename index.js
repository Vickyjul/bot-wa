cat <<EOF > index.js
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        browser: ["Bot Pintar", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'open') console.log('--- BOT PINTAR SIAP! ---');
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const id = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const command = text.toLowerCase();

        if (command === '!ping') await sock.sendMessage(id, { text: 'Pong! 🏓' });
        
        if (command.startsWith('!ai ')) {
            try {
                const res = await axios.get("https://api.simsimi.net/v2/?text=" + encodeURIComponent(text.slice(4)) + "&lc=id");
                await sock.sendMessage(id, { text: "🤖 AI: " + res.data.success });
            } catch (e) { await sock.sendMessage(id, { text: "Gagal tanya AI." }); }
        }

        if (command.startsWith('!gambar ')) {
            await sock.sendMessage(id, { text: "⏳ Bentar ya..." });
            await sock.sendMessage(id, { image: { url: "https://pollinations.ai/p/" + encodeURIComponent(text.slice(8)) }, caption: "Hasil lukisan AI" });
        }
    });
}
startBot();
EOF
