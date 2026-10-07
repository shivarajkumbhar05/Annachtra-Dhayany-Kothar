const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');
const { ADMIN, OPERATOR, VIEWER } = ROLES;

const auth = require('../controllers/authController');
const users = require('../controllers/userController');
const materials = require('../controllers/materialController');
const receipts = require('../controllers/receiptController');
const dashboard = require('../controllers/dashboardController');
const reports = require('../controllers/reportController');
const settings = require('../controllers/settingController');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many login attempts. Try again later.' } });

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Auth
router.post('/auth/login', loginLimiter, auth.login);
router.get('/auth/me', protect, auth.me);
router.post('/auth/logout', protect, auth.logout);
router.put('/auth/change-password', protect, auth.changePassword);

// Dashboard
router.get('/dashboard', protect, dashboard.summary);

// Receipts
router.post('/receipts', protect, authorize(ADMIN, OPERATOR), receipts.create);
router.get('/receipts', protect, receipts.list);
router.get('/receipts/number/:number', protect, receipts.getByNumber);
router.get('/receipts/:id', protect, receipts.getOne);
router.post('/receipts/:id/reprint', protect, authorize(ADMIN, OPERATOR), receipts.reprint);
router.put('/receipts/:id', protect, authorize(ADMIN), receipts.update);

// Materials
router.get('/materials/units', protect, materials.units);
router.get('/materials', protect, materials.list);
router.post('/materials', protect, authorize(ADMIN), materials.create);
router.put('/materials/:id', protect, authorize(ADMIN), materials.update);
router.delete('/materials/:id', protect, authorize(ADMIN), materials.disable);

// Reports
router.get('/reports/daily', protect, authorize(ADMIN, VIEWER), reports.daily);
router.get('/reports/weekly', protect, authorize(ADMIN, VIEWER), reports.weekly);
router.get('/reports/monthly', protect, authorize(ADMIN, VIEWER), reports.monthly);
router.get('/reports/material-wise', protect, authorize(ADMIN, VIEWER), reports.materialWise);

// Users (admin)
router.get('/users', protect, authorize(ADMIN), users.list);
router.post('/users', protect, authorize(ADMIN), users.create);
router.put('/users/:id', protect, authorize(ADMIN), users.update);
router.put('/users/:id/reset-password', protect, authorize(ADMIN), users.resetPassword);

// Settings & audit
router.get('/settings', protect, settings.get);
router.put('/settings', protect, authorize(ADMIN), settings.update);
router.get('/audit-logs', protect, authorize(ADMIN), settings.auditLogs);

module.exports = router;
