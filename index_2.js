const mysql = require('mysql2');
const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

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

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
    },
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
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
                // Lanjutkan ke iterasi berikutnya tanpa menghentikan loop
            }
        }

        // Kirim daftar nomor yang gagal dikirim jika ada
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
        
            // Menggunakan .trim() untuk menghapus spasi dan enter di awal dan akhir nama
            const name = row.name.trim();
            const caption = `Selamat Sore Bapak/Bunda ${name} ! 
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
                // Kirim gambar terlebih dahulu
                await client.sendMessage(chatId, media);
                console.log(`Gambar berhasil dikirim ke ${name} (${row.phone_number})`);
        
                // Kirim pesan template setelah gambar
                await client.sendMessage(chatId, caption);
                console.log(`Pesan template berhasil dikirim ke ${name} (${row.phone_number})`);
            } catch (error) {
                console.error(`Gagal mengirim pesan ke ${name} (${row.phone_number}):`, error.message);
                // Lanjutkan ke iterasi berikutnya tanpa menghentikan loop
            }
        }
        

        res.status(200).json({ message: 'Morning messages sent successfully, check logs for any errors.' });
    });
});



client.initialize();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
