const express = require('express');
const router = express.Router();
const planeTicketController = require('../../controllers/plane/planeTicketController');
const { checkRole } = require('../../middleware/authMiddleware');

router.get("/search-flight", planeTicketController.searchPlaneTicket)

router.get('/', planeTicketController.getAllBookings);

router.put('/:id', planeTicketController.updateBooking);

router.get('/summary', checkRole(['admin']), (req, res) => {
  res.json({
    message: `Selamat datang, Admin ${req.user.email}!`,
    summary: {
      total_bookings: 150,
      total_revenue: 50000,
    }
  });
});

module.exports = router;
