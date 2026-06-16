const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      currentMode: 'buyer',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentMode: user.currentMode,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      currentMode: user.currentMode,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currentMode: req.user.currentMode,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const switchMode = async (req, res) => {
  try {
    const { mode } = req.body;

    if (!mode || !['buyer', 'seller'].includes(mode)) {
      return res.status(400).json({ message: 'Mode must be "buyer" or "seller"' });
    }

    req.user.currentMode = mode;
    await req.user.save();

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currentMode: req.user.currentMode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile, switchMode };
