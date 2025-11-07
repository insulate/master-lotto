import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, TrendingUp, Award, Loader2, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import betService from '../../services/betService';
import { parseErrorMessage } from '../../lib/utils';

/**
 * Bet Detail Page - หน้ารายละเอียดบิลการแทง
 */
const BetDetailPage = () => {
  const { betId } = useParams();
  const navigate = useNavigate();

  // State
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch bet detail
  useEffect(() => {
    fetchBetDetail();
  }, [betId]);

  const fetchBetDetail = async () => {
    try {
      setLoading(true);
      const response = await betService.getBetById(betId);
      setBet(response.data.bet);
    } catch (err) {
      toast.error(parseErrorMessage(err));
      navigate('/app/history');
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
      <span className={`${config.color} text-white px-4 py-2 rounded-full text-sm font-bold inline-block`}>
        {config.label}
      </span>
    );
  };

  // Get bet type label
  const getBetTypeLabel = (betType) => {
    const labels = {
      three_top: '3 ตัวบน',
      three_tod: '3 ตัวโต๊ด',
      two_top: '2 ตัวบน',
      two_bottom: '2 ตัวล่าง',
      run_top: 'วิ่งบน',
      run_bottom: 'วิ่งล่าง',
    };
    return labels[betType] || betType;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-gold mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!bet) {
    return null;
  }

  const groupedItems = groupBetItemsByType(bet.bet_items);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-primary-gold/30 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app/history')}
              className="text-primary-dark-gold hover:text-primary-gold transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-dark-gold flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                รายละเอียดบิล
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Bet Info Card */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Status & Lottery Info */}
        <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-primary-dark-gold mb-2">
                {bet.lottery_draw_id?.lottery_type || 'หวย'}
              </h2>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    งวดวันที่:{' '}
                    {bet.lottery_draw_id?.draw_date
                      ? new Date(bet.lottery_draw_id.draw_date).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>แทงเมื่อ: {formatDate(bet.createdAt)}</span>
                </div>
              </div>
            </div>
            {getStatusBadge(bet.status)}
          </div>

          {/* Bet ID */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              เลขที่บิล: <span className="font-mono text-gray-700">{bet._id}</span>
            </p>
          </div>
        </div>

        {/* Bet Items */}
        <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg mb-6">
          <h3 className="text-xl font-bold text-primary-dark-gold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            รายการเลข
          </h3>

          <div className="space-y-4">
            {Object.keys(groupedItems).map((betType) => {
              const items = groupedItems[betType];
              const typeTotal = items.reduce((sum, item) => sum + item.amount, 0);
              const typePotentialWin = items.reduce((sum, item) => sum + item.potential_win, 0);

              return (
                <div key={betType} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Type Header */}
                  <div className="bg-primary-gold/10 px-4 py-3 border-b-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-primary-dark-gold text-lg">
                        {getBetTypeLabel(betType)}
                      </h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{items.length} เลข</p>
                        <p className="font-bold text-primary-dark-gold">
                          {typeTotal.toLocaleString()} ฿
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-200">
                    {items.map((item, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-primary-dark-gold">
                              {item.number}
                            </span>
                            <div className="text-sm text-gray-600">
                              <p>จ่าย x{item.payout_rate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">แทง</p>
                            <p className="font-bold text-gray-800">{item.amount.toLocaleString()} ฿</p>
                            <p className="text-xs text-green-600">
                              (ถูกได้ {item.potential_win.toLocaleString()} ฿)
                            </p>
                          </div>
                        </div>

                        {/* Show win status for completed bets */}
                        {bet.status === 'won' && item.is_winner && (
                          <div className="mt-2 pt-2 border-t border-green-200 bg-green-50 -mx-4 px-4 py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-green-700">
                                <Award className="w-5 h-5" />
                                <span className="font-bold">ถูกรางวัล!</span>
                              </div>
                              <span className="font-bold text-green-700 text-lg">
                                +{item.win_amount?.toLocaleString() || item.potential_win.toLocaleString()} ฿
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Type Footer */}
                  <div className="bg-gray-50 px-4 py-3 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">รวมประเภทนี้</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{typeTotal.toLocaleString()} ฿</p>
                        {bet.status === 'pending' && (
                          <p className="text-xs text-green-600">
                            (ถูกได้ {typePotentialWin.toLocaleString()} ฿)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-primary-gold to-primary-dark-gold text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">สรุปยอด</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/20">
              <span className="opacity-90">ยอดแทงทั้งหมด</span>
              <span className="text-2xl font-bold">{bet.total_amount.toLocaleString()} ฿</span>
            </div>

            {bet.status === 'pending' && (
              <div className="flex items-center justify-between">
                <span className="opacity-90">ถูกได้สูงสุด</span>
                <span className="text-2xl font-bold text-green-300">
                  {bet.total_potential_win.toLocaleString()} ฿
                </span>
              </div>
            )}

            {bet.status === 'won' && bet.total_win_amount > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="opacity-90 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    ยอดถูกรางวัล
                  </span>
                  <span className="text-2xl font-bold text-green-300">
                    +{bet.total_win_amount.toLocaleString()} ฿
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <span className="opacity-90">กำไร/ขาดทุน</span>
                  <span className={`text-2xl font-bold ${
                    bet.total_win_amount - bet.total_amount >= 0 ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {bet.total_win_amount - bet.total_amount >= 0 ? '+' : ''}
                    {(bet.total_win_amount - bet.total_amount).toLocaleString()} ฿
                  </span>
                </div>
              </>
            )}

            {bet.status === 'lost' && (
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="opacity-90">ขาดทุน</span>
                <span className="text-2xl font-bold text-red-300">
                  -{bet.total_amount.toLocaleString()} ฿
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Draw Result (if available) */}
        {bet.lottery_draw_id?.result && bet.lottery_draw_id.result.length > 0 && (
          <div className="bg-white border-2 border-primary-gold/30 rounded-xl p-6 shadow-lg mt-6">
            <h3 className="text-xl font-bold text-primary-dark-gold mb-4">ผลการออกรางวัล</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bet.lottery_draw_id.result.map((prize, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{prize.prize_name}</p>
                  <p className="text-2xl font-bold text-primary-dark-gold">{prize.number}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetDetailPage;
