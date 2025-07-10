const supabase = require('../../config/supabaseClient');

// Store OTP codes temporarily (in production, use Redis or database)
const otpStore = new Map();
const phoneOtpStore = new Map();

const register = async (req, res) => {
    const { email, password, role, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password dibutuhkan' });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP with expiration (10 minutes)
        const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
        otpStore.set(email, {
            otp: otp,
            password: password,
            role: role || 'user',
            name: name,
            expiresAt: expirationTime
        });

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp);

        if (!emailResult.success) {
            return res.status(500).json({ error: 'Gagal mengirim OTP: ' + emailResult.error });
        }

        res.status(200).json({
            message: 'OTP telah dikirim ke email Anda. Silakan cek email dan masukkan kode OTP.',
            email: email
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Gagal melakukan registrasi: ' + error.message });
    }
};

const registerWithPhone = async (req, res) => {
    const { phone, password, name, role } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Nomor telepon dan password dibutuhkan' });
    }

    try {
        // Normalize phone number
        let normalizedPhone = phone;
        if (phone.startsWith('0')) {
            normalizedPhone = '+62' + phone.substring(1);
        } else if (phone.startsWith('62')) {
            normalizedPhone = '+' + phone;
        }

        // Check if phone already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', normalizedPhone)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Nomor telepon sudah terdaftar' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

        // Store OTP data
        phoneOtpStore.set(normalizedPhone, {
            otp,
            password,
            name: name || 'User',
            role: role || 'user',
            expiresAt
        });

        console.log('OTP generated for phone:', normalizedPhone, 'OTP:', otp);

        // Send OTP via SMS (simulated for now)
        const smsResult = await sendOTPSMS(normalizedPhone, otp);

        if (smsResult.error) {
            return res.status(500).json({ error: 'Gagal mengirim OTP: ' + smsResult.error });
        }

        res.status(200).json({
            message: 'OTP telah dikirim ke nomor telepon Anda. Silakan cek SMS dan masukkan kode OTP.',
            phone: normalizedPhone
        });

    } catch (error) {
        console.error('Phone register error:', error);
        res.status(500).json({ error: 'Gagal melakukan registrasi: ' + error.message });
    }
};

module.exports = { register, registerWithPhone }