const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
const bookingsRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const generalRoutes = require('./routes/general');

// Gunakan Rute
app.use('/', generalRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/auth', authRoutes);

// Jalankan Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

