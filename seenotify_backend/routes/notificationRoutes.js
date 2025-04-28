// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const {requireAuth} = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, message, app, category, metadata } = req.body;
        
        const notification = new Notification({
            title,
            message,
            app,
            category,
            user: req.session.userId,
            metadata: metadata || {}
        });

        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        console.error('Error saving notification:', error);
        res.status(500).json({ message: 'Error saving notification' });
    }
});

module.exports = router;