const supabase = require('../config/supabaseClient');

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

module.exports = { checkRole }; 