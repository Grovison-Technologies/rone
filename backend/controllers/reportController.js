const WalletTransaction = require('../models/WalletTransaction');
const Session = require('../models/Session');
const Payment = require('../models/Payment');

// @desc    Get basic revenue & usage reports
// @route   GET /api/reports/summary
// @access  Private (Owner only)
exports.getSummaryReport = async (req, res) => {
  try {
    let start = new Date();
    start.setHours(0, 0, 0, 0);
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (req.query.startDate) {
      start = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      end = new Date(req.query.endDate);
      // Only set hours if the date string doesn't contain time (e.g. YYYY-MM-DD)
      if (req.query.endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
    }

    const dateFilter = { $gte: start, $lte: end };

    const todayPayments = await Payment.find({
      createdAt: dateFilter,
      status: 'COMPLETED'
    });
    const todaysRevenue = todayPayments.reduce((acc, curr) => acc + curr.amount, 0);

    const todaySessions = await Session.find({
      startedAt: dateFilter
    });
    
    let activeSessionsCount = 0;
    let completedSessionsCount = 0;
    let totalXPConsumedToday = 0;

    todaySessions.forEach(session => {
      if (session.status === 'ACTIVE' || session.status === 'PAUSED') {
        activeSessionsCount++;
      } else if (session.status === 'COMPLETED' || session.status === 'XP_EXHAUSTED') {
        completedSessionsCount++;
        totalXPConsumedToday += session.totalXPUsed;
      }
    });

    const Customer = require('../models/Customer');
    const newCustomersCount = await Customer.countDocuments({
      createdAt: dateFilter
    });

    res.json({
      todaysRevenue,
      totalSessionsToday: todaySessions.length,
      activeSessionsCount,
      completedSessionsCount,
      totalXPConsumedToday,
      newCustomersCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all wallet transactions for auditing
// @route   GET /api/reports/transactions
// @access  Private (Owner only)
exports.getTransactions = async (req, res) => {
  try {
    let query = {};
    if (req.query.startDate && req.query.endDate) {
      let end = new Date(req.query.endDate);
      if (req.query.endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
      query.createdAt = { $gte: new Date(req.query.startDate), $lte: end };
    }

    const transactions = await WalletTransaction.find(query)
      .populate('customer', 'name rOneId')
      .populate('staffResponsible', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get session logs
// @route   GET /api/reports/sessions
// @access  Private (Owner only)
exports.getSessionLogs = async (req, res) => {
  try {
    let query = {};
    if (req.query.startDate && req.query.endDate) {
      let end = new Date(req.query.endDate);
      if (req.query.endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
      query.startedAt = { $gte: new Date(req.query.startDate), $lte: end };
    }

    const sessions = await Session.find(query)
      .populate('station', 'displayName consoleType')
      .populate('payerCustomer', 'name rOneId mobile')
      .populate('createdBy', 'name')
      .sort({ startedAt: -1 })
      .limit(100);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
