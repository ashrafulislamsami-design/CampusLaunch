require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { sendFundingDeadlineAlerts } = require('./controllers/fundingController');
const { sendPitchDeadlineAlerts } = require('./controllers/pitchNotificationController');
const { sendMentorSessionReminders } = require('./controllers/mentorNotificationController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running correctly and connected!' });
});

// Profile Routes (Student Entrepreneur Profiles)
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profiles', profileRoutes);

// Mentor Routes
const mentorRoutes = require('./routes/mentorRoutes');
app.use('/api/mentors', mentorRoutes);

// Booking Routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

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

// AI Routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Leaderboard Routes
const leaderboardRoutes = require('./routes/leaderboardRoutes');
app.use('/api/leaderboard', leaderboardRoutes);

// Resource Routes
const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

// =========================================================================
// Canvas Builder (Business Model Canvas) — additive, namespaced under /canvas
// =========================================================================
const canvasRoutes = require('./routes/canvasRoutes');
app.use('/api/canvas', canvasRoutes);

// =========================================================================
// Automated Email Communication System (Resend) — additive, /api/email
// =========================================================================
const emailRoutes = require('./routes/emailRoutes');
app.use('/api/email', emailRoutes);


// =========================================================================
// Event Discovery & Registration Hub — additive, namespaced /api/hub
// =========================================================================
const eventHubRoutes = require('./routes/eventHubRoutes');
app.use('/api/hub', eventHubRoutes);

// =========================================================================
// Pitch Deck Feedback & Scoring System — additive, /api/decks
// =========================================================================
const deckRoutes = require('./routes/deckRoutes');
app.use('/api/decks', deckRoutes);

// =========================================================================
// Admin Panel & Verification System — /api/admin
// =========================================================================
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

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

const PORT = process.env.PORT || 3001;

// =========================================================================
// Canvas Builder: HTTP server + Socket.io initialization (additive).
// Wraps the express app so Socket.io can attach. The listen call below
// replaces the original app.listen() by necessity (socket.io requires a raw
// http.Server). Everything else is unchanged.
// =========================================================================
const http = require('http');
const { Server: IOServer } = require('socket.io');
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});
const initCanvasSocket = require('./sockets/canvasSocket');
initCanvasSocket(io);

// =========================================================================
// Global Error Handler Middleware
// =========================================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  console.error(err.stack);
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  
  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  
  res.status(500).json({ message: 'Server Error' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Run funding watchlist deadline alerts every hour.
cron.schedule('0 * * * *', async () => {
  try {
    await sendFundingDeadlineAlerts();
    await sendPitchDeadlineAlerts();
    await sendMentorSessionReminders();
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
  sendMentorSessionReminders().catch((error) => {
    console.error('Initial mentor reminder scan error:', error.message);
  });
}, 15000);

// =========================================================================
// Email Cron Jobs (Automated Email Communication System) — additive block
// =========================================================================
try {
  const { scheduleWeeklyDigest } = require('./jobs/weeklyDigestJob');
  const { scheduleSessionReminders } = require('./jobs/sessionReminderJob');
  const { scheduleFundingReminders } = require('./jobs/fundingReminderJob');
  const { schedulePitchEventReminders } = require('./jobs/pitchEventReminderJob');
  scheduleWeeklyDigest();
  scheduleSessionReminders();
  scheduleFundingReminders();
  schedulePitchEventReminders();
} catch (err) {
  console.error('Failed to schedule email cron jobs:', err.message);
}
