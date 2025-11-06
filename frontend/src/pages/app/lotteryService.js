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

  /**
   * ดึงรายการงวดหวยตามประเภทหวยและสถานะ
   * GET /member/lottery-draws
   * @param {Object} params - { lottery_type, status, limit }
   * @returns {Promise} - { lotteryDraws: [], total: number }
   */
  getLotteryDraws: async (params = {}) => {
    const response = await httpClient.get('/member/lottery-draws', { params });
    return response.data;
  },

  /**
   * ดึงรายการงวดหวยที่เปิดรับแทงทั้งหมด
   * GET /member/lottery-draws/open
   * @returns {Promise} - { lotteryDraws: [], total: number }
   */
  getOpenLotteryDraws: async () => {
    const response = await httpClient.get('/member/lottery-draws/open');
    return response.data;
  },
};

export default lotteryService;
