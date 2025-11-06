import httpClient from '../../lib/httpClient';

/**
 * Lottery Service for Members
 * APIs สำหรับดึงข้อมูลหวยสำหรับ Member
 */

const lotteryService = {
  /**
   * ดึงรายการประเภทหวยทั้งหมดที่เปิดใช้งาน
   * GET /member/lottery-types
   * @returns {Promise} - { lotteryTypes: [], total: number }
   */
  getLotteryTypes: async () => {
    const response = await httpClient.get('/member/lottery-types');
    return response.data;
  },
};

export default lotteryService;
