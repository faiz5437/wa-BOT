const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const mime = require('mime-types');
const axios = require('axios');
const schedule = require('node-schedule'); // Pastikan modul diimpor

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '5437';

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

    const chatId = `${number}@c.us`;
    client.sendMessage(chatId, message).then(response => {
        res.status(200).json({ message: 'Message sent successfully', response });
    }).catch(err => {
        res.status(500).json({ error: 'Failed to send message', details: err });
    });
});

app.post('/send-image', async (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const { number, base64Image, imageUrl, caption } = req.body;
    if (!number || (!base64Image && !imageUrl)) {
        return res.status(400).json({ error: 'Bad Request: Missing number or image' });
    }

    const chatId = `${number}@c.us`;
    let media;

    if (base64Image) {
        media = new MessageMedia(mime.lookup(base64Image) || 'image/png', base64Image);
    } else if (imageUrl) {
        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];
            const buffer = Buffer.from(response.data, 'binary').toString('base64');
            media = new MessageMedia(contentType, buffer);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch image from URL', details: error.message });
        }
    }

    client.sendMessage(chatId, media, { caption: caption || '' }).then(response => {
        res.status(200).json({ message: 'Image sent successfully', response });
    }).catch(err => {
        res.status(500).json({ error: 'Failed to send image', details: err });
    });
});

app.post('/send-file', async (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const { number, base64File, fileUrl, fileName } = req.body;
    if (!number || (!base64File && !fileUrl)) {
        return res.status(400).json({ error: 'Bad Request: Missing number or file' });
    }

    const chatId = `${number}@c.us`;
    let media;

    if (base64File) {
        const mimeType = mime.lookup(fileName) || 'application/octet-stream';
        media = new MessageMedia(mimeType, base64File, fileName);
    } else if (fileUrl) {
        try {
            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];
            const buffer = Buffer.from(response.data, 'binary').toString('base64');
            media = new MessageMedia(contentType, buffer, fileName);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch file from URL', details: error.message });
        }
    }

    client.sendMessage(chatId, media).then(response => {
        res.status(200).json({ message: 'File sent successfully', response });
    }).catch(err => {
        res.status(500).json({ error: 'Failed to send file', details: err });
    });
});

app.get('/get-chats', async (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    try {
        const chats = await client.getChats();
        res.status(200).json({ chats });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get chats', details: err });
    }
});

app.get('/get-messages', async (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const { chatId } = req.body;
    if (!chatId) {
        return res.status(400).json({ error: 'Bad Request: Missing chatId' });
    }

    try {
        const chat = await client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit: 50 });
        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get messages', details: err });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/send-message-jadwal', (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const { number, message, scheduleTime } = req.body;
    if (!number || !message || !scheduleTime) {
        return res.status(400).json({ error: 'Bad Request: Missing number, message, or scheduleTime' });
    }

    const chatId = `${number}@c.us`;

    try {
        // Konversi waktu jadwal dari UTC ke waktu lokal (misalnya WIB)
        const scheduledDate = new Date(scheduleTime);
        scheduledDate.setHours(scheduledDate.getHours() + 7); // WIB offset dari UTC

        console.log(`Jadwal pengiriman pesan diatur pada ${scheduledDate}`);

        schedule.scheduleJob(scheduledDate, () => {
            client.sendMessage(chatId, message).then(response => {
                console.log(`Pesan berhasil dikirim pada ${scheduledDate}`);
                res.status(200).json({ message: 'Pesan dijadwalkan untuk dikirim', scheduleTime });
            }).catch(err => {
                console.error(`Gagal mengirim pesan pada ${scheduledDate}`, err);
                res.status(500).json({ error: 'Gagal mengirim pesan', details: err });
            });
        });
    } catch (error) {
        console.error('Error saat menyiapkan jadwal pengiriman pesan:', error);
        res.status(500).json({ error: 'Error saat menyiapkan jadwal pengiriman pesan', details: error });
    }
});




// curl -X POST http://localhost:3000/send-message-scheduled \
//     -H "Content-Type: application/json" \
//     -H "api-key: 5437" \
//     -d '{
//         "number": "6281234567890",
//         "message": "Ini adalah pesan yang dijadwalkan.",
//         "scheduleTime": "2024-07-06T08:00:00Z"
//     }'

// Contoh cURL untuk mendapatkan daftar chat:
// curl -X GET http://localhost:3000/get-chats \
//      -H "api-key: YOUR_SECRET_API_KEY"

// Contoh cURL untuk mendapatkan pesan dari chat tertentu:
// curl -X GET http://localhost:3000/get-messages \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d 'chatId=1234567890@c.us'


// Contoh cURL untuk mengirim pesan teks biasa:
// curl -X POST http://localhost:3000/send-message \
//      -H "Content-Type: application/json" \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d '{"number": "6281234567890", "message": "Hello, this is a test message!"}'

// Contoh cURL untuk mengirim gambar:
// curl -X POST http://localhost:3000/send-image \
//      -H "Content-Type: application/json" \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d '{"number": "6281234567890", "base64Image": "YOUR_BASE64_IMAGE_STRING", "caption": "Hello, this is a test image!"}'

// atau

// curl -X POST http://localhost:3000/send-image \
//      -H "Content-Type: application/json" \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d '{"number": "6281234567890", "imageUrl": "https://example.com/path/to/image.jpg", "caption": "Hello, this is a test image!"}'

// Contoh cURL untuk mengirim file:
// curl -X POST http://localhost:3000/send-file \
//      -H "Content-Type: application/json" \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d '{"number": "6281234567890", "base64File": "YOUR_BASE64_FILE_STRING", "fileName": "test.pdf"}'

// atau

// curl -X POST http://localhost:3000/send-file \
//      -H "Content-Type: application/json" \
//      -H "api-key: YOUR_SECRET_API_KEY" \
//      -d '{"number": "6281234567890", "fileUrl": "https://example.com/path/to/file.pdf", "fileName": "test.pdf"}'
