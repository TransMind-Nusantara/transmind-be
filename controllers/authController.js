const supabase = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
const axios = require('axios');

// Store OTP codes temporarily (in production, use Redis or database)
const otpStore = new Map();
const phoneOtpStore = new Map();

// Store phone users in memory (temporary solution)
const phoneUsers = new Map();

// ==============================
// Generate OTP
// ==============================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==============================
// Send OTP via Email (using Supabase)
// ==============================
const sendOTPEmail = async (email, otp) => {
  try {
    // For now, we'll use a simple approach
    // In production, you should use a proper email service like SendGrid, Mailgun, or Supabase Edge Functions
    
    // Option 1: Use Supabase Edge Function for email (recommended)
    // const { data, error } = await supabase.functions.invoke('send-otp-email', {
    //   body: { email, otp }
    // });
    
    // Option 2: Use external email service (example with axios)
    // const emailResponse = await axios.post('https://your-email-service.com/send', {
    //   to: email,
    //   subject: 'Kode OTP Registrasi',
    //   html: `
    //     <h2>Kode OTP Anda</h2>
    //     <p>Kode OTP untuk registrasi adalah: <strong>${otp}</strong></p>
    //     <p>Kode ini berlaku selama 10 menit.</p>
    //     <p>Jangan bagikan kode ini kepada siapapun.</p>
    //   `
    // });
    
    // For development/testing, we'll just log the OTP
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`📧 Email content: Kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Send OTP via SMS
// ==============================
const sendOTPSMS = async (phone, otp) => {
  try {
    // For development/testing, we'll just log the OTP
    // In production, you should use SMS service like Twilio, Vonage, or local SMS gateway
    
    // Option 1: Use Twilio
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // const message = await client.messages.create({
    //   body: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });
    
    // Option 2: Use local SMS gateway
    // const smsResponse = await axios.post('https://your-sms-gateway.com/send', {
    //   phone: phone,
    //   message: `Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`
    // });
    
    // For development/testing, we'll just log the OTP
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    console.log(`📱 SMS content: Kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    return { success: false, error: error.message };
  }
};

// ==============================
// Register with Email OTP
// ==============================
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

// ==============================
// Register with Phone OTP
// ==============================
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

// ==============================
// Verify Email OTP and Complete Registration
// ==============================
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

// ==============================
// Verify Phone OTP and Complete Registration
// ==============================
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

// ==============================
// Login with Phone
// ==============================
const loginWithPhone = async (req, res) => {
  const { phone, password } = req.body;

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

    // Find user in memory storage
    const user = phoneUsers.get(normalizedPhone);

    if (!user) {
      return res.status(401).json({ error: 'Nomor telepon tidak terdaftar' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Password salah' });
    }

    console.log('Phone login successful for:', normalizedPhone);

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      },
      auth_type: 'phone'
    });

  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ error: 'Gagal login: ' + error.message });
  }
};

// ==============================
// Resend Email OTP
// ==============================
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

// ==============================
// Resend Phone OTP
// ==============================
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

// =============================================
// Get All Users (Admin Only)
// =============================================
const getAllUsers = async (req, res) => {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    return res.status(500).json({ error: 'Gagal mengambil data pengguna: ' + error.message });
  }

  // Membersihkan data sebelum dikirim ke client
  const sanitizedUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.user_metadata.role,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
  }));

  res.json(sanitizedUsers);
};

// =============================================
// Facebook Login
// =============================================
const facebookLogin = async (req, res) => {
  const { access_token } = req.body;

  console.log('Facebook login attempt with token:', access_token ? 'Token provided' : 'No token');

  if (!access_token) {
    return res.status(400).json({ error: 'Facebook access token dibutuhkan' });
  }

  try {
    console.log('Verifying Facebook token...');
    
    // 1. Verifikasi token ke Facebook Graph API
    const fbResponse = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        access_token: access_token,
        fields: 'id,name,email,picture,gender,birthday'
      }
    });

    console.log('Facebook API response received');
    
    const { id: facebook_id, name, email, picture, gender, birthday } = fbResponse.data;

    // 2. Cek apakah user sudah ada di database berdasarkan facebook_id
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('facebook_id', facebook_id)
      .single();

    let user;

    if (existingUser) {
      console.log('Existing Facebook user found, updating data...');
      
      // User sudah ada, update data terbaru
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          name: name,
          email: email,
          profile_picture: picture?.data?.url,
          gender: gender,
          birthday: birthday,
          updated_at: new Date()
        })
        .eq('facebook_id', facebook_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Gagal update user: ' + updateError.message });
      }

      user = updatedUser;
    } else {
      console.log('New Facebook user, creating account...');
      
      // User baru, buat record baru
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          facebook_id: facebook_id,
          name: name,
          email: email,
          profile_picture: picture?.data?.url,
          gender: gender,
          birthday: birthday,
          role: 'user',
          email_verified: true, // Facebook users are pre-verified
          created_at: new Date()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Gagal create user: ' + createError.message });
      }

      user = newUser;
    }

    // 3. Generate JWT token atau session
    // Untuk sementara, kita return data user dengan flag facebook_login
    console.log('Facebook login successful for user:', user.id);

    res.json({
      message: 'Facebook login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
        role: user.role,
        facebook_id: user.facebook_id
      },
      auth_type: 'facebook',
      access_token: access_token // Return token untuk mobile app
    });

  } catch (error) {
    console.error('Facebook login error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Token Facebook tidak valid atau expired' });
    }
    
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'Request Facebook gagal', 
        detail: error.response.data 
      });
    }
    
    return res.status(500).json({ error: 'Gagal login dengan Facebook: ' + error.message });
  }
};

// ==============================
// Login User
// ==============================
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password dibutuhkan' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(401).json({ error: 'Login gagal: ' + error.message });
  }

  const role = data.user.user_metadata.role || 'user';

  res.json({ 
    message: 'Login berhasil', 
    role: role,
    session: data.session 
  });
};

module.exports = {
  register,
  registerWithPhone,
  verifyOTP,
  verifyPhoneOTP,
  resendOTP,
  resendPhoneOTP,
  login,
  loginWithPhone,
  getAllUsers,
  facebookLogin,
}; 