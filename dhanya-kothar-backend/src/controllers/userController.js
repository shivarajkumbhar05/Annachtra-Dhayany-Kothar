const User = require('../models/User');
const { ROLES } = require('../config/constants');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const audit = require('../utils/audit');

exports.list = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) throw new ApiError(400, 'Name, username and password are required');
  if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  if (role && !Object.values(ROLES).includes(role)) throw new ApiError(400, 'Invalid role');
  if (await User.findOne({ username: username.toLowerCase() })) throw new ApiError(409, 'Username already exists');

  const user = await User.create({ name, username, password, role });
  await audit(req.user._id, 'CREATE_USER', `Created user ${user.username} (${user.role})`);
  res.status(201).json({ success: true, user: { id: user._id, name: user.name, username: user.username, role: user.role, status: user.status } });
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  const { name, role, status } = req.body;

  if (String(user._id) === String(req.user._id) && ((status && status !== 'active') || (role && role !== ROLES.ADMIN)))
    throw new ApiError(400, 'You cannot disable or demote your own account');

  if (name) user.name = name;
  if (role) {
    if (!Object.values(ROLES).includes(role)) throw new ApiError(400, 'Invalid role');
    user.role = role;
  }
  if (status) {
    if (!['active', 'disabled'].includes(status)) throw new ApiError(400, 'Invalid status');
    user.status = status;
  }
  await user.save();
  await audit(req.user._id, 'UPDATE_USER', `Updated user ${user.username}`);
  res.json({ success: true, user });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.password = newPassword;
  await user.save();
  await audit(req.user._id, 'RESET_PASSWORD', `Reset password for ${user.username}`);
  res.json({ success: true, message: 'Password reset' });
});
