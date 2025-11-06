import httpClient from '../../../lib/httpClient';

/**
 * Lottery Type Service
 * APIs สำหรับจัดการประเภทหวย (Lottery Type Management)
 * ใช้สำหรับ Master role เท่านั้น
 */

const lotteryTypeService = {
  /**
   * ดึงรายการประเภทหวยทั้งหมด
   * GET /master/lottery-types
   * @returns {Promise} - { lotteryTypes: [], total: number }
   */
  getAll: async () => {
    const response = await httpClient.get('/master/lottery-types');
    return response.data;
  },

  /**
   * เปลี่ยนสถานะประเภทหวย
   * PATCH /master/lottery-types/:id/status
   * @param {string} id - Lottery Type ID
   * @param {boolean} enabled - สถานะ (true = เปิดใช้งาน, false = ปิดใช้งาน)
   * @returns {Promise} - { lotteryType: {} }
   */
  toggleStatus: async (id, enabled) => {
    const response = await httpClient.patch(`/master/lottery-types/${id}/status`, {
      enabled,
    });
    return response.data;
  },
};

export default lotteryTypeService;
