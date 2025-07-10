const supabaseAdmin = require('../../config/supabaseAdmin');

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
  getAllUsers,
}; 