import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import LotteryType from '../models/lotteryType.model.js';

/**
 * Seed Users for MongoDB
 * สร้าง Master, Agent, และ Member users เริ่มต้นสำหรับระบบ
 */

/**
 * Seed function สำหรับใส่ข้อมูลเข้า database
 */
export const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seed...\n');

    // ลบข้อมูล users ทั้งหมดก่อน
    const deletedCount = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing users\n`);

    // Get lottery types for commission rates
    const lotteryTypes = await LotteryType.find({});

    // Create default commission rates for agents (0% - will be set by master later)
    const defaultAgentCommissionRates = lotteryTypes.map(lt => ({
      lottery_type_id: lt._id,
      rates: {
        three_top: 0,
        three_tod: 0,
        two_top: 0,
        two_bottom: 0,
        run_top: 0,
        run_bottom: 0
      }
    }));

    // Create default commission rates for members (0% - will be set by agent later)
    const defaultMemberCommissionRates = lotteryTypes.map(lt => ({
      lottery_type_id: lt._id,
      rates: {
        three_top: 0,
        three_tod: 0,
        two_top: 0,
        two_bottom: 0,
        run_top: 0,
        run_bottom: 0
      }
    }));

    // 1. สร้าง Master user
    console.log('👑 Creating Master user...');
    const masterPassword = await bcrypt.hash('master123', 10);

    const masterUser = await User.create({
      username: 'master',
      name: 'Master Admin',
      password: masterPassword,
      role: 'master',
      parent_id: null,
      credit: 0,
      balance: 0,
      commission_rates: [], // Master ไม่ต้องมี commission rates
      status: 'active'
    });

    console.log(`   ✅ Created: master (Master Admin)\n`);

    // 2. สร้าง Agent users (2 คน)
    console.log('🏢 Creating Agent users...');

    const agent1Password = await bcrypt.hash('agent123', 10);
    const agent1 = await User.create({
      username: 'agent1',
      name: 'Agent One',
      password: agent1Password,
      role: 'agent',
      parent_id: masterUser._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultAgentCommissionRates,
      contact: 'Line: @agent1',
      status: 'active'
    });

    const agent2Password = await bcrypt.hash('agent123', 10);
    const agent2 = await User.create({
      username: 'agent2',
      name: 'Agent Two',
      password: agent2Password,
      role: 'agent',
      parent_id: masterUser._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultAgentCommissionRates,
      contact: 'Line: @agent2',
      status: 'active'
    });

    console.log(`   ✅ Created: agent1 (Agent One)`);
    console.log(`   ✅ Created: agent2 (Agent Two)\n`);

    // 3. สร้าง Member users (5 คน)
    // Agent1 จะมี Member 2 คน
    // Agent2 จะมี Member 3 คน
    console.log('👥 Creating Member users...');

    const memberPassword = await bcrypt.hash('member123', 10);

    // Members ของ Agent1 (2 คน)
    await User.create({
      username: 'member1',
      name: 'Member One',
      password: memberPassword,
      role: 'member',
      parent_id: agent1._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultMemberCommissionRates,
      contact: 'Tel: 081-111-1111',
      status: 'active'
    });

    await User.create({
      username: 'member2',
      name: 'Member Two',
      password: memberPassword,
      role: 'member',
      parent_id: agent1._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultMemberCommissionRates,
      contact: 'Tel: 081-222-2222',
      status: 'active'
    });

    console.log(`   ✅ Created: member1 (Member One) - Agent: agent1`);
    console.log(`   ✅ Created: member2 (Member Two) - Agent: agent1`);

    // Members ของ Agent2 (3 คน)
    await User.create({
      username: 'member3',
      name: 'Member Three',
      password: memberPassword,
      role: 'member',
      parent_id: agent2._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultMemberCommissionRates,
      contact: 'Tel: 081-333-3333',
      status: 'active'
    });

    await User.create({
      username: 'member4',
      name: 'Member Four',
      password: memberPassword,
      role: 'member',
      parent_id: agent2._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultMemberCommissionRates,
      contact: 'Tel: 081-444-4444',
      status: 'active'
    });

    await User.create({
      username: 'member5',
      name: 'Member Five',
      password: memberPassword,
      role: 'member',
      parent_id: agent2._id,
      credit: 0,
      balance: 0,
      commission_rates: defaultMemberCommissionRates,
      contact: 'Tel: 081-555-5555',
      status: 'active'
    });

    console.log(`   ✅ Created: member3 (Member Three) - Agent: agent2`);
    console.log(`   ✅ Created: member4 (Member Four) - Agent: agent2`);
    console.log(`   ✅ Created: member5 (Member Five) - Agent: agent2\n`);

    console.log('🎉 User seed completed!\n');
    console.log('📝 Default Credentials:');
    console.log('═'.repeat(50));
    console.log('Master Account:');
    console.log('  Username: master    | Password: master123');
    console.log('─'.repeat(50));
    console.log('Agent Accounts:');
    console.log('  Username: agent1    | Password: agent123 (2 members)');
    console.log('  Username: agent2    | Password: agent123 (3 members)');
    console.log('─'.repeat(50));
    console.log('Member Accounts:');
    console.log('  Username: member1   | Password: member123 (agent1)');
    console.log('  Username: member2   | Password: member123 (agent1)');
    console.log('  Username: member3   | Password: member123 (agent2)');
    console.log('  Username: member4   | Password: member123 (agent2)');
    console.log('  Username: member5   | Password: member123 (agent2)');
    console.log('═'.repeat(50));
    console.log('\n💡 Tip: ใช้ username/password ข้างบนเพื่อเข้าสู่ระบบ\n');

    return true;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

export default {
  seedUsers
};
