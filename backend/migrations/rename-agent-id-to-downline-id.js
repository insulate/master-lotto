import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';

dotenv.config();

/**
 * Migration: Rename agent_id to downline_id in CreditTransaction collection
 *
 * เปลี่ยนชื่อ field agent_id เป็น downline_id เพื่อให้ชื่อสื่อความหมายมากขึ้น
 * เนื่องจาก field นี้ใช้เก็บ ID ของทั้ง Agent และ Member
 */

const migrateAgentIdToDownlineId = async () => {
  try {
    console.log('🔄 Starting migration: Rename agent_id to downline_id\n');

    // Connect to database
    await connectDB();

    // Get MongoDB native connection
    const db = (await import('mongoose')).default.connection.db;

    // Count documents with agent_id field
    const countBefore = await db.collection('credittransactions').countDocuments({
      agent_id: { $exists: true }
    });

    console.log(`📊 Found ${countBefore} documents with agent_id field\n`);

    if (countBefore === 0) {
      console.log('✅ No documents to migrate. Migration already completed or no data exists.\n');
      return;
    }

    // Rename field from agent_id to downline_id
    const result = await db.collection('credittransactions').updateMany(
      { agent_id: { $exists: true } },
      { $rename: { agent_id: 'downline_id' } }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`   Modified ${result.modifiedCount} documents\n`);

    // Verify the migration
    const countAfter = await db.collection('credittransactions').countDocuments({
      downline_id: { $exists: true }
    });

    console.log(`📊 Verification: ${countAfter} documents now have downline_id field\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

// Run migration
migrateAgentIdToDownlineId();
