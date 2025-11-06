import httpClient from '../../../lib/httpClient';

/**
 * Member Service
 * APIs สำหรับจัดการผู้เล่น/สมาชิก (Member Management)
 * ใช้สำหรับ Agent role เท่านั้น
 */

const memberService = {
  /**
   * ดึงรายการสมาชิกทั้งหมด
   * GET /agent/members
   * @returns {Promise} - { members: [], total: number }
   */
  getAll: async () => {
    const response = await httpClient.get('/agent/members');
    return response.data;
  },

  /**
   * ดึงข้อมูลสมาชิกตาม ID
   * GET /agent/members/:id
   * @param {string} id - Member ID
   * @returns {Promise} - { member: {} }
   */
  getById: async (id) => {
    const response = await httpClient.get(`/agent/members/${id}`);
    return response.data;
  },

  /**
   * สร้างสมาชิกใหม่
   * POST /agent/members
   * @param {Object} data - Member data
   * @param {string} data.username - Username (required)
   * @param {string} data.name - Name (required)
   * @param {string} data.password - Password (required, min 6 characters)
   * @param {number} data.credit - Credit (optional, default: 0)
   * @param {Object} data.commission_rate - Commission rate (optional)
   * @returns {Promise} - { member: {} }
   */
  create: async (data) => {
    const response = await httpClient.post('/agent/members', data);
    return response.data;
  },

  /**
   * แก้ไขข้อมูลสมาชิก
   * PUT /agent/members/:id
   * @param {string} id - Member ID
   * @param {Object} data - Member data to update
   * @param {string} data.name - Name (optional)
   * @param {Object} data.commission_rate - Commission rate (optional)
   * @returns {Promise} - { member: {} }
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/agent/members/${id}`, data);
    return response.data;
  },

  /**
   * เปลี่ยนสถานะสมาชิก
   * PATCH /agent/members/:id/status
   * @param {string} id - Member ID
   * @param {string} status - Status (active | suspended)
   * @returns {Promise} - { member: {} }
   */
  toggleStatus: async (id, status) => {
    const response = await httpClient.patch(`/agent/members/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * ปรับเครดิตสมาชิก
   * PATCH /agent/members/:id/credit
   * @param {string} id - Member ID
   * @param {number} amount - จำนวนเครดิต (ต้อง > 0)
   * @param {string} action - ประเภทการทำรายการ (add | deduct)
   * @returns {Promise} - { member: {}, agentCredit: number }
   */
  adjustCredit: async (id, amount, action) => {
    const response = await httpClient.patch(`/agent/members/${id}/credit`, {
      amount,
      action,
    });
    return response.data;
  },

  /**
   * ดึงประวัติการเติม-ถอนเครดิต
   * GET /agent/members/:id/credit-history
   * @param {string} id - Member ID
   * @returns {Promise} - { transactions: [], total: number }
   */
  getCreditHistory: async (id) => {
    const response = await httpClient.get(`/agent/members/${id}/credit-history`);
    return response.data;
  },

  /**
   * เปลี่ยนรหัสผ่านสมาชิก
   * PATCH /agent/members/:id/change-password
   * @param {string} id - Member ID
   * @param {string} newPassword - รหัสผ่านใหม่ (min 6 characters)
   * @returns {Promise} - { member: {} }
   */
  changePassword: async (id, newPassword) => {
    const response = await httpClient.patch(`/agent/members/${id}/change-password`, {
      newPassword,
    });
    return response.data;
  },
};

export default memberService;
