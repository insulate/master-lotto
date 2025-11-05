import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import { seedUsers } from './seed-users.js';

// Load environment variables
dotenv.config();

/**
 * Script สำหรับรัน seed สำหรับ MongoDB
 * ใช้คำสั่ง: npm run seed
 */

const runSeed = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...\n');

    // Connect to MongoDB
    await connectDB();

    console.log('');

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
