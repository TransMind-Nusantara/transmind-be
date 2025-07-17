const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAILERSEND_SMTP_HOST,
    port: parseInt(process.env.MAILERSEND_SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.MAILERSEND_SMTP_USER,
        pass: process.env.MAILERSEND_SMTP_PASS,
    }
});

const sendOTPEmail = async (toEmail, otpCode) => {
    try {
        await transporter.sendMail({
            from: `"TransMind" <${process.env.MAILERSEND_SMTP_USER}>`,
            to: toEmail,
            subject: 'Kode OTP Verifikasi TransMind Anda',
            text: `Kode OTP Anda adalah ${otpCode}. Berlaku selama 10 menit.`,
            html: `<p>Kode OTP Anda adalah <strong>${otpCode}</strong>.<br/>Berlaku selama <strong>10 menit</strong>.</p>`
        });

        console.log('✅ OTP dikirim ke:', toEmail);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = { sendOTPEmail };
