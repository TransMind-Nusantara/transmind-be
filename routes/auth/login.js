const express = require('express');
const router = express.Router()

const loginController = require("../../controllers/auth/login")

router.post("/sign-in", loginController.login)
router.post("/phone-sign-in", loginController.loginWithPhone)

module.exports = router