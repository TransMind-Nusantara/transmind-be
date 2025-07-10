const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: 'auto',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
}));

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
}));

// Middleware untuk parsing body JSON, cukup sekali saja
app.use(express.json());

// Import Rute
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const generalRoutes = require('./routes/general');
const adminRoutes = require("./routes/admin/index")

// Gunakan Rute
app.use('/', generalRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Jalankan server jika tidak di Vercel (untuk development)
if (process.env.NODE_ENV !== 'production') {
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
}

// Export app untuk Vercel
module.exports = app;

