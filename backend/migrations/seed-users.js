import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed Users
 * สร้าง Master user เริ่มต้นสำหรับระบบ
 */

// ฟังก์ชัน hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// ข้อมูล Master user
export const users = [
  {
    id: uuidv4(),
    username: 'master',
    name: 'Master Admin',
    password: null, // จะ hash ตอนรัน seed
    role: 'master',
    parent_id: null,
    credit: 100000.00,
    balance: 50000.00,
    commission_rate: JSON.stringify({
      three_top: 30,
      three_tod: 30,
      two_top: 30,
      two_bottom: 30,
      run_top: 30,
      run_bottom: 30
    }),
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  }
];

/**
 * Seed function สำหรับใส่ข้อมูลเข้า database
 * @param {Object} db - Database connection
 */
export const seedUsers = async (db) => {
  try {
    console.log('🌱 Starting user seed...');

    // Hash passwords
    for (const user of users) {
      // Default password: username123
      user.password = await hashPassword(`${user.username}123`);
    }

    // Insert users
    for (const user of users) {
      // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
      const [existing] = await db.query(
        'SELECT id FROM users WHERE username = ?',
        [user.username]
      );

      if (existing.length === 0) {
        // Insert user
        await db.query(
          `INSERT INTO users (id, username, name, password, role, parent_id, credit, balance, commission_rate, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            user.username,
            user.name,
            user.password,
            user.role,
            user.parent_id,
            user.credit,
            user.balance,
            user.commission_rate,
            user.status,
            user.created_at,
            user.updated_at
          ]
        );
        console.log(`✅ Created user: ${user.username} (${user.role})`);
      } else {
        console.log(`⏭️  User already exists: ${user.username}`);
      }
    }

    console.log('🎉 User seed completed!');
    console.log('\n📝 Default Credentials:');
    console.log('-----------------------------------');
    console.log('Username: master');
    console.log('Password: master123');
    console.log('Role: master');
    console.log('-----------------------------------\n');

    return true;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

export default {
  seedUsers
};
