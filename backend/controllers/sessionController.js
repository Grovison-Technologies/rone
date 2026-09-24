const Session = require('../models/Session');
const SessionSegment = require('../models/SessionSegment');
const Station = require('../models/Station');
const Customer = require('../models/Customer');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const GameRate = require('../models/GameRate');
const SystemSettings = require('../models/SystemSettings');

// Helper to calculate exact seconds
const getElapsedSeconds = (start, end) => {
  return Math.floor((end.getTime() - start.getTime()) / 1000);
};

// @desc    Get all active or paused sessions
// @route   GET /api/sessions/active
// @access  Private (Staff/Owner)
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: { $in: ['ACTIVE', 'PAUSED'] } })
      .populate('station')
      .populate('payerCustomer')
      .populate('splitPayers');
    
    // Also fetch the current segment to get player count and rate
    const enrichedSessions = await Promise.all(sessions.map(async s => {
      const segment = await SessionSegment.findOne({ session: s._id }).sort({ startedAt: -1 });
      return {
        ...s.toObject(),
        currentSegment: segment
      };
    }));

    res.json(enrichedSessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get my active session
// @route   GET /api/sessions/my-active
// @access  Private (Customer)
exports.getMyActiveSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      $or: [
        { payerCustomer: req.user._id },
        { splitPayers: req.user._id }
      ],
      status: { $in: ['ACTIVE', 'PAUSED'] } 
    }).populate('station').populate('payerCustomer').populate('splitPayers');

    if (!session) return res.json(null);
    
    const segment = await SessionSegment.findOne({ session: session._id }).sort({ startedAt: -1 });
    res.json({ ...session.toObject(), currentSegment: segment });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Start a new gaming session
