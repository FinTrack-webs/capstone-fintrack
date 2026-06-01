require('dotenv').config();
const mailer = require('./mailer');

const runTest = async () => {
  const testRecipient = process.env.TEST_EMAIL_RECIPIENT;

  if (!testRecipient) {
    console.error('[TEST ERROR]: TEST_EMAIL_RECIPIENT tidak ditemukan di file .env Anda!');
    console.log('Pastikan Anda sudah menambahkan TEST_EMAIL_RECIPIENT ke file .env');
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[TEST ERROR]: RESEND_API_KEY tidak ditemukan di file .env Anda!');
    process.exit(1);
  }

  console.log(`[RESEND TEST]: Memulai pengetesan pengiriman email...`);
  console.log(`[RESEND TEST]: Mencoba mengirim kode OTP uji coba ke: ${testRecipient}`);
  console.log(`[RESEND TEST]: Menggunakan pengirim: ${process.env.RESEND_FROM_EMAIL || 'FinTrack <onboarding@resend.dev>'}`);

  const success = await mailer.sendOTP(testRecipient, '123456');

  if (success) {
    console.log('\n======================================================');
    console.log('BERHASIL! Email uji coba sukses dikirim via Resend.');
    console.log(`Silakan periksa kotak masuk (Inbox/Spam) email Anda: ${testRecipient}`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.log('\n======================================================');
    console.log('GAGAL! Pengiriman email via Resend gagal.');
    console.log('Silakan periksa detail error di atas untuk debugging.');
    console.log('======================================================\n');
    process.exit(1);
  }
};

runTest();
