const supabase = require('../config/supabaseClient');
const axios = require('axios');

/**
 * Middleware untuk memeriksa apakah pengguna memiliki peran yang diizinkan.
 * @param {Array<string>} allowedRoles - Array berisi string peran yang diizinkan, misal ['admin', 'manager'].
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    // 1. Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Akses ditolak: Token tidak disediakan.' });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verifikasi token dan dapatkan data pengguna dari Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Akses ditolak: Token tidak valid.' });
    }

    // 3. Dapatkan peran pengguna dari metadata
    const userRole = user.user_metadata.role;

    // 4. Periksa apakah peran pengguna termasuk dalam peran yang diizinkan
    if (allowedRoles.includes(userRole)) {
      // Jika peran sesuai, lampirkan data pengguna ke request dan lanjutkan
      req.user = user;
      next();
    } else {
      // Jika peran tidak sesuai, kirim error 403 Forbidden
      return res.status(403).json({ error: 'Akses ditolak: Anda tidak memiliki izin yang cukup.' });
    }
  };
};

/**
 * Middleware untuk memverifikasi Facebook access token
 */
const verifyFacebookToken = async (req, res, next) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'Facebook access token dibutuhkan' });
  }

  try {
    // Verifikasi token ke Facebook Graph API
    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        access_token: access_token,
        fields: 'id,name,email'
      }
    });

    // Token valid, lampirkan data Facebook ke request
    req.facebookUser = response.data;
    next();
  } catch (error) {
    console.error('Facebook token verification failed:', error.message);
    return res.status(401).json({ error: 'Token Facebook tidak valid atau expired' });
  }
};

/**
 * Middleware untuk memeriksa apakah user sudah login (email atau Facebook)
 */
const requireAuth = async (req, res, next) => {
  // Cek token dari header Authorization
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      console.error('Token verification error:', error);
    }
  }

  // Cek Facebook token dari body
  const { access_token } = req.body;
  
  if (access_token) {
    try {
      const response = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          access_token: access_token,
          fields: 'id,name,email'
        }
      });
      
      req.facebookUser = response.data;
      return next();
    } catch (error) {
      console.error('Facebook token verification error:', error);
    }
  }

  return res.status(401).json({ error: 'Akses ditolak: Autentikasi diperlukan.' });
};

module.exports = { 
  checkRole, 
  verifyFacebookToken, 
  requireAuth 
}; 