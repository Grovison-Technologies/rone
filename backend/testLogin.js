require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const testLogin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@rone.com' });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  
  console.log('User found:', user);
  const isMatch = await bcrypt.compare('password123', user.password);
  console.log('Password match:', isMatch);
  
  process.exit(0);
};

testLogin();
