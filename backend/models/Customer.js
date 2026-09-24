const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  rOneId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  pin: {
    type: String, // Optional simple PIN for customer login if desired
  },
  email: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'BLOCKED'],
    default: 'ACTIVE'
  },
  lastVisitAt: {
    type: Date
  }
}, { timestamps: true });

// Hash PIN before saving if exists
customerSchema.pre('save', async function(next) {
  if (!this.isModified('pin') || !this.pin) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
});

// Method to compare entered PIN
customerSchema.methods.matchPin = async function(enteredPin) {
  if (!this.pin) return false;
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('Customer', customerSchema);
