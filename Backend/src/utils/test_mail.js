require('dotenv').config();
const mailer = require('./mailer');

const runTest = async () => {
  // Ambil email pengirim sebagai email tujuan uji coba secara default
  const testRecipient = process.env.SMTP_USER;

  if (!testRecipient) {
    console.error('[TEST ERROR]: SMTP_USER tidak ditemukan di file .env Anda!');
    process.exit(1);
  }

  console.log(`[SMTP TEST]: Memulai pengetesan pengiriman email...`);
  console.log(`[SMTP TEST]: Mencoba mengirim kode OTP uji coba ke: ${testRecipient}`);

  const success = await mailer.sendOTP(testRecipient, '999888');

  if (success) {
    console.log('\n======================================================');
    console.log('🎉 BERHASIL! Email uji coba sukses dikirim.');
    console.log(`✉️  Silakan periksa kotak masuk (Inbox/Spam) email Anda: ${testRecipient}`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.log('\n======================================================');
    console.log('❌ GAGAL! Pengiriman email gagal.');
    console.log('🔍 Silakan periksa detail error di atas untuk debugging.');
    console.log('======================================================\n');
    process.exit(1);
  }
};

runTest();
