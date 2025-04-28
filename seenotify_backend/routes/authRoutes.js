const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');

router.post(
  '/register',
  [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 })
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email').isEmail().normalizeEmail(),
    check('password').exists()
  ],
  authController.login
);

router.get('/check-auth', authController.checkAuth);
router.post('/logout', authController.logout);

module.exports = router;