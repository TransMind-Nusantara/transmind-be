const express = require('express');
const router = express.Router();
const generalController = require('../../controllers/general/generalController');
const { authSupabase } = require('../../middleware/authMiddleware');

router.get('/', generalController.getMain);
router.get('/hello', generalController.getHello);
router.put('/username', generalController.updateUsername);
router.get('/flights', generalController.getFlights);

router.post("/create-multiple-ticket", authSupabase, generalController.createMultiTicket)

module.exports = router; 