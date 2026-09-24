const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth owner/staff & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();
    
    const user = await User.findOne({ email: lowerEmail });
    
    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'ACTIVE') {
        return res.status(401).json({ message: 'Account is inactive' });
      }
      
      const token = generateToken(user._id, user.role);
      
      const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
      res.cookie('staff_jwt', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth customer & get token
// @route   POST /api/auth/customer/login
// @access  Public
exports.loginCustomer = async (req, res) => {
  try {
    const { mobile, rOneId, pin } = req.body;
    
    // Find by either mobile or rOneId
    const query = mobile ? { mobile } : { rOneId };
    const customer = await Customer.findOne(query);
    
    if (!customer) {
      return res.status(401).json({ message: 'Customer not found' });
    }
    
    if (customer.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Account is blocked' });
    }

    // If PIN is set and provided, verify it
    if (customer.pin && pin) {
      const isMatch = await customer.matchPin(pin);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid PIN' });
      }
    } else if (customer.pin && !pin) {
        return res.status(401).json({ message: 'PIN required' });
    } else {
        // Simple login using Mobile + R.ONE ID (no PIN setup)
        if (mobile && rOneId && customer.rOneId !== rOneId) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    }

    const token = generateToken(customer._id, 'CUSTOMER');
    
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    res.cookie('customer_jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.json({
      _id: customer._id,
      name: customer.name,
      rOneId: customer.rOneId,
      mobile: customer.mobile,
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Logout user/customer / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
  };
  res.cookie('jwt', '', cookieOptions);
  res.cookie('staff_jwt', '', cookieOptions);
  res.cookie('customer_jwt', '', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};
