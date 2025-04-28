const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({ email, password });
    await user.save();
    
    req.session.userId = user._id;
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: { id: user._id, email: user.email } 
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    req.session.userId = user._id;
    
    res.json({ 
      message: 'Login successful', 
      user: { id: user._id, email: user.email } 
    });
  } catch (error) {
    next(error);
  }
};

exports.checkAuth = (req, res) => {
  res.json({ isAuthenticated: !!req.session.userId });
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};