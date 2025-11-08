import httpClient from '../lib/httpClient';

/**
 * Credit Service for Members
 * APIs สำหรับระบบประวัติเครดิตของ Member
 */

const creditService = {
  /**
   * ดูประวัติการเติม-ถอนเครดิต (Get Credit Transaction History)
   * GET /member/credit-history
   * @returns {Promise} - { transactions, total }
   */
  getCreditHistory: async () => {
    const response = await httpClient.get('/member/credit-history');
    return response.data;
  },
};

export default creditService;
