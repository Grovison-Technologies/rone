const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Staff/Owner)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    // Also fetch their wallets
    const customersWithWallets = await Promise.all(customers.map(async (c) => {
      const wallet = await Wallet.findOne({ customer: c._id });
      // Clean up expired bonus XP before returning
      if (wallet && wallet.bonusXPExpiresAt && new Date() > wallet.bonusXPExpiresAt) {
        wallet.bonusXP = 0;
        wallet.bonusXPExpiresAt = undefined;
        await wallet.save();
      }
      return { ...c.toObject(), wallet };
    }));
    res.json(customersWithWallets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private (Staff/Owner)
exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile, email, dateOfBirth, pin } = req.body;

    const customerExists = await Customer.findOne({ mobile });
    if (customerExists) {
      return res.status(400).json({ message: 'Customer with this mobile already exists' });
    }

    // Generate R.ONE ID (simple logic: RON- + random 4 digits)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const rOneId = `RON-${randomNum}`;

    const customer = await Customer.create({
      rOneId,
      name,
      mobile,
      email,
      dateOfBirth,
      pin,
    });

    // Automatically create a wallet for the customer
    const wallet = await Wallet.create({
      customer: customer._id,
      purchasedXP: 0,
      bonusXP: 0
    });

    res.status(201).json({ customer, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get customer profile with wallet
// @route   GET /api/customers/:id
// @access  Private (Staff/Owner)
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const wallet = await Wallet.findOne({ customer: customer._id });
    res.json({ customer, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in customer profile
// @route   GET /api/customers/me
// @access  Private (Customer)
exports.getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    const wallet = await Wallet.findOne({ customer: customer._id });
    res.json({
      ...customer.toObject(),
      wallet
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in customer transactions
// @route   GET /api/customers/me/transactions
// @access  Private (Customer)
exports.getMyTransactions = async (req, res) => {
  try {
    const WalletTransaction = require('../models/WalletTransaction');
    const transactions = await WalletTransaction.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get specific customer transactions
// @route   GET /api/customers/:id/transactions
// @access  Private (Staff/Owner)
exports.getCustomerTransactions = async (req, res) => {
  try {
    const WalletTransaction = require('../models/WalletTransaction');
    const transactions = await WalletTransaction.find({ customer: req.params.id })
      .populate('staffResponsible', 'name')
      .populate('relatedSession', 'sessionNumber gameName totalXPUsed')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update customer details
// @route   PUT /api/customers/:id
// @access  Private (Staff/Owner)
exports.updateCustomer = async (req, res) => {
  try {
    const { name, mobile, pin } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (name) customer.name = name;
    if (mobile) customer.mobile = mobile;
    if (pin) customer.pin = pin;

    await customer.save();

    res.json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Mobile number already in use' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add XP to a customer's wallet
// @route   POST /api/customers/:id/add-xp
// @access  Private (Staff/Owner)
exports.addXP = async (req, res) => {
  try {
    const { baseXP, bonusXP, amountPaid, paymentMethod, validityDays } = req.body;
    const customerId = req.params.id;

    const wallet = await Wallet.findOne({ customer: customerId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const previousXP = wallet.totalAvailableXP;
    const totalXPToAdd = (Number(baseXP) || 0) + (Number(bonusXP) || 0);

    wallet.purchasedXP += (Number(baseXP) || 0);
    
    // Add bonus XP and update expiration if provided
    const addedBonus = Number(bonusXP) || 0;
    if (addedBonus > 0) {
      wallet.bonusXP += addedBonus;
      wallet.lifetimeBonusEarned += addedBonus;
      if (validityDays) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + Number(validityDays));
        // Simple logic: if they already have an expiry, extend it or overwrite it
        wallet.bonusXPExpiresAt = expiry;
      }
    }
    await wallet.save();

    const WalletTransaction = require('../models/WalletTransaction');
    const Payment = require('../models/Payment');

    const transaction = await WalletTransaction.create({
      wallet: wallet._id,
      customer: customerId,
      type: 'MANUAL_ADD',
      amount: totalXPToAdd,
      beforeBalance: previousXP,
      afterBalance: wallet.totalAvailableXP,
      staffResponsible: req.user.id
    });

    if (amountPaid > 0) {
      await Payment.create({
        paymentNumber: 'PAY-' + Date.now(),
        customer: customerId,
        amount: amountPaid,
        paymentMethod: paymentMethod || 'CASH',
        status: 'COMPLETED',
        xpPurchased: Number(baseXP) || 0,
        bonusXP: Number(bonusXP) || 0,
        staffResponsible: req.user.id
      });
    }

    res.json({ message: 'XP added successfully', wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get current customer profile
// @route   GET /api/customers/me
// @access  Private (Customer)
exports.getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select('-pin');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const wallet = await Wallet.findOne({ customer: customer._id });
    res.json({ ...customer.toObject(), wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get current customer transactions
// @route   GET /api/customers/me/transactions
// @access  Private (Customer)
exports.getMyTransactions = async (req, res) => {
  try {
    const WalletTransaction = require('../models/WalletTransaction');
    const transactions = await WalletTransaction.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Manually adjust XP (Add or Cut)
// @route   POST /api/customers/:id/adjust-xp
// @access  Private (Owner/Staff)
exports.adjustXP = async (req, res) => {
  try {
    const { amount, reason } = req.body; // positive to add, negative to cut
    const customerId = req.params.id;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const wallet = await Wallet.findOne({ customer: customerId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const previousXP = wallet.totalAvailableXP;
    
    // Adjust logic
    if (amount > 0) {
      wallet.bonusXP += Number(amount); 
    } else {
      let toCut = Math.abs(Number(amount));
      if (wallet.bonusXP >= toCut) {
        wallet.bonusXP -= toCut;
      } else {
        toCut -= wallet.bonusXP;
        wallet.bonusXP = 0;
        wallet.purchasedXP = Math.max(0, wallet.purchasedXP - toCut);
      }
    }
    
    await wallet.save();

    const WalletTransaction = require('../models/WalletTransaction');
    await WalletTransaction.create({
      wallet: wallet._id,
      customer: customerId,
      type: amount > 0 ? 'MANUAL_ADD' : 'MANUAL_DEDUCT',
      amount: Number(amount),
      beforeBalance: previousXP,
      afterBalance: wallet.totalAvailableXP,
      staffResponsible: req.user._id
    });

    res.json({ message: 'XP adjusted successfully', wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (Owner)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    await Wallet.findOneAndDelete({ customer: req.params.id });
    await Customer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get leaderboard of top XP burners
// @route   GET /api/customers/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const wallets = await Wallet.find({})
      .sort({ lifetimeXPBurned: -1 })
      .limit(10)
      .populate('customer', 'name rOneId');
    
    // Map to a cleaner format
    const leaderboard = wallets
      .filter(w => w.customer) // safety check
      .map((w, index) => ({
        rank: index + 1,
        name: w.customer.name,
        rOneId: w.customer.rOneId,
        xpBurned: w.lifetimeXPBurned || 0
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
