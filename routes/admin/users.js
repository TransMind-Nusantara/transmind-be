const express = require('express');
const router = express.Router();

const { checkRole } = require('../../middleware/authMiddleware');

const usersController = require('../../controllers/admin/user')

router.get('/users', checkRole(['admin']), usersController.getAllUsers);

module.exports = router