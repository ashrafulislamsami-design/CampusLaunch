const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// @route   POST /api/auth/register
// @desc    Register a new user
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      role,
      university,
      department,
      graduationYear,
      skills,
      lookingFor,
      jobDetails,
      linkedinUrl,
      expertise,
      hoursPerWeek,
      workStyle,
      ideaStage,
      adminSecret
    } = req.body;

    // Validate admin registration
    if (role === 'Admin') {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Invalid admin secret key' });
      }
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const normalizedLookingFor = Array.isArray(lookingFor)
      ? lookingFor.map((s) => String(s).trim()).filter(Boolean)
      : [];

    if (role === 'Student' && normalizedSkills.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required for students' });
    }
    if (role === 'Student' && normalizedLookingFor.length === 0) {
      return res.status(400).json({ message: 'At least one interest is required for students' });
    }
    if (role === 'Mentor' && !jobDetails) {
      return res.status(400).json({ message: 'Job details are required for mentors' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user instance
    user = new User({
      name,
      email,
      password,
      role,
      university,
      department,
      graduationYear,
      skills: normalizedSkills,
      lookingFor: normalizedLookingFor,
      jobDetails,
      linkedinUrl,
      expertise,
      hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : null,
      workStyle: workStyle || null,
      ideaStage: ideaStage || null,
      // Organizers start as pending until admin verifies them
      ...(role === 'Organizer' && { organizerVerified: 'pending' }),
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Fire-and-forget welcome email (additive; never blocks response)
    try {
      emailService.sendWelcomeEmail(user).catch((e) =>
        console.error('Welcome email failed:', e.message)
      );
    } catch (e) { console.error('Welcome email dispatch failed:', e.message); }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, message: 'User registered successfully' });
      }
    );
  } catch (err) {
    console.error(err.message);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, message: 'Logged in successfully' });
      }
    );
  } catch (err) {
    console.error(err.message);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @route   GET /api/auth/me
// @desc    Get user profile with Team Role
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let teamRole = null;
    const Team = require('../models/Team');
    const team = await Team.findOne({ 'members.userId': req.user.id });
    if (team) {
      const mem = team.members.find(m => m.userId.toString() === req.user.id);
      if (mem) teamRole = mem.role;
    }

    res.json({ ...user.toObject(), teamRole });
  } catch (err) {
    console.error(err.message);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
