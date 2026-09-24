const Station = require('../models/Station');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Private (Staff/Owner)
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find({}).sort({ stationId: 1 });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new station
// @route   POST /api/stations
// @access  Private (Owner only)
exports.createStation = async (req, res) => {
  try {
    const { stationId, displayName, consoleType, controllerCount, notes } = req.body;

    const stationExists = await Station.findOne({ stationId });
    if (stationExists) {
      return res.status(400).json({ message: 'Station ID already exists' });
    }

    const station = await Station.create({
      stationId,
      displayName,
      consoleType,
      controllerCount,
      notes
    });

    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update station status
// @route   PUT /api/stations/:id/status
// @access  Private (Staff/Owner)
exports.updateStationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const station = await Station.findById(req.params.id);

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    station.status = status;
    const updatedStation = await station.save();
    res.json(updatedStation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update station details
// @route   PUT /api/stations/:id
// @access  Private (Owner only)
exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
