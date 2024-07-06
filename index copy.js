const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '5437'; // Ganti dengan API key Anda

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if (message.body === 'sayang') {
        message.reply('Iya kenapa sayangku Nisa Handiani ILOVEYOU 😘🥰');
    }
});

client.initialize();

app.use(bodyParser.json());

app.post('/send-message', (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ error: 'Bad Request: Missing number or message' });
    }

    const chatId = `${number}@c.us`; // Format nomor menjadi chatId
    client.sendMessage(chatId, message).then(response => {
        res.status(200).json({ message: 'Message sent successfully', response });
    }).catch(err => {
        res.status(500).json({ error: 'Failed to send message', details: err });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Contoh cURL untuk mengirim pesan:
// curl -X POST http://localhost:3000/send-message \
//      -H "Content-Type: application/json" \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d '{"number": "6281234567890", "message": "Hello, this is a test message!"}'
