import httpClient from '../../../lib/httpClient';

/**
 * Lottery Type Service for Agent
 * APIs สำหรับดึงข้อมูลประเภทหวย (Read-only for Agent)
 */

const lotteryTypeService = {
  /**
   * ดึงรายการประเภทหวยทั้งหมด
   * GET /agent/lottery-types
   * @returns {Promise} - { lotteryTypes: [], total: number }
   */
  getAll: async () => {
    const response = await httpClient.get('/agent/lottery-types');
    return response.data;
  },
};

export default lotteryTypeService;
