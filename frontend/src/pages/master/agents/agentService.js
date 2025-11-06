import httpClient from '../../../lib/httpClient';

/**
 * Agent Service
 * APIs สำหรับจัดการเอเย่นต์ (Agent Management)
 * ใช้สำหรับ Master role เท่านั้น
 */

const agentService = {
  /**
   * ดึงรายการเอเย่นต์ทั้งหมด
   * GET /master/agents
   * @returns {Promise} - { agents: [], total: number }
   */
  getAll: async () => {
    const response = await httpClient.get('/master/agents');
    return response.data;
  },

  /**
   * ดึงข้อมูลเอเย่นต์ตาม ID
   * GET /master/agents/:id
   * @param {string} id - Agent ID
   * @returns {Promise} - { agent: {} }
   */
  getById: async (id) => {
    const response = await httpClient.get(`/master/agents/${id}`);
    return response.data;
  },

  /**
   * สร้างเอเย่นต์ใหม่
   * POST /master/agents
   * @param {Object} data - Agent data
   * @param {string} data.username - Username (required)
   * @param {string} data.name - Name (required)
   * @param {string} data.password - Password (required, min 6 characters)
   * @param {number} data.credit - Credit (optional, default: 0)
   * @param {Object} data.commission_rate - Commission rate (optional)
   * @returns {Promise} - { agent: {} }
   */
  create: async (data) => {
    const response = await httpClient.post('/master/agents', data);
    return response.data;
  },

  /**
   * แก้ไขข้อมูลเอเย่นต์
   * PUT /master/agents/:id
   * @param {string} id - Agent ID
   * @param {Object} data - Agent data to update
   * @param {string} data.name - Name (optional)
   * @param {Object} data.commission_rate - Commission rate (optional)
   * @returns {Promise} - { agent: {} }
   */
  update: async (id, data) => {
    const response = await httpClient.put(`/master/agents/${id}`, data);
    return response.data;
  },

  /**
   * เปลี่ยนสถานะเอเย่นต์
   * PATCH /master/agents/:id/status
   * @param {string} id - Agent ID
   * @param {string} status - Status (active | suspended)
   * @returns {Promise} - { agent: {} }
   */
  toggleStatus: async (id, status) => {
    const response = await httpClient.patch(`/master/agents/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * ปรับเครดิตเอเย่นต์
   * PATCH /master/agents/:id/credit
   * @param {string} id - Agent ID
   * @param {number} amount - จำนวนเครดิต (ต้อง > 0)
   * @param {string} action - ประเภทการทำรายการ (add | deduct)
   * @returns {Promise} - { agent: {}, masterCredit: number }
   */
  adjustCredit: async (id, amount, action) => {
    const response = await httpClient.patch(`/master/agents/${id}/credit`, {
      amount,
      action,
    });
    return response.data;
  },

  /**
   * ดึงประวัติการเติม-ถอนเครดิต
   * GET /master/agents/:id/credit-history
   * @param {string} id - Agent ID
   * @returns {Promise} - { transactions: [], total: number }
   */
  getCreditHistory: async (id) => {
    const response = await httpClient.get(`/master/agents/${id}/credit-history`);
    return response.data;
  },

  /**
   * เปลี่ยนรหัสผ่านเอเย่นต์
   * PUT /master/agents/:id/change-password
   * @param {string} id - Agent ID
   * @param {string} newPassword - รหัสผ่านใหม่ (required, min 6 characters)
   * @returns {Promise} - Success message
   */
  changePassword: async (id, newPassword) => {
    const response = await httpClient.put(`/master/agents/${id}/change-password`, {
      newPassword,
    });
    return response.data;
  },
};

export default agentService;
