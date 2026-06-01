const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);

const mailer = {
  /**
   * Mengirimkan kode OTP verifikasi 2FA ke email tujuan menggunakan Resend SDK
   * @param {string} toEmail
   * @param {string} code
   */
  sendOTP: async (toEmail, code) => {
    if (!process.env.RESEND_API_KEY) {
      logger.warn(`[MAILER MOCK]: RESEND_API_KEY tidak diset!`);
      logger.warn(`[MAILER MOCK]: Kode OTP Anda untuk ${toEmail} adalah -> [ ${code} ] <-`);
      return true;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'FinTrack <onboarding@resend.dev>',
        to: toEmail,
        subject: 'FinTrack - Kode Verifikasi OTP 2-Factor Authentication',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Verifikasi 2 Langkah FinTrack</h2>
            <p>Halo,</p>
            <p>Kami mendeteksi adanya percobaan masuk baru ke akun FinTrack Anda. Silakan gunakan kode verifikasi OTP di bawah ini untuk menyelesaikan proses login Anda:</p>
            <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1F2937;">${code}</span>
            </div>
            <p style="color: #6B7280; font-size: 14px;">Kode ini hanya berlaku selama <strong>5 menit</strong>. Mohon untuk tidak membagikan kode ini kepada siapa pun demi keamanan akun Anda.</p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">FinTrack Team &copy; 2026. Hak cipta dilindungi.</p>
          </div>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      logger.info(`[MAILER]: Email OTP sukses dikirim ke ${toEmail} (Id: ${data.id})`);
      return true;
    } catch (err) {
      logger.error(`[MAILER ERROR]: Gagal mengirim email OTP ke ${toEmail}: ${err.message}`);
      logger.warn(`[MAILER]: Kode OTP cadangan Anda adalah -> [ ${code} ] <-`);
      return false;
    }
  },
};

module.exports = mailer;
