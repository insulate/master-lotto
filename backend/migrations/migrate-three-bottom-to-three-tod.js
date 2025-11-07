import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Migration Script: three_bottom -> three_tod
 * แปลงข้อมูลเก่าจาก three_bottom เป็น three_tod ทั้งหมดใน database
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function migrateThreeBottomToThreeTod() {
  try {
    console.log('🚀 Starting migration: three_bottom -> three_tod');
    console.log('📦 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Migrate Users Collection - commission_rates
    console.log('📝 [1/5] Migrating users.commission_rates...');
    const usersResult = await db.collection('users').updateMany(
      { 'commission_rates.rates.three_bottom': { $exists: true } },
      {
        $rename: { 'commission_rates.$[].rates.three_bottom': 'commission_rates.$[].rates.three_tod' }
      }
    );
    console.log(`   ✅ Updated ${usersResult.modifiedCount} users\n`);

    // 2. Migrate Bets Collection - bet_items.bet_type
    console.log('📝 [2/5] Migrating bets.bet_items.bet_type...');
    const betsResult = await db.collection('bets').updateMany(
      { 'bet_items.bet_type': 'three_bottom' },
      {
        $set: { 'bet_items.$[elem].bet_type': 'three_tod' }
      },
      {
        arrayFilters: [{ 'elem.bet_type': 'three_bottom' }]
      }
    );
    console.log(`   ✅ Updated ${betsResult.modifiedCount} bets (bet_items)\n`);

    // 3. Migrate Bets Collection - commission_data.agent.rates
    console.log('📝 [3/5] Migrating bets.commission_data rates...');
    const betsCommissionResult = await db.collection('bets').updateMany(
      {
        $or: [
          { 'commission_data.agent.rates.three_bottom': { $exists: true } },
          { 'commission_data.master.rates.three_bottom': { $exists: true } }
        ]
      },
      {
        $rename: {
          'commission_data.agent.rates.three_bottom': 'commission_data.agent.rates.three_tod',
          'commission_data.master.rates.three_bottom': 'commission_data.master.rates.three_tod'
        }
      }
    );
    console.log(`   ✅ Updated ${betsCommissionResult.modifiedCount} bets (commission_data)\n`);

    // 4. Migrate LotteryDraws Collection - bet_settings
    console.log('📝 [4/5] Migrating lotterydraws.bet_settings...');
    const drawsSettingsResult = await db.collection('lotterydraws').updateMany(
      { 'bet_settings.three_bottom': { $exists: true } },
      {
        $rename: { 'bet_settings.three_bottom': 'bet_settings.three_tod' }
      }
    );
    console.log(`   ✅ Updated ${drawsSettingsResult.modifiedCount} lottery draws (bet_settings)\n`);

    // 5. Migrate LotteryDraws Collection - result
    console.log('📝 [5/5] Migrating lotterydraws.result...');
    const drawsResultResult = await db.collection('lotterydraws').updateMany(
      { 'result.three_bottom': { $exists: true } },
      {
        $rename: { 'result.three_bottom': 'result.three_tod' }
      }
    );
    console.log(`   ✅ Updated ${drawsResultResult.modifiedCount} lottery draws (result)\n`);

    // Summary
    console.log('🎉 Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users updated: ${usersResult.modifiedCount}`);
    console.log(`   - Bets updated (bet_items): ${betsResult.modifiedCount}`);
    console.log(`   - Bets updated (commission_data): ${betsCommissionResult.modifiedCount}`);
    console.log(`   - Lottery draws updated (bet_settings): ${drawsSettingsResult.modifiedCount}`);
    console.log(`   - Lottery draws updated (result): ${drawsResultResult.modifiedCount}`);
    console.log('\n✨ All data migrated from three_bottom to three_tod');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
  }
}

// Run migration
migrateThreeBottomToThreeTod()
  .then(() => {
    console.log('✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
