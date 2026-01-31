const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
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
        if (connection === 'open') console.log('--- BOT PINTAR SIAP DIGUNAKAN! ---');
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const id = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const command = text.toLowerCase();

        // Fitur 1: !ai (Tanya AI)
        if (command.startsWith('!ai ')) {
            const prompt = text.slice(4);
            try {
                // Menggunakan API gratis untuk simulasi AI
                const response = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(prompt)}&lc=id`);
                await sock.sendMessage(id, { text: `🤖 AI: ${response.data.success}` });
            } catch (e) {
                await sock.sendMessage(id, { text: "Aduh, otak saya lagi konslet. Coba lagi nanti ya!" });
            }
        }

        // Fitur 2: !gambar (Generate Image)
        if (command.startsWith('!gambar ')) {
            const prompt = text.slice(8);
            await sock.sendMessage(id, { text: "⏳ Bentar ya, lagi ngelukis dulu..." });
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=42`;
            await sock.sendMessage(id, { 
                image: { url: imageUrl }, 
                caption: `✅ Ini hasil gambar: ${prompt}` 
            });
        }

        // Fitur 3: !ping & !info
        if (command === '!ping') {
            await sock.sendMessage(id, { text: 'Pong! 🏓' });
        }

        if (command === '!info') {
            await sock.sendMessage(id, { text: 'Saya adalah Bot WA Pintar yang jalan di GitHub Cloud! 🚀\n\nPerintah:\n1. !ai [tanya]\n2. !gambar [teks]\n3. !ping' });
        }
    });
}

startBot();
