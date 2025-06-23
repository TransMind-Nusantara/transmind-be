const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { checkRole } = require('../../middleware/authMiddleware');

// Rute untuk registrasi, menunjuk ke fungsi 'register' di controller
router.post('/register', authController.register);

// Rute untuk login, menunjuk ke fungsi 'login' di controller
router.post('/login', authController.login);

// Rute untuk mengambil semua pengguna (hanya untuk admin)
router.get('/users', checkRole(['admin']), authController.getAllUsers);

module.exports = router; 