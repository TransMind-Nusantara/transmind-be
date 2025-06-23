const supabase = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');

// ==============================
// Register New User
// ==============================
const register = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password dibutuhkan' });
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        role: role || 'user',
      }
    }
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ message: 'Pengguna berhasil dibuat. Silakan verifikasi email Anda.', user: data.user });
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

module.exports = {
  register,
  login,
  getAllUsers,
}; 