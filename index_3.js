const mysql = require('mysql2');
const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs-extra');
const path = require('path');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = '5437'; // API Key Anda

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan username database Anda
    password: '', // Ganti dengan password database Anda
    database: 'db_contact' // Ganti dengan nama database Anda
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

const sessionDir = './.wwebjs_auth'; // Path ke folder sesi LocalAuth

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: sessionDir }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
    },
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('QR code received, scan it to log in.');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

app.get('/send-morning-messages', (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const query = 'SELECT * FROM contacts';
    connection.query(query, async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch data from database', details: err });
        }

        const imagePath = path.join(__dirname, 'images/promo.jpg');
        const media = MessageMedia.fromFilePath(imagePath);

        const failedMessages = [];

        for (const row of results) {
            const chatId = `${row.phone_number}@c.us`;
            const name = row.name.trim();
            const caption = `Selamat Pagi Bapak/Bunda ${name}! 
Kabar gembira dari ZOYA nih 🎉

Promo spesial *BUY 1 GET 1 FREE* 🤩
Beli satu produk favorit kamu, dapetin satu lagi GRATIS! 😍

Promo berlaku *CUMA 2 HARI!*
🗓️ 24-25 Agustus 2024

Jangan sampai ketinggalan promo seru ini ya!

Kunjungi ZOYA
🏢Duta Mall Banjarmasin 
Lantai 2, Blok 1-C23 & 1 – C25

Follow instagram: zoyabanjarmasin 
Untuk info selanjutnya,  
bisa langsung klik wa ini yaa >> wa.me/+6281255198469 

Salam hangat,
ZOYA ❤️`;
            try {
                await client.sendMessage(chatId, media, { caption });
                console.log(`Pesan dengan gambar berhasil dikirim ke ${row.name} (${row.phone_number})`);
            } catch (error) {
                console.error(`Gagal mengirim pesan dengan gambar ke ${row.name} (${row.phone_number}):`, error.message);
                failedMessages.push({ name: row.name, phone_number: row.phone_number, error: error.message });
            }
        }

        if (failedMessages.length > 0) {
            console.log('Pesan gagal dikirim ke beberapa nomor:', failedMessages);
        }

        res.status(200).json({ message: 'Morning messages with images sent successfully, check logs for any errors.', failedMessages });
    });
});

app.get('/send-morning-messages-pekan_baru', (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const query = 'SELECT * FROM pekan_baru';
    connection.query(query, async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch data from database', details: err });
        }

        const imagePath = path.join(__dirname, 'images/promo.jpg');
        const media = MessageMedia.fromFilePath(imagePath);

        const failedMessages = [];

        for (const row of results) {
            const phone_number = row.phone_number.trim();
            const chatId = `${phone_number}@c.us`;
            const name = row.name.trim();
            const caption = `Selamat Siang Bapak/Bunda ${name}! 
Kabar gembira dari ZOYA nih 🎉

Promo spesial *BUY 1 GET 1 FREE* 🤩
Beli satu produk favorit kamu, dapetin satu lagi GRATIS! 😍

Promo berlaku *CUMA 2 HARI!*
🗓️ 24-25 Agustus 2024

Jangan sampai ketinggalan promo seru ini ya!

Kunjungi ZOYA
🏢${row.alamat}

Follow instagram: ${row.ig} 
Untuk info selanjutnya,  
bisa langsung klik wa ini yaa >> ${row.tlp_kantor} 

Salam hangat,
ZOYA ❤️`;

            try {
                await client.sendMessage(chatId, media, { caption });
                console.log(`Pesan dengan gambar berhasil dikirim ke ${row.name} (${row.phone_number})`);
            } catch (error) {
                console.error(`Gagal mengirim pesan dengan gambar ke ${row.name} (${row.phone_number}):`, error.message);
                failedMessages.push({ name: row.name, phone_number: row.phone_number, error: error.message });
            }

            // Tambahkan jeda 3 detik sebelum mengirim pesan berikutnya
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (failedMessages.length > 0) {
            console.log('Pesan gagal dikirim ke beberapa nomor:', failedMessages);
        }

        res.status(200).json({ message: 'Morning messages with images sent successfully, check logs for any errors.', failedMessages });
    });
});

app.get('/send-morning-messages-separately', (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    const query = 'SELECT * FROM contacts';
    connection.query(query, async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch data from database', details: err });
        }

        const imagePath = path.join(__dirname, 'images/promo.jpg');
        const media = MessageMedia.fromFilePath(imagePath);

        for (const row of results) {
            const chatId = `${row.phone_number}@c.us`;

            const name = row.name.trim();
            const caption = `Selamat Sore Bapak/Bunda ${name}! 
Kabar gembira dari ZOYA nih 🎉

Promo spesial *BUY 1 GET 1 FREE* 🤩
Beli satu produk favorit kamu, dapetin satu lagi GRATIS! 😍

Promo berlaku *CUMA 2 HARI!*
🗓️ 24-25 Agustus 2024

Jangan sampai ketinggalan promo seru ini ya!

Kunjungi ZOYA
🏢Duta Mall Banjarmasin 
Lantai 2, Blok 1-C23 & 1 – C25

Follow instagram: zoyabanjarmasin 
Untuk info selanjutnya,  
bisa langsung klik wa ini yaa >> wa.me/+6281255198469 

Salam hangat,
ZOYA ❤️`;

            try {
                await client.sendMessage(chatId, media);
                console.log(`Gambar berhasil dikirim ke ${name} (${row.phone_number})`);

                await client.sendMessage(chatId, caption);
                console.log(`Pesan template berhasil dikirim ke ${name} (${row.phone_number})`);
            } catch (error) {
                console.error(`Gagal mengirim pesan ke ${name} (${row.phone_number}):`, error.message);
            }
        }

        res.status(200).json({ message: 'Morning messages sent successfully, check logs for any errors.' });
    });
});
app.get('/list-sessions', async (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    try {
        // Cek apakah direktori sesi ada
        const sessionExists = await fs.pathExists(sessionDir);

        if (!sessionExists) {
            return res.status(404).json({ error: 'No active sessions found.' });
        }

        // Baca semua file di direktori sesi
        const files = await fs.readdir(sessionDir);

        // Filter file yang mungkin berisi sesi
        const sessionFiles = files.filter(file => file.includes('session'));

        if (sessionFiles.length === 0) {
            return res.status(404).json({ error: 'No active sessions found.' });
        }

        // Tampilkan daftar file sesi sebagai indikasi sesi aktif
        const sessions = sessionFiles.map(file => path.basename(file, path.extname(file)));

        res.status(200).json({ message: 'Active sessions found.', sessions });
    } catch (err) {
        console.error('Failed to list sessions:', err);
        res.status(500).json({ error: 'Failed to list sessions', details: err.message });
    }
});

app.get('/logout', (req, res) => {
    const apiKey = req.headers['api-key'];
    if (apiKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }

    (async () => {
        if (client.info) {
            await client.logout();
            console.log('Client logged out successfully.');
        }

        // Hapus direktori sesi jika ada
        try {
            await fs.remove(sessionDir);
            console.log('Session directory removed successfully.');
        } catch (err) {
            console.error('Failed to remove session directory:', err);
        }

        res.status(200).json({ message: 'Logged out and session directory removed successfully.' });
    })();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    client.initialize();
});
