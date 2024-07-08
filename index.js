const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');
const mime = require('mime-types');
const axios = require('axios');
const FormData = require('form-data');
const schedule = require('node-schedule');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '5437';
const REMOVE_BG_API_KEY = 'hNjmLn2HLNTdGFMyC8vcmwRY'; // Ganti dengan kunci API remove.bg Anda

// Fungsi untuk menghapus latar belakang menggunakan API remove.bg
async function removeBackground(base64Image) {
    console.log(base64Image);
    const formData = new FormData();
    formData.append('image_file_b64', base64Image);
    formData.append('size', 'auto');

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': REMOVE_BG_API_KEY,
            },
            responseType: 'arraybuffer'
        });

        if (response.status !== 200) {
            throw new Error('Error removing background');
        }

        const bgRemovedImage = Buffer.from(response.data, 'binary').toString('base64');
        console.log('Background removed successfully:', bgRemovedImage);
        return bgRemovedImage;
    } catch (error) {
        console.error('Failed to remove background:', error.message);
        throw error;
    }
}

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

client.on('message', async message => {
    console.log('Pesan masuk dari:', message.from, 'Isi pesan:', message.body);
    if (message.body === 'Syang') {
        message.reply('Iya kenapa sayangku Nisa Handiani ILOVEYOU 😘🥰');
    } else if (message.hasMedia && message.body.includes('Bang : hapusin dong backgroundnya')) {
        console.log("test");
        try {
            const media = await message.downloadMedia();
            console.log('Media downloaded successfully:', media);

            const bgRemovedImageBuffer = await removeBackground(media.data); // Ensure removeBackground returns Buffer
            console.log('Background removal result:', bgRemovedImageBuffer);

            const fileName = 'sayaganteng.png'; // Set your desired file name
            const responseMedia = new MessageMedia(mime.lookup(fileName) || 'application/octet-stream', bgRemovedImageBuffer, fileName);

            await client.sendMessage(message.from, responseMedia, { caption: 'Ini Bang!', sendMediaAsDocument: true });
            console.log('Response media sent successfully');
        } catch (error) {
            console.error('Error processing image:', error.message);
            message.reply('Maaf, terjadi kesalahan saat memproses gambar Anda.');
        }
    }
});


client.initialize();

app.use(bodyParser.json());

// Routes dan endpoint lainnya ...

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


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

// Fungsi untuk menghapus latar belakang menggunakan API remove.bg
async function removeBackground(base64Image) {
    console.log(base64Image);
    const formData = new FormData();
    formData.append('image_file_b64', base64Image);
    formData.append('size', 'auto');

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': REMOVE_BG_API_KEY,
            },
            responseType: 'arraybuffer'
        });

        if (response.status !== 200) {
            throw new Error('Error removing background');
        }

        const bgRemovedImage = Buffer.from(response.data, 'binary').toString('base64');
        console.log('Background removed successfully:', bgRemovedImage);
        return bgRemovedImage;
    } catch (error) {
        console.error('Failed to remove background:', error.message);
        throw error;
    }
}


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

    try {
        if (base64Image) {
            const bgRemovedImage = await removeBackground(base64Image);
            media = new MessageMedia(mime.lookup(bgRemovedImage) || 'image/png', bgRemovedImage);
        } else if (imageUrl) {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'];
            const buffer = Buffer.from(response.data, 'binary').toString('base64');
            const bgRemovedImage = await removeBackground(buffer);
            media = new MessageMedia(contentType, bgRemovedImage);
        }

        client.sendMessage(chatId, media, { caption: caption || '' }).then(response => {
            res.status(200).json({ message: 'Image sent successfully', response });
        }).catch(err => {
            res.status(500).json({ error: 'Failed to send image', details: err });
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process image', details: error.message });
    }
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

