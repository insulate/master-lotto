/**
 * Test file for Result Calculation Service
 * ทดสอบการคำนวณผลรางวัล โดยเฉพาะ 3 ตัวโต๊ด
 */

import { checkBetItem } from './resultCalculation.service.js';

// Test cases for three_tod (3 ตัวโต๊ด)
const testThreeTod = () => {
  console.log('🧪 Testing three_tod (3 ตัวโต๊ด) calculation...\n');

  // ผลรางวัล: 3 ตัวบนออก "123"
  const result = {
    three_top: '123',
    three_tod: null, // ไม่ใช้ three_tod แล้ว
    two_top: '23',
    two_bottom: '45',
    run_top: ['1', '2', '3'],
    run_bottom: ['4', '5']
  };

  // Test cases: เลขที่แทง 3 ตัวโต๊ด
  const testCases = [
    { number: '123', shouldWin: true, description: 'เรียงเหมือนเดิม' },
    { number: '132', shouldWin: true, description: 'สลับ 2 กับ 3' },
    { number: '213', shouldWin: true, description: 'สลับ 1 กับ 2' },
    { number: '231', shouldWin: true, description: 'สลับ 1 กับ 2, 2 กับ 3' },
    { number: '312', shouldWin: true, description: 'สลับ 1 กับ 3' },
    { number: '321', shouldWin: true, description: 'กลับหลัง' },
    { number: '124', shouldWin: false, description: 'ไม่ใช่ตัวเลขเดียวกัน' },
    { number: '223', shouldWin: false, description: 'มีตัวเลขซ้ำไม่ตรง' },
    { number: '456', shouldWin: false, description: 'ตัวเลขต่างกันโดยสิ้นเชิง' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ number, shouldWin, description }) => {
    const betItem = {
      bet_type: 'three_tod',
      number,
      amount: 100,
      payout_rate: 150,
      potential_win: 15000
    };

    const { isWin, winAmount } = checkBetItem(betItem, result);

    const testPassed = isWin === shouldWin;
    const icon = testPassed ? '✅' : '❌';
    const status = testPassed ? 'PASS' : 'FAIL';

    console.log(`${icon} [${status}] เลข "${number}" (${description})`);
    console.log(`   Expected: ${shouldWin ? 'ถูกรางวัล' : 'ไม่ถูก'}, Got: ${isWin ? 'ถูกรางวัล' : 'ไม่ถูก'}`);
    console.log(`   Win Amount: ${winAmount.toLocaleString()} ฿\n`);

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Summary for three_tod:`);
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log('='.repeat(50) + '\n');

  return failed === 0;
};

// Test cases for three_top (3 ตัวบน)
const testThreeTop = () => {
  console.log('🧪 Testing three_top (3 ตัวบน) calculation...\n');

  const result = {
    three_top: '123',
    two_top: '23',
    two_bottom: '45',
    run_top: ['1', '2', '3'],
    run_bottom: ['4', '5']
  };

  const testCases = [
    { number: '123', shouldWin: true, description: 'ตรงทั้ง 3 หลัก' },
    { number: '132', shouldWin: false, description: 'เรียงไม่ตรง' },
    { number: '124', shouldWin: false, description: 'หลักหน่วยไม่ตรง' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ number, shouldWin, description }) => {
    const betItem = {
      bet_type: 'three_top',
      number,
      amount: 100,
      payout_rate: 900,
      potential_win: 90000
    };

    const { isWin, winAmount } = checkBetItem(betItem, result);

    const testPassed = isWin === shouldWin;
    const icon = testPassed ? '✅' : '❌';
    const status = testPassed ? 'PASS' : 'FAIL';

    console.log(`${icon} [${status}] เลข "${number}" (${description})`);
    console.log(`   Expected: ${shouldWin ? 'ถูกรางวัล' : 'ไม่ถูก'}, Got: ${isWin ? 'ถูกรางวัล' : 'ไม่ถูก'}`);
    console.log(`   Win Amount: ${winAmount.toLocaleString()} ฿\n`);

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Summary for three_top:`);
  console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
  console.log('='.repeat(50) + '\n');

  return failed === 0;
};

// Run all tests
const runAllTests = () => {
  console.log('\n' + '🚀 Starting Result Calculation Tests'.padEnd(60, '=') + '\n');

  const test1 = testThreeTop();
  const test2 = testThreeTod();

  console.log('\n' + '🎯 Overall Result'.padEnd(60, '='));

  if (test1 && test2) {
    console.log('✅ ALL TESTS PASSED! 🎉\n');
  } else {
    console.log('❌ SOME TESTS FAILED! Please review the failures above.\n');
  }
};

// Execute tests
runAllTests();
