const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debt.controller');
const { verifyToken, requireVerified } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/v1/debt/dashboard-summary
 * @desc    Get live outstanding debt totals from the debt API
 * @access  Verified users
 */
router.get(
    '/dashboard-summary',
    verifyToken,
    requireVerified,
    debtController.getDashboardSummary
);

/**
 * @route   POST /api/v1/debt/enrich-sales
 * @desc    Batch-fetch debt status for a list of sale IDs
 * @body    { saleIds: string[] }
 * @access  Verified users
 */
router.post(
    '/enrich-sales',
    verifyToken,
    requireVerified,
    debtController.enrichSales
);

module.exports = router;
