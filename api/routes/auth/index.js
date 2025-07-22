const express = require('express');
const router = express.Router();

const registerRoutes = require('./register')
const loginRoutes = require('./login')
const otpsRoutes = require('./otps')

router.use(registerRoutes)
router.use(loginRoutes)
router.use(otpsRoutes)

module.exports = router; 