const { createClient } = require('@supabase/supabase-js');

// Ambil URL dan Kunci Service Role dari environment variables
// Kunci ini memberikan hak akses penuh dan harus dijaga kerahasiaannya.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Buat dan ekspor satu instance dari Supabase client dengan hak akses admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Nonaktifkan auto-refresh token karena ini untuk operasi di sisi server
    autoRefreshToken: false,
    // Jangan simpan sesi di storage karena ini bukan untuk user-facing client
    persistSession: false
  }
});

module.exports = supabaseAdmin; 