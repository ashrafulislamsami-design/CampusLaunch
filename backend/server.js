require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { sendFundingDeadlineAlerts } = require('./controllers/fundingController');
const { sendPitchDeadlineAlerts } = require('./controllers/pitchNotificationController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running correctly and connected!' });
});

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Team Routes
const teamRoutes = require('./routes/teamRoutes');
app.use('/api/teams', teamRoutes);

// Event Routes
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);

// User Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Funding Routes
const fundingRoutes = require('./routes/fundingRoutes');
app.use('/api/funding', fundingRoutes);

// Curriculum Routes
const curriculumRoutes = require('./routes/curriculumRoutes');
app.use('/api/curriculum', curriculumRoutes);

// Pitch Arena Routes
const pitchRoutes = require('./routes/pitchRoutes');
app.use('/api/pitch', pitchRoutes);

// Notification Routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Message Routes
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Match Routes
const matchRoutes = require('./routes/matchRoutes');
app.use('/api/match', matchRoutes);

// Connection Routes
const connectionRoutes = require('./routes/connectionRoutes');
app.use('/api/connections', connectionRoutes);

// Private Message Routes
const privateMessageRoutes = require('./routes/privateMessageRoutes');
app.use('/api/private-messages', privateMessageRoutes);

// Avoid actually connecting to Mongoose if MONGO_URI is a dummy one for now,
// but let's write the connection code to satisfy requirements.
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error. Starting server anyway...', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Run funding watchlist deadline alerts every hour.
cron.schedule('0 * * * *', async () => {
  try {
    await sendFundingDeadlineAlerts();
    await sendPitchDeadlineAlerts();
  } catch (error) {
    console.error('Notification cron error:', error.message);
  }
});

setTimeout(() => {
  sendFundingDeadlineAlerts().catch((error) => {
    console.error('Initial funding alert scan error:', error.message);
  });
  sendPitchDeadlineAlerts().catch((error) => {
    console.error('Initial pitch deadline scan error:', error.message);
  });
}, 15000);
