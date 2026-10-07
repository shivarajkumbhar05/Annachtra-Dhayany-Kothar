const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const audit = require('../utils/audit');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
const publicUser = (u) => ({ id: u._id, name: u.name, username: u.username, role: u.role, status: u.status });

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new ApiError(400, 'Username and password are required');

  const user = await User.findOne({ username: String(username).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password)) || user.status !== 'active')
    throw new ApiError(401, 'Invalid login credentials.');

  await audit(user._id, 'LOGIN', `${user.username} logged in`);
  res.json({ success: true, token: sign(user._id), user: publicUser(user) });
});

exports.me = asyncHandler(async (req, res) => res.json({ success: true, user: publicUser(req.user) }));

exports.logout = asyncHandler(async (req, res) => {
  await audit(req.user._id, 'LOGOUT', `${req.user.username} logged out`);
  res.json({ success: true, message: 'Logged out' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) throw new ApiError(400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) throw new ApiError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  await audit(user._id, 'CHANGE_PASSWORD', 'Password changed');
  res.json({ success: true, message: 'Password updated' });
});
