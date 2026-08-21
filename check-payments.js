// Odeme vade tarihlerini kontrol edip yaklasanlar icin Netgsm uzerinden
// gercek SMS gonderen script. GitHub Actions tarafindan her gun otomatik calistirilir.

const fs = require('fs');
const path = require('path');

const USERCODE = process.env.NETGSM_USERCODE;
const PASSWORD = process.env.NETGSM_PASSWORD;
const MSGHEADER = process.env.NETGSM_MSGHEADER;
const PHONE = process.env.PHONE_NUMBER; // ornek: 5xxxxxxxxx (basinda 0 veya 90 olmadan)
const REMINDER_DAYS = parseInt(process.env.REMINDER_DAYS || '3', 10);

if (!USERCODE || !PASSWORD || !MSGHEADER || !PHONE) {
  console.error('Eksik ortam degiskeni: NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_MSGHEADER, PHONE_NUMBER hepsi gerekli.');
  process.exit(1);
}

function todayStr() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysUntil(dateStr) {
  const today = todayStr();
  const target = new Date(dateStr + 'T00:00:00Z');
  return Math.round((target - today) / 86400000);
}

async function sendSms(message) {
  const url = new URL('https://api.netgsm.com.tr/sms/send/get');
  url.searchParams.set('usercode', USERCODE);
  url.searchParams.set('password', PASSWORD);
  url.searchParams.set('gsmno', PHONE);
  url.searchParams.set('message', message);
  url.searchParams.set('msgheader', MSGHEADER);

  const res = await fetch(url.toString());
  const text = await res.text();
  console.log('Netgsm yaniti:', text);
  // Basarili gonderimlerde yanit "00 <jobid>" ile baslar.
  // Hata kodlari icin Netgsm dokumantasyonuna bakin.
  if (!text.trim().startsWith('00')) {
    throw new Error('SMS gonderimi basarisiz oldu: ' + text);
  }
  return text;
}

async function main() {
  const dataPath = path.join(__dirname, 'payments.json');
  const payments = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const due = payments.filter((p) => {
    const d = daysUntil(p.date);
    return d >= 0 && d <= REMINDER_DAYS;
  });

  if (due.length === 0) {
    console.log('Yaklasan odeme yok, SMS gonderilmedi.');
    return;
  }

  for (const p of due) {
    const d = daysUntil(p.date);
    const zaman = d === 0 ? 'bugun' : `${d} gun sonra`;
    const msg = `Odeme hatirlatma: ${p.name} - ${p.amount} TL - vade ${zaman} (${p.date})`;
    try {
      await sendSms(msg.slice(0, 160));
      console.log('Gonderildi:', p.name);
    } catch (e) {
      console.error('Hata:', p.name, e.message);
      process.exitCode = 1;
    }
  }
}

main();
