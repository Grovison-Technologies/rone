require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const GameRate = require('./models/GameRate');
const XPPack = require('./models/XPPack');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Seed Owner
    const adminExists = await User.findOne({ email: 'admin@rone.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@rone.com',
        password: 'password123',
        role: 'OWNER'
      });
      console.log('Admin user created: admin@rone.com / password123');
    }

    // Seed Game Rates
    const rateExists = await GameRate.findOne();
    if (!rateExists) {
      const rates = [
        { consoleType: 'PS5', playerCount: 1, hourlyXPRate: 200 },
        { consoleType: 'PS5', playerCount: 2, hourlyXPRate: 350 },
        { consoleType: 'PS5', playerCount: 3, hourlyXPRate: 500 },
        { consoleType: 'PS5', playerCount: 4, hourlyXPRate: 650 },
        { consoleType: 'PS4', playerCount: 1, hourlyXPRate: 170 },
        { consoleType: 'PS4', playerCount: 2, hourlyXPRate: 300 },
        { consoleType: 'PS4', playerCount: 3, hourlyXPRate: 450 },
        { consoleType: 'PS4', playerCount: 4, hourlyXPRate: 550 },
      ];
      await GameRate.insertMany(rates);
      console.log('Game rates seeded');
    }

    // Seed XP Packs
    const packExists = await XPPack.findOne();
    if (!packExists) {
      const packs = [
        { name: 'STARTER', price: 100, baseXP: 100, bonusXP: 0, displayOrder: 1 },
        { name: 'GAMER', price: 250, baseXP: 260, bonusXP: 10, displayOrder: 2 },
        { name: 'PRO', price: 500, baseXP: 550, bonusXP: 50, isPopular: true, displayOrder: 3 },
        { name: 'ELITE', price: 1000, baseXP: 1150, bonusXP: 150, displayOrder: 4 },
      ];
      await XPPack.insertMany(packs);
      console.log('XP Packs seeded');
    }

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
