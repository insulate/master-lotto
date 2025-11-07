import httpClient from '../../lib/httpClient';

/**
 * Lottery Draw Service for Members
 * APIs สำหรับดึงข้อมูลงวดหวยสำหรับ Member
 */

const lotteryDrawService = {
  /**
   * ดึงรายการงวดหวยที่เปิดรับแทง
   * GET /member/lottery-draws/open
   * @returns {Promise} - { results: [{ lotteryType, draw, hasOpenDraw }] }
   */
  getOpenDraws: async () => {
    const response = await httpClient.get('/member/lottery-draws/open');
    return response.data;
  },

  /**
   * ดึงข้อมูลงวดหวยโดย ID
   * GET /member/lottery-draws/:id
   * @param {string} id - Lottery Draw ID
   * @returns {Promise} - { lotteryDraw }
   */
  getDrawById: async (id) => {
    const response = await httpClient.get(`/member/lottery-draws/${id}`);
    return response.data;
  },
};

export default lotteryDrawService;