// @route   POST /api/sessions/start
// @access  Private (Staff/Owner)
  exports.startSession = async (req, res) => {
    try {
      const { customerId, stationId, playerCount, gameName, splitMethod, splitPayers } = req.body;
  
      const station = await Station.findById(stationId);
      if (!station || station.status !== 'AVAILABLE') {
        return res.status(400).json({ message: 'Station is not available' });
      }
  
      const customer = await Customer.findById(customerId);
      if (!customer) return res.status(404).json({ message: 'Primary customer not found' });
  
      const wallet = await Wallet.findOne({ customer: customerId });
      if (!wallet || wallet.totalAvailableXP <= 0) {
        return res.status(400).json({ message: 'Primary customer has insufficient XP to start' });
      }

      // If EQUAL split, check all other payers
      if (splitMethod === 'EQUAL' && splitPayers && splitPayers.length > 0) {
        for (const payerId of splitPayers) {
          const payerWallet = await Wallet.findOne({ customer: payerId });
          if (!payerWallet || payerWallet.totalAvailableXP <= 0) {
            const payerCustomer = await Customer.findById(payerId);
            return res.status(400).json({ message: `Customer ${payerCustomer ? payerCustomer.name : 'Unknown'} has insufficient XP to split.` });
          }
        }
      }
  
      const rate = await GameRate.findOne({ consoleType: station.consoleType, playerCount });
      if (!rate) return res.status(400).json({ message: 'Invalid player count or rate not configured' });
  
      const settings = await SystemSettings.findOne();
      const isOffPeak = settings && settings.isOffPeakModeActive;
      const appliedRate = isOffPeak ? rate.offPeakXPRate : rate.hourlyXPRate;

      // Generate session number
      const sessionNumber = `SESS-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
  
      const session = await Session.create({
        sessionNumber,
        station: station._id,
        payerCustomer: customer._id,
        splitMethod: splitMethod || 'SINGLE',
        splitPayers: splitPayers || [],
        startedAt: now,
        status: 'ACTIVE',
        gameName: gameName || '',
        createdBy: req.user ? req.user._id : null
      });

    await SessionSegment.create({
      session: session._id,
      startedAt: now,
      playerCount,
      hourlyXPRate: appliedRate
    });

    station.status = 'ACTIVE';
    await station.save();

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Pause session
// @route   PUT /api/sessions/:id/pause
// @access  Private (Staff/Owner)
exports.pauseSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Invalid session or already paused' });
    }

    const currentSegment = await SessionSegment.findOne({ session: session._id, endedAt: null });
    if (!currentSegment) return res.status(400).json({ message: 'No active segment found' });

    const now = new Date();
    currentSegment.endedAt = now;
    const elapsedSeconds = getElapsedSeconds(currentSegment.startedAt, now);
    currentSegment.billableSeconds = elapsedSeconds;
    currentSegment.xpConsumed = (currentSegment.hourlyXPRate * elapsedSeconds) / 3600;
    
    await currentSegment.save();

    session.totalBillableSeconds = (session.totalBillableSeconds || 0) + elapsedSeconds;
    session.totalXPUsed = (session.totalXPUsed || 0) + currentSegment.xpConsumed;
    session.status = 'PAUSED';
    await session.save();

    const station = await Station.findById(session.station);
    station.status = 'PAUSED';
    await station.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Resume session
// @route   PUT /api/sessions/:id/resume
// @access  Private (Staff/Owner)
exports.resumeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.status !== 'PAUSED') {
      return res.status(400).json({ message: 'Session is not paused' });
    }

    // Get the rate from the last segment
    const lastSegment = await SessionSegment.findOne({ session: session._id }).sort({ startedAt: -1 });
    
    const settings = await SystemSettings.findOne();
    const isOffPeak = settings && settings.isOffPeakModeActive;
    
    // We must find the GameRate to get the potentially updated offPeak or hourly rate
    const station = await Station.findById(session.station);
    const rate = await GameRate.findOne({ consoleType: station.consoleType, playerCount: lastSegment.playerCount });
    const appliedRate = isOffPeak ? rate.offPeakXPRate : rate.hourlyXPRate;

    await SessionSegment.create({
      session: session._id,
      startedAt: new Date(),
      playerCount: lastSegment.playerCount,
      hourlyXPRate: appliedRate
    });

    session.status = 'ACTIVE';
    await session.save();

    station.status = 'ACTIVE';
    await station.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Change players
// @route   PUT /api/sessions/:id/players
// @access  Private (Staff/Owner)
exports.changePlayers = async (req, res) => {
  try {
    const { playerCount } = req.body;
    const session = await Session.findById(req.params.id).populate('station');
    if (!session || session.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Session must be active to change players' });
    }

    const currentSegment = await SessionSegment.findOne({ session: session._id, endedAt: null });
    if (!currentSegment) return res.status(400).json({ message: 'No active segment found' });

    const newRate = await GameRate.findOne({ consoleType: session.station.consoleType, playerCount });
    if (!newRate) return res.status(400).json({ message: 'Invalid player count rate' });

    const settings = await SystemSettings.findOne();
    const isOffPeak = settings && settings.isOffPeakModeActive;
    const appliedRate = isOffPeak ? newRate.offPeakXPRate : newRate.hourlyXPRate;

    const now = new Date();
    currentSegment.endedAt = now;
    const elapsedSeconds = getElapsedSeconds(currentSegment.startedAt, now);
    currentSegment.billableSeconds = elapsedSeconds;
    currentSegment.xpConsumed = (currentSegment.hourlyXPRate * elapsedSeconds) / 3600;
    await currentSegment.save();

    await SessionSegment.create({
      session: session._id,
      startedAt: now,
      playerCount,
      hourlyXPRate: appliedRate
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    End session
// @route   PUT /api/sessions/:id/end
// @access  Private (Staff/Owner)
exports.endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Session already completed' });
    }

    const now = new Date();
    
    if (session.status === 'ACTIVE') {
      const currentSegment = await SessionSegment.findOne({ session: session._id, endedAt: null });
      if (currentSegment) {
        currentSegment.endedAt = now;
        const elapsedSeconds = getElapsedSeconds(currentSegment.startedAt, now);
        currentSegment.billableSeconds = elapsedSeconds;
        currentSegment.xpConsumed = (currentSegment.hourlyXPRate * elapsedSeconds) / 3600;
        await currentSegment.save();
      }
    }

    // Sum all segments
    const segments = await SessionSegment.find({ session: session._id });
    let totalSeconds = 0;
    let totalXP = 0;

    segments.forEach(seg => {
      totalSeconds += seg.billableSeconds;
      totalXP += seg.xpConsumed;
    });

    session.totalBillableSeconds = totalSeconds;
    session.totalXPUsed = Number(totalXP.toFixed(2));
    session.status = 'COMPLETED';
    session.endedAt = now;
    session.endedBy = req.user ? req.user._id : null;
    await session.save();

    // Deduct from wallet(s)
    let payers = [];
    let splitAmount = session.totalXPUsed;

    if (session.splitMethod === 'EQUAL' && session.splitPayers && session.splitPayers.length > 0) {
      payers = [session.payerCustomer, ...session.splitPayers];
      splitAmount = session.totalXPUsed / payers.length;
    } else {
      payers = [session.payerCustomer];
    }

    for (const payerId of payers) {
      const wallet = await Wallet.findOne({ customer: payerId });
      if (wallet) {
        const beforeBalance = wallet.totalAvailableXP;
        
        let xpToDeduct = Number(splitAmount.toFixed(2));
        if (wallet.bonusXP >= xpToDeduct) {
          wallet.bonusXP -= xpToDeduct;
        } else {
          let remainder = xpToDeduct - wallet.bonusXP;
          wallet.bonusXP = 0;
          wallet.purchasedXP -= remainder;
        }
        
        wallet.lifetimeXPBurned += xpToDeduct;
        await wallet.save();

        await WalletTransaction.create({
          wallet: wallet._id,
          customer: payerId,
          amount: -xpToDeduct,
          type: 'SESSION_USAGE',
          beforeBalance,
          afterBalance: wallet.totalAvailableXP,
          relatedSession: session._id,
          staffResponsible: req.user ? req.user._id : null
        });
      }
    }

    const station = await Station.findById(session.station);
    station.status = 'AVAILABLE';
    await station.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
