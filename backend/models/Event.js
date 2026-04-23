const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  link: { type: String },
  attendees: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
