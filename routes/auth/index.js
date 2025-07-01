const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { checkRole } = require('../../middleware/authMiddleware');

// Rute untuk registrasi, menunjuk ke fungsi 'register' di controller
router.post('/register', authController.register);

// Rute untuk login, menunjuk ke fungsi 'login' di controller
router.post('/login', authController.login);

// Rute untuk Facebook login
router.post('/facebook', authController.facebookLogin);

// Rute untuk registrasi dengan phone OTP
router.post('/register-phone', authController.registerWithPhone);

// Rute untuk verifikasi OTP email
router.post('/verify-otp', authController.verifyOTP);

// Rute untuk verifikasi OTP phone
router.post('/verify-phone-otp', authController.verifyPhoneOTP);

// Rute untuk resend OTP email
router.post('/resend-otp', authController.resendOTP);

// Rute untuk resend OTP phone
router.post('/resend-phone-otp', authController.resendPhoneOTP);

// Rute untuk login dengan phone
router.post('/login-phone', authController.loginWithPhone);

// Rute untuk mengambil semua pengguna (hanya untuk admin)
router.get('/users', checkRole(['admin']), authController.getAllUsers);

module.exports = router; 