const express = require('express');
const router = express.Router();
const generalController = require('../../controllers/general/generalController');

// Import fetch, pastikan Anda telah menginstal node-fetch
// npm install node-fetch@2
// Note: Menggunakan versi 2 untuk kompatibilitas dengan require
const fetch = require('node-fetch');

router.get('/', generalController.getMain);
router.get('/hello', generalController.getHello);
router.put('/username', generalController.updateUsername);
router.get('/flights', generalController.getFlights);

module.exports = router; 