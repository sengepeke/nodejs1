const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const LOG_FILE = path.join(__dirname, 'test.log');

// Middleware untuk menyajikan file statis dan template
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs'); // Gunakan EJS untuk template rendering

// Route utama
app.get('/', async (req, res) => {
    const hostname = os.hostname();
    let ip = 'Unknown';

    try {
        const response = await axios.get('https://ipinfo.io');
        ip = response.data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error.message);
    }

    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        const fileContent = fs.readFileSync(LOG_FILE, 'utf-8');
        logs = fileContent.split('\n').slice(-20);
    } else {
        logs.push('Peer2profit not started, Check the process first!');
    }

    res.render('index', { hostname, ip, logs });
});

// Fungsi untuk memulai proses p2pclient
function startProcess() {
    const email = process.env.EMAIL || 'chasing66@live.com';
    if (!email) {
        console.error('EMAIL environment variable is not set. Please set it to your email address.');
        process.exit(1);
    }

    const cmd = `nohup p2pclient -l ${email} > ${LOG_FILE} 2>&1 &`;
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting p2pclient: ${stderr}`);
            return;
        }
        console.log(`p2pclient started: ${stdout}`);
    });
}

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startProcess();
});
