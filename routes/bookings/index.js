const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/bookingController');
const { checkRole } = require('../../middleware/authMiddleware');

// Definisikan rute dan tautkan ke controller

// GET /bookings -> Ambil semua data booking
router.get('/', bookingController.getAllBookings);

// POST /bookings -> Buat booking baru
router.post('/', bookingController.createBooking);

// PUT /bookings/:id -> Update booking berdasarkan ID
router.put('/:id', bookingController.updateBooking);

// ==========================================================
// Contoh Rute Terproteksi
// ==========================================================
// Rute ini hanya bisa diakses oleh pengguna dengan peran 'admin'.
router.get('/summary', checkRole(['admin']), (req, res) => {
  // Karena sudah lolos middleware, kita bisa yakin req.user ada di sini.
  res.json({
    message: `Selamat datang, Admin ${req.user.email}!`,
    summary: {
      total_bookings: 150,
      total_revenue: 50000,
    }
  });
});

module.exports = router;
