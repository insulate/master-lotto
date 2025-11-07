import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import { seedUsers } from './seed-users.js';
import { seedLotteryTypes } from './seed-lottery-types.js';

// Import models
import User from '../models/user.model.js';
import LotteryType from '../models/lotteryType.model.js';
import LotteryDraw from '../models/lotteryDraw.model.js';
import Bet from '../models/bet.model.js';
import CreditTransaction from '../models/creditTransaction.model.js';

// Load environment variables
dotenv.config();

/**
 * Script สำหรับรัน seed สำหรับ MongoDB
 * ใช้คำสั่ง: npm run seed
 */

/**
 * Clear all data from database
 */
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing all data from database...\n');

    // Get all models from mongoose
    const models = [User, LotteryType, LotteryDraw, Bet, CreditTransaction];

    // Delete all documents from each collection
    for (const model of models) {
      const collectionName = model.collection.name;
      const result = await model.deleteMany({});
      console.log(`   ✅ Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
    }

    console.log('\n   ✨ Database cleared successfully!\n');
  } catch (error) {
    console.error('   ❌ Error clearing database:', error.message);
    throw error;
  }
};

const runSeed = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...\n');

    // Connect to MongoDB
    await connectDB();

    console.log('');

    // Clear all data first
    await clearDatabase();

    // Run lottery types seed
    await seedLotteryTypes();

    // Run user seed
    await seedUsers();

    console.log('✨ All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await disconnectDB();
  }
};

// Run seed
runSeed();
