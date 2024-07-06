const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

// Gunakan objek client untuk berinteraksi dengan WhatsApp Web.js

// const client = new Client({
//     authStrategy: new LocalAuth()
// });

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if(message.body === 'sayang') {
        message.reply('Iya kenapa sayangku Nisa Handiani ILOVEYOU 😘🥰');
    }
});

client.initialize();
