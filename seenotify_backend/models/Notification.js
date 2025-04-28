// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  app: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['all', 'work', 'social', 'promo', 'other'],
    default: 'other'
  },
  time: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);