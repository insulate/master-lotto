import httpClient from '../../../lib/httpClient';

/**
 * Lottery Draw Service
 * APIs สำหรับจัดการงวดหวย (Lottery Draw Management)
 * ใช้สำหรับ Master role เท่านั้น
 */

const lotteryDrawService = {
  /**
   * ดึงรายการงวดหวยทั้งหมด
   * GET /master/lottery-draws
   * @param {Object} params - Query parameters
   * @param {string} params.lottery_type - Filter by lottery type (government | lao_pattana | hanoi_regular | hanoi_vip)
   * @param {string} params.status - Filter by status (open | closed | completed | cancelled)
   * @param {string} params.start_date - Filter by start date (ISO format)
   * @param {string} params.end_date - Filter by end date (ISO format)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @returns {Promise} - { lotteryDraws: [], pagination: {} }
   */
  getAll: async (params = {}) => {
    try {
      const response = await httpClient.get('/master/lottery-draws', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ดึงข้อมูลงวดหวยตาม ID
   * GET /master/lottery-draws/:id
   * @param {string} id - Lottery Draw ID
   * @returns {Promise} - { lotteryDraw: {} }
   */
  getById: async (id) => {
    try {
      const response = await httpClient.get(`/master/lottery-draws/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * สร้างงวดหวยใหม่
   * POST /master/lottery-draws
   * @param {Object} data - Lottery draw data
   * @param {string} data.lottery_type - Lottery type (required): government | lao_pattana | hanoi_regular | hanoi_vip
   * @param {string} data.draw_date - Draw date (required, ISO format)
   * @param {string} data.open_time - Open time (required, ISO format)
   * @param {string} data.close_time - Close time (required, ISO format)
   * @param {Object} data.bet_settings - Bet settings (optional)
   * @param {Object} data.bet_settings.three_top - 3 ตัวบน
   * @param {number} data.bet_settings.three_top.payout_rate - อัตราจ่าย (default: 900)
   * @param {number} data.bet_settings.three_top.min_bet - ขั้นต่ำ (default: 1)
   * @param {number} data.bet_settings.three_top.max_bet - สูงสุด (default: 10000)
   * @param {boolean} data.bet_settings.three_top.enabled - เปิดใช้งาน (default: true)
   * @param {Object} data.bet_settings.three_tod - 3 ตัวโต๊ด
   * @param {Object} data.bet_settings.two_top - 2 ตัวบน
   * @param {Object} data.bet_settings.two_bottom - 2 ตัวล่าง
   * @param {Object} data.bet_settings.run_top - วิ่งบน
   * @param {Object} data.bet_settings.run_bottom - วิ่งล่าง
   * @returns {Promise} - { lotteryDraw: {} }
   */
  create: async (data) => {
    try {
      const response = await httpClient.post('/master/lottery-draws', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * แก้ไขข้อมูลงวดหวย (เฉพาะสถานะ 'open')
   * PUT /master/lottery-draws/:id
   * @param {string} id - Lottery Draw ID
   * @param {Object} data - Lottery draw data to update
   * @param {string} data.draw_date - Draw date (optional, ISO format)
   * @param {string} data.open_time - Open time (optional, ISO format)
   * @param {string} data.close_time - Close time (optional, ISO format)
   * @param {Object} data.bet_settings - Bet settings (optional)
   * @returns {Promise} - { lotteryDraw: {} }
   */
  update: async (id, data) => {
    try {
      const response = await httpClient.put(`/master/lottery-draws/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * เปลี่ยนสถานะงวดหวย
   * PATCH /master/lottery-draws/:id/status
   * @param {string} id - Lottery Draw ID
   * @param {string} status - Status (open | closed | completed | cancelled)
   * @returns {Promise} - { lotteryDraw: {} }
   */
  updateStatus: async (id, status) => {
    try {
      const response = await httpClient.patch(`/master/lottery-draws/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ประกาศผลรางวัล (เฉพาะสถานะ 'closed')
   * PATCH /master/lottery-draws/:id/result
   * @param {string} id - Lottery Draw ID
   * @param {Object} result - Result data
   * @param {string} result.three_top - เลข 3 ตัวบน (เช่น "123")
   * @param {string} result.two_top - เลข 2 ตัวบน (เช่น "12")
   * @param {string} result.two_bottom - เลข 2 ตัวล่าง (เช่น "34")
   * @param {Array<string>} result.run_top - เลขวิ่งบน (เช่น ["1", "2", "3"])
   * @param {Array<string>} result.run_bottom - เลขวิ่งล่าง (เช่น ["4", "5", "6"])
   * @returns {Promise} - { lotteryDraw: {} }
   */
  updateResult: async (id, result) => {
    try {
      const response = await httpClient.patch(`/master/lottery-draws/${id}/result`, {
        result,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ลบงวดหวย (เฉพาะสถานะ 'open' หรือ 'cancelled')
   * DELETE /master/lottery-draws/:id
   * @param {string} id - Lottery Draw ID
   * @returns {Promise} - { message: string }
   */
  delete: async (id) => {
    try {
      const response = await httpClient.delete(`/master/lottery-draws/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default lotteryDrawService;
