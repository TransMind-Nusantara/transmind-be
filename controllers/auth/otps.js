const supabase = require('../../config/supabaseClient');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
    try {
        console.log(`📧 OTP for ${email}: ${otp}`);
        console.log(`📧 Email content: Kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

const sendOTPSMS = async (phone, otp) => {
    try {
        console.log(`📱 SMS OTP for ${phone}: ${otp}`);
        console.log(`📱 SMS content: Kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true };
    } catch (error) {
        console.error('Error sending OTP SMS:', error);
        return { success: false, error: error.message };
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email dan OTP dibutuhkan' });
    }

    try {
        // Get stored OTP data
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ error: 'OTP tidak ditemukan atau sudah expired' });
        }

        // Check if OTP is expired
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP sudah expired. Silakan request OTP baru.' });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({ error: 'Kode OTP tidak valid' });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: storedData.password,
            options: {
                data: {
                    role: storedData.role,
                    name: storedData.name
                }
            }
        });

        if (authError) {
            return res.status(400).json({ error: 'Gagal membuat user: ' + authError.message });
        }

        // Create user profile in database
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: email,
                name: storedData.name,
                role: storedData.role,
                email_verified: true,
                created_at: new Date()
            })
            .select()
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // User auth created but profile failed - this should be handled
        }

        // Clean up OTP data
        otpStore.delete(email);

        res.status(201).json({
            message: 'Registrasi berhasil! Akun Anda telah dibuat.',
            user: {
                id: authData.user.id,
                email: email,
                name: storedData.name,
                role: storedData.role
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Gagal verifikasi OTP: ' + error.message });
    }
};

const verifyPhoneOTP = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ error: 'Nomor telepon dan OTP dibutuhkan' });
    }

    try {
        // Normalize phone number
        let normalizedPhone = phone;
        if (phone.startsWith('0')) {
            normalizedPhone = '+62' + phone.substring(1);
        } else if (phone.startsWith('62')) {
            normalizedPhone = '+' + phone;
        }

        // Get stored OTP data
        const storedData = phoneOtpStore.get(normalizedPhone);

        if (!storedData) {
            return res.status(400).json({ error: 'OTP tidak ditemukan atau sudah expired' });
        }

        // Check if OTP is expired
        if (Date.now() > storedData.expiresAt) {
            phoneOtpStore.delete(normalizedPhone);
            return res.status(400).json({ error: 'OTP sudah expired. Silakan request OTP baru.' });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({ error: 'Kode OTP tidak valid' });
        }

        // Check if phone number already exists in memory
        if (phoneUsers.has(normalizedPhone)) {
            return res.status(400).json({ error: 'Nomor telepon sudah terdaftar' });
        }

        // Create user in memory (temporary solution)
        const userId = 'phone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const userData = {
            id: userId,
            phone: normalizedPhone,
            name: storedData.name || 'User',
            role: storedData.role || 'user',
            password: storedData.password,
            created_at: new Date()
        };

        // Store user in memory
        phoneUsers.set(normalizedPhone, userData);

        // Try to save to Supabase database (optional)
        try {
            const { data: dbData, error: dbError } = await supabase
                .from('users')
                .insert({
                    id: userData.id,
                    phone: userData.phone,
                    name: userData.name,
                    role: userData.role,
                    phone_verified: true,
                    created_at: new Date()
                })
                .select()
                .single();

            if (dbError) {
                console.log('Database save failed (but user created in memory):', dbError.message);
            } else {
                console.log('User also saved to database:', dbData.id);
            }
        } catch (dbError) {
            console.log('Database save failed (but user created in memory):', dbError.message);
        }

        console.log('Phone registration successful for:', normalizedPhone);
        console.log('User stored in memory:', userData);

        // Clean up OTP data
        phoneOtpStore.delete(normalizedPhone);

        res.status(201).json({
            message: 'Registrasi berhasil! Akun Anda telah dibuat.',
            user: {
                id: userData.id,
                phone: userData.phone,
                name: userData.name,
                role: userData.role
            },
            auth_type: 'phone',
            note: 'User stored in memory (temporary)'
        });

    } catch (error) {
        console.error('Phone OTP verification error:', error);
        res.status(500).json({ error: 'Gagal verifikasi OTP: ' + error.message });
    }
};

const resendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email dibutuhkan' });
    }

    try {
        // Check if there's existing OTP data
        const existingData = otpStore.get(email);

        if (existingData && Date.now() < existingData.expiresAt) {
            return res.status(400).json({ error: 'OTP sebelumnya masih berlaku. Silakan tunggu beberapa menit.' });
        }

        // Generate new OTP
        const otp = generateOTP();

        // Store new OTP
        const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
        otpStore.set(email, {
            ...existingData,
            otp: otp,
            expiresAt: expirationTime
        });

        // Send new OTP
        const emailResult = await sendOTPEmail(email, otp);

        if (!emailResult.success) {
            return res.status(500).json({ error: 'Gagal mengirim OTP: ' + emailResult.error });
        }

        res.status(200).json({
            message: 'OTP baru telah dikirim ke email Anda.',
            email: email
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Gagal mengirim ulang OTP: ' + error.message });
    }
};

const resendPhoneOTP = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Nomor telepon dibutuhkan' });
    }

    try {
        // Normalize phone number
        let normalizedPhone = phone;
        if (phone.startsWith('0')) {
            normalizedPhone = '+62' + phone.substring(1);
        } else if (phone.startsWith('62')) {
            normalizedPhone = '+' + phone;
        }

        // Check if there's existing OTP data
        const existingData = phoneOtpStore.get(normalizedPhone);

        if (existingData && Date.now() < existingData.expiresAt) {
            return res.status(400).json({ error: 'OTP sebelumnya masih berlaku. Silakan tunggu beberapa menit.' });
        }

        // Generate new OTP
        const otp = generateOTP();

        // Store new OTP
        const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
        phoneOtpStore.set(normalizedPhone, {
            ...existingData,
            otp: otp,
            expiresAt: expirationTime
        });

        // Send new OTP
        const smsResult = await sendOTPSMS(normalizedPhone, otp);

        if (!smsResult.success) {
            return res.status(500).json({ error: 'Gagal mengirim OTP: ' + smsResult.error });
        }

        res.status(200).json({
            message: 'OTP baru telah dikirim ke nomor telepon Anda.',
            phone: normalizedPhone
        });

    } catch (error) {
        console.error('Resend phone OTP error:', error);
        res.status(500).json({ error: 'Gagal mengirim ulang OTP: ' + error.message });
    }
};

module.exports = {
    verifyOTP, verifyPhoneOTP, resendOTP, resendPhoneOTP
}