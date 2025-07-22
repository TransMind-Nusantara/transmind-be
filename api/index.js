const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// app.get('/swagger.json', (req, res) => {
//   res.sendFile(path.resolve(process.cwd(), 'swagger.json'));
// });

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
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

const allowedOrigins = [
    'http://localhost:3000',
    'https://transmind-be-production.up.railway.app'
];

if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export app untuk Vercel
module.exports = app;

