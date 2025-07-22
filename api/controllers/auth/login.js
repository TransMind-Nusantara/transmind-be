const supabase = require('../../config/supabaseClient');
const axios = require('axios');
const bcrypt = require('bcrypt');

/**
 * Fungsi untuk cek apakah password plain cocok dengan hash password
 * @param {string} plainPassword - Password yang diinput user
 * @param {string} hashedPassword - Password yang sudah di-hash
 * @returns {Promise<boolean>} - True jika cocok, false jika tidak
 */
async function checkPasswordHash(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

const loginWithPhone = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Nomor telepon dan password dibutuhkan' });
  }

  try {
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = '+62' + phone.substring(1);
    } else if (phone.startsWith('62')) {
      normalizedPhone = '+' + phone;
    }

    const { data: userData, error } = await supabase.from("users").select("*").eq("phone", normalizedPhone).single()

    if (error || !userData) {
      return res.status(401).json({ error: "Nomor telepon tidak terdaftar" })
    }

    // Compare hashed password
    const isPasswordValid = checkPasswordHash(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password salah' });
    }

    res.json({
      message: 'Login berhasil',
      user: {
        id: userData.id,
        phone: userData.phone,
        name: userData.name,
        role: userData.role || 'user'
      },
      auth_type: 'phone'
    });

  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ error: 'Gagal login: ' + error.message });
  }
};

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

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password dibutuhkan' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        return res.status(401).json({ message: 'Login gagal: Email atau password salah.' + error });
    }

    res.status(200).json({
        message: 'Login berhasil',
        user: data.user,
        session: data.session
    });
};

module.exports = {
  loginWithPhone, facebookLogin, login
}