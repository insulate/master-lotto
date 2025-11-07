import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, FileText, Loader2, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import betService from '../../services/betService';
import { parseErrorMessage } from '../../lib/utils';

/**
 * History Page - หน้าประวัติการแทง
 */
const HistoryPage = () => {
  // State
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const limit = 20;

  // Fetch bets
  useEffect(() => {
    fetchBets();
  }, [page, statusFilter]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await betService.getBets(params);
      setBets(response.data.bets);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'รอผล', color: 'bg-yellow-500' },
      won: { label: 'ถูกรางวัล', color: 'bg-green-500' },
      lost: { label: 'ไม่ถูก', color: 'bg-red-500' },
      cancelled: { label: 'ยกเลิก', color: 'bg-gray-500' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };

    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
        {config.label}
      </span>
    );
  };

  // Get bet type label
  const getBetTypeLabel = (betType) => {
    const labels = {
      three_top: '3 ตัวบน',
      three_bottom: '3 ตัวล่าง',
      two_top: '2 ตัวบน',
      two_bottom: '2 ตัวล่าง',
      run_top: 'วิ่งบน',
      run_bottom: 'วิ่งล่าง',
    };
    return labels[betType] || betType;
  };

  // Get lottery type label
  const getLotteryTypeLabel = (lotteryType) => {
    const labels = {
      government: 'หวยรัฐบาลไทย',
      lao_pattana: 'หวยลาวพัฒนา',
      hanoi_regular: 'หวยฮานอย ปกติ',
      hanoi_vip: 'หวยฮานอย VIP',
    };
    return labels[lotteryType] || lotteryType;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Group bet items by type
  const groupBetItemsByType = (betItems) => {
    const grouped = {};
    betItems.forEach((item) => {
      if (!grouped[item.bet_type]) {
        grouped[item.bet_type] = [];
      }
      grouped[item.bet_type].push(item);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-primary-gold/30 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-dark-gold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              ประวัติการแทง
            </h1>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-primary-gold text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-gold/90 transition-colors"
            >
              <Filter className="w-4 h-4" />
              ตัวกรอง
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilter && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-primary-gold text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  รอผล
                </button>
                <button
                  onClick={() => setStatusFilter('won')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    statusFilter === 'won'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  ถูกรางวัล
                </button>
                <button
                  onClick={() => setStatusFilter('lost')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    statusFilter === 'lost'
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  ไม่ถูก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-primary-gold to-primary-dark-gold text-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">ประวัติทั้งหมด</p>
              <p className="text-2xl font-bold">{total} รายการ</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Bet List */}
      <div className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-gold mx-auto mb-4" />
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : bets.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">ยังไม่มีประวัติการแทง</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block bg-white border-2 border-primary-gold/30 rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-primary-gold to-primary-dark-gold text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold">ประเภทหวย</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">วันที่ออกรางวัล</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">วันที่แทง</th>
                      <th className="px-4 py-3 text-left text-sm font-bold">เลขที่แทง</th>
                      <th className="px-4 py-3 text-right text-sm font-bold">ยอดแทง</th>
                      <th className="px-4 py-3 text-center text-sm font-bold">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bets.map((bet) => {
                      const groupedItems = groupBetItemsByType(bet.bet_items);

                      return (
                        <tr
                          key={bet._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Lottery Type */}
                          <td className="px-4 py-3">
                            <span className="font-semibold text-primary-dark-gold">
                              {bet.lottery_draw_id?.lottery_type
                                ? getLotteryTypeLabel(bet.lottery_draw_id.lottery_type)
                                : 'หวย'}
                            </span>
                          </td>

                          {/* Draw Date */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {bet.lottery_draw_id?.draw_date
                                  ? new Date(bet.lottery_draw_id.draw_date).toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '-'}
                              </span>
                            </div>
                          </td>

                          {/* Bet Date */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(bet.createdAt)}</span>
                            </div>
                          </td>

                          {/* Bet Numbers */}
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {Object.keys(groupedItems).map((betType) => {
                                const items = groupedItems[betType];
                                const numbers = items.map(item => item.number).join(', ');

                                return (
                                  <div key={betType} className="text-sm">
                                    <span className="font-semibold text-gray-700">
                                      {getBetTypeLabel(betType)}:
                                    </span>{' '}
                                    <span className="text-primary-dark-gold font-medium">
                                      {numbers}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-primary-dark-gold">
                              {bet.total_amount.toLocaleString()} ฿
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(bet.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-primary-gold/30">
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-right">
                        <span className="text-lg font-bold text-gray-700">ยอดแทงรวมทั้งหมด:</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xl font-bold text-primary-dark-gold">
                          {bets.reduce((sum, bet) => sum + bet.total_amount, 0).toLocaleString()} ฿
                        </span>
                      </td>
                      <td className="px-4 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden space-y-4">
              {bets.map((bet) => {
                const groupedItems = groupBetItemsByType(bet.bet_items);

                return (
                  <div
                    key={bet._id}
                    className="bg-white border-2 border-primary-gold/30 rounded-xl shadow-md p-4"
                  >
                    {/* Header with Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-primary-dark-gold text-lg">
                          {bet.lottery_draw_id?.lottery_type
                            ? getLotteryTypeLabel(bet.lottery_draw_id.lottery_type)
                            : 'หวย'}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {bet.lottery_draw_id?.draw_date
                              ? new Date(bet.lottery_draw_id.draw_date).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(bet.status)}
                    </div>

                    {/* Bet Date */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>แทงเมื่อ: {formatDate(bet.createdAt)}</span>
                    </div>

                    {/* Bet Numbers */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="space-y-2">
                        {Object.keys(groupedItems).map((betType) => {
                          const items = groupedItems[betType];
                          const numbers = items.map(item => item.number).join(', ');

                          return (
                            <div key={betType} className="text-sm">
                              <span className="font-semibold text-gray-700">
                                {getBetTypeLabel(betType)}:
                              </span>{' '}
                              <span className="text-primary-dark-gold font-medium">
                                {numbers}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-700">ยอดแทง:</span>
                      <span className="text-lg font-bold text-primary-dark-gold">
                        {bet.total_amount.toLocaleString()} ฿
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Mobile Total Summary */}
              <div className="bg-gradient-to-r from-primary-gold to-primary-dark-gold text-white rounded-xl p-4 sticky bottom-20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">ยอดแทงรวมทั้งหมด:</span>
                  <span className="text-xl font-bold">
                    {bets.reduce((sum, bet) => sum + bet.total_amount, 0).toLocaleString()} ฿
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg font-bold bg-white border-2 border-primary-gold/30 text-primary-dark-gold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-gold/10 transition-colors"
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2 font-bold text-gray-700">
              หน้า {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg font-bold bg-white border-2 border-primary-gold/30 text-primary-dark-gold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-gold/10 transition-colors"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
