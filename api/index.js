const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

app.use(express.json());

const authRoutes = require('./routes/auth');
const planeRoutes = require('./routes/plane');
const generalRoutes = require('./routes/general');
const adminRoutes = require("./routes/admin/index")
const userRoutes = require("./routes/user/profiles")

app.use('/', generalRoutes);
app.use('/api/plane', planeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

if (process.env.NODE_ENV !== 'production') {
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
}

// Export app untuk Vercel
module.exports = app;

