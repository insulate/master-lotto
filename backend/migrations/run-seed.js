import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { seedUsers } from './seed-users.js';

// Load environment variables
dotenv.config();

/**
 * Script สำหรับรัน seed
 * ใช้คำสั่ง: npm run seed
 */

const runSeed = async () => {
  let connection;

  try {
    console.log('🚀 Connecting to database...');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lotto_system',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connected!\n');

    // Run user seed
    await seedUsers(connection);

    console.log('✨ All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Database connection closed.');
    }
  }
};

// Run seed
runSeed();
