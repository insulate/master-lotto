import httpClient from '../lib/httpClient';

/**
 * Bet Service for Members
 * APIs สำหรับระบบแทงหวยของ Member
 */

const betService = {
  /**
   * แทงหวย (Place Bet)
   * POST /member/bets
   * @param {Object} betData - { lottery_draw_id, bet_items: [{ bet_type, number, amount }] }
   * @returns {Promise} - { bet, deducted, remaining }
   */
  placeBet: async (betData) => {
    const response = await httpClient.post('/member/bets', betData);
    return response.data;
  },

  /**
   * ดูประวัติการแทง (Get Bet History)
   * GET /member/bets
   * @param {Object} params - { lottery_draw_id, status, limit, page }
   * @returns {Promise} - { bets, total, page, limit, totalPages }
   */
  getBets: async (params = {}) => {
    const response = await httpClient.get('/member/bets', { params });
    return response.data;
  },

  /**
   * ดูรายละเอียดบิล (Get Bet Details)
   * GET /member/bets/:id
   * @param {string} id - Bet ID
   * @returns {Promise} - { bet }
   */
  getBetById: async (id) => {
    const response = await httpClient.get(`/member/bets/${id}`);
    return response.data;
  },
};

export default betService;
