const express = require('express');
const router = express.Router();

const adminUsersRoutes = require('../admin/users')

router.use(adminUsersRoutes)

module.exports = router; 