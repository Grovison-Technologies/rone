const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies.staff_jwt || req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const protectCustomer = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies.customer_jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Customer.findById(decoded.id).select('-pin');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Customer not found' });
      }
      
      req.user.role = 'CUSTOMER'; // Ensure role is present
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no customer token' });
  }
};

const owner = (req, res, next) => {
  if (req.user && req.user.role === 'OWNER') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as owner' });
  }
};

const staff = (req, res, next) => {
  if (req.user && (req.user.role === 'OWNER' || req.user.role === 'STAFF')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as staff' });
  }
};

module.exports = { protect, protectCustomer, owner, staff };
