const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5173'],
  credentials: true
}));

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const stationRoutes = require('./routes/stationRoutes');
const xpRoutes = require('./routes/xpRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const rateRoutes = require('./routes/rateRoutes');
const systemRoutes = require('./routes/systemRoutes');

// Basic route
app.get('/', (req, res) => {
  res.send('R.ONE API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/xppacks', xpRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/system', systemRoutes);

const PORT = process.env.PORT || 5000;

// Self-ping mechanism to keep Render free tier awake
const https = require('https');
setInterval(() => {
  const backendUrl = process.env.BACKEND_URL;
  if (backendUrl) {
    console.log(`Pinging ${backendUrl} to keep server awake...`);
    https.get(backendUrl, (resp) => {
      if (resp.statusCode === 200) console.log('Self-ping successful');
      else console.log('Self-ping failed with status:', resp.statusCode);
    }).on("error", (err) => {
      console.log("Self-ping Error: " + err.message);
    });
  }
}, 14 * 60 * 1000); // 14 minutes

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
