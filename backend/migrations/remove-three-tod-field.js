import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Migration Script: Remove three_tod field from result
 * ลบ field result.three_tod ออกจาก lotterydraws collection
 * เพราะตอนนี้คำนวณ 3 ตัวโต๊ดจาก three_top โดยตรง (permutation)
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function removeThreeTodField() {
  try {
    console.log('🚀 Starting migration: Remove three_tod field from result');
    console.log('📦 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Remove three_tod field from result object
    console.log('📝 Removing result.three_tod field from lotterydraws...');
    const result = await db.collection('lotterydraws').updateMany(
      { 'result.three_tod': { $exists: true } },
      {
        $unset: { 'result.three_tod': '' }
      }
    );
    console.log(`   ✅ Updated ${result.modifiedCount} lottery draws\n`);

    // Summary
    console.log('🎉 Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Lottery draws updated: ${result.modifiedCount}`);
    console.log('\n✨ Field result.three_tod has been removed');
    console.log('💡 Note: 3 ตัวโต๊ดจะคำนวณจาก three_top โดยตรง (permutation)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
  }
}

// Run migration
removeThreeTodField()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
