const express = require("express")
const router = express.Router()

const registerController = require("../../controllers/auth/register")

router.post('/register', registerController.register);
router.post('/register-phone', registerController.registerWithPhone);

module.exports = router