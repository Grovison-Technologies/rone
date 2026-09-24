const express = require('express');
const router = express.Router();
const { loginStaff, loginCustomer, logout } = require('../controllers/authController');

router.post('/login', loginStaff);
router.post('/customer/login', loginCustomer);
router.post('/logout', logout);

module.exports = router;
