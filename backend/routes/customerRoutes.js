const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  createCustomer, 
  getCustomerById, 
  getMe, 
  getMyTransactions,
  getLeaderboard,
  updateCustomer,
  deleteCustomer,
  addXP,
  adjustXP,
  getCustomerTransactions
} = require('../controllers/customerController');
const { protect, protectCustomer, staff, owner } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, staff, getCustomers)
  .post(protect, staff, createCustomer);

router.get('/me', protectCustomer, getMe);
router.get('/me/transactions', protectCustomer, getMyTransactions);
router.get('/leaderboard', getLeaderboard);

router.route('/:id')
  .get(protect, staff, getCustomerById)
  .put(protect, staff, updateCustomer)
  .delete(protect, owner, deleteCustomer);

router.post('/:id/add-xp', protect, staff, addXP);
router.post('/:id/adjust-xp', protect, staff, adjustXP);
router.get('/:id/transactions', protect, staff, getCustomerTransactions);

module.exports = router;
