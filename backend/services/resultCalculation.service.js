/**
 * Result Calculation Service
 * ระบบคำนวณผลรางวัลและตรวจสอบเลขที่ถูกรางวัล
 */

/**
 * ตรวจสอบว่า bet item ถูกรางวัลหรือไม่
 * @param {Object} betItem - รายการเลขที่แทง { bet_type, number, amount, payout_rate, potential_win }
 * @param {Object} result - ผลรางวัล { three_top, three_tod, two_top, two_bottom, run_top[], run_bottom[] }
 * @returns {Object} { isWin: boolean, winAmount: number }
 */
export const checkBetItem = (betItem, result) => {
  const { bet_type, number, potential_win } = betItem;

  let isWin = false;

  switch (bet_type) {
    case 'three_top':
      // ตรวจ 3 ตัวบน - ต้องตรงทั้ง 3 หลัก
      isWin = result.three_top && result.three_top === number;
      break;

    case 'three_tod':
      // ตรวจ 3 ตัวโต๊ด - ต้องตรงทั้ง 3 หลัก
      isWin = result.three_tod && result.three_tod === number;
      break;

    case 'two_top':
      // ตรวจ 2 ตัวบน - ต้องตรงทั้ง 2 หลัก
      isWin = result.two_top && result.two_top === number;
      break;

    case 'two_bottom':
      // ตรวจ 2 ตัวล่าง - ต้องตรงทั้ง 2 หลัก
      isWin = result.two_bottom && result.two_bottom === number;
      break;

    case 'run_top':
      // ตรวจวิ่งบน - เลขอยู่ใน array run_top หรือไม่
      isWin = Array.isArray(result.run_top) && result.run_top.includes(number);
      break;

    case 'run_bottom':
      // ตรวจวิ่งล่าง - เลขอยู่ใน array run_bottom หรือไม่
      isWin = Array.isArray(result.run_bottom) && result.run_bottom.includes(number);
      break;

    default:
      isWin = false;
  }

  return {
    isWin,
    winAmount: isWin ? potential_win : 0
  };
};

/**
 * คำนวณผลรางวัลของ bet ทั้งหมด
 * @param {Object} bet - Bet document พร้อม bet_items
 * @param {Object} result - ผลรางวัล
 * @returns {Object} { updatedBetItems, totalWinAmount, hasWin }
 */
export const calculateBetResult = (bet, result) => {
  let totalWinAmount = 0;
  let hasWin = false;

  // อัปเดตแต่ละ bet_item
  const updatedBetItems = bet.bet_items.map((item) => {
    const { isWin, winAmount } = checkBetItem(item, result);

    if (isWin) {
      hasWin = true;
      totalWinAmount += winAmount;
    }

    return {
      ...item,
      is_win: isWin,
      win_amount: winAmount
    };
  });

  return {
    updatedBetItems,
    totalWinAmount,
    hasWin
  };
};

/**
 * กำหนดสถานะของ bet หลังคำนวณผล
 * @param {number} totalWinAmount - ยอดเงินรางวัลรวม
 * @returns {string} 'won' | 'lost'
 */
export const determineBetStatus = (totalWinAmount) => {
  return totalWinAmount > 0 ? 'won' : 'lost';
};

export default {
  checkBetItem,
  calculateBetResult,
  determineBetStatus
};
