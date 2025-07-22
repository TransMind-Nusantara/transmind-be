const express = require('express');
const router = express.Router();

const otpController = require("../../controllers/auth/otps")

router.post('/verify-otp', otpController.verifyOTP);
router.post('/verify-phone-otp', otpController.verifyPhoneOTP);
router.post('/resend-otp', otpController.resendOTP);
router.post('/resend-phone-otp', otpController.resendPhoneOTP);

module.exports = router