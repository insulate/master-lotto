import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

/**
 * Seed Users for MongoDB
 * สร้าง Master user เริ่มต้นสำหรับระบบ
 */

/**
 * Seed function สำหรับใส่ข้อมูลเข้า database
 */
export const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seed...');

    // ลบข้อมูล users ทั้งหมดก่อน
    const deletedCount = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing users`);

    // ข้อมูล Master user
    const masterUsername = 'master';
    const masterPassword = 'master123';

    // Hash password
    const hashedPassword = await bcrypt.hash(masterPassword, 10);

    // สร้าง master user
    const masterUser = new User({
      username: masterUsername,
      name: 'Master Admin',
      password: hashedPassword,
      role: 'master',
      parent_id: null,
      credit: 0,
      balance: 0,
      commission_rate: {
        three_top: 30,
        three_tod: 30,
        two_top: 30,
        two_bottom: 30,
        run_top: 30,
        run_bottom: 30
      },
      status: 'active'
    });

    await masterUser.save();

    console.log(`✅ Created user: ${masterUsername} (master)`);
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
