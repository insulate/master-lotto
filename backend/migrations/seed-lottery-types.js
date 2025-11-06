import LotteryType from '../models/lotteryType.model.js';

/**
 * Seed Lottery Types
 * สร้างข้อมูลประเภทหวยเริ่มต้นในระบบ
 */

export const seedLotteryTypes = async () => {
  try {
    console.log('📋 Seeding Lottery Types...');

    // Check if lottery types already exist
    const existingTypes = await LotteryType.countDocuments();
    if (existingTypes > 0) {
      console.log('   ℹ️  Lottery types already exist, skipping seed.');
      return;
    }

    // Default lottery types
    const lotteryTypes = [
      {
        value: 'government',
        label: 'หวยรัฐบาล',
        description: 'หวยรัฐบาลไทย ออกวันที่ 1 และ 16 ของทุกเดือน',
        icon: '🏛️',
        enabled: true,
      },
      {
        value: 'lao_pattana',
        label: 'หวยลาวพัฒนา',
        description: 'หวยลาว ออกทุกวันจันทร์ และวันพฤหัสบดี',
        icon: '🇱🇦',
        enabled: true,
      },
      {
        value: 'hanoi_regular',
        label: 'หวยฮานอยปกติ',
        description: 'หวยฮานอย ออกทุกวัน เวลา 18:00 น.',
        icon: '🇻🇳',
        enabled: true,
      },
      {
        value: 'hanoi_vip',
        label: 'หวยฮานอย VIP',
        description: 'หวยฮานอย VIP ออกทุกวัน เวลา 21:00 น.',
        icon: '⭐',
        enabled: true,
      },
    ];

    // Insert lottery types
    await LotteryType.insertMany(lotteryTypes);

    console.log(`   ✅ Seeded ${lotteryTypes.length} lottery types successfully\n`);
  } catch (error) {
    console.error('   ❌ Error seeding lottery types:', error.message);
    throw error;
  }
};
