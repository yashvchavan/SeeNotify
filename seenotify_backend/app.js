require('dotenv').config(); // Add this at the very top

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const sessionConfig = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:19006', 'http://10.0.2.2:19006'], // Update with your React Native dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionConfig);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});