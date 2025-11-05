import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import lotteryDrawService from '../lottery-draws/lotteryDrawService';
import DataTable from '../../../components/common/DataTable';
import { parseErrorMessage } from '../../../lib/utils';
import toast from 'react-hot-toast';

/**
 * Lottery Types Overview Page
 * หน้าแสดงภาพรวมประเภทหวยและจำนวนงวด
 */
const LotteryTypesOverview = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lotteryStats, setLotteryStats] = useState([]);

  // Lottery type definitions (memoized to prevent re-render issues)
  const lotteryTypes = useMemo(() => [
    {
      value: 'government',
      label: 'หวยรัฐบาล',
      description: 'หวยรัฐบาลไทย ออกวันที่ 1 และ 16 ของทุกเดือน',
      icon: '🏛️'
    },
    {
      value: 'lao_pattana',
      label: 'หวยลาวพัฒนา',
      description: 'หวยลาว ออกทุกวันจันทร์ และวันพฤหัสบดี',
      icon: '🇱🇦'
    },
    {
      value: 'hanoi_regular',
      label: 'หวยฮานอยปกติ',
      description: 'หวยฮานอย ออกทุกวัน เวลา 18:00 น.',
      icon: '🇻🇳'
    },
    {
      value: 'hanoi_vip',
      label: 'หวยฮานอย VIP',
      description: 'หวยฮานอย VIP ออกทุกวัน เวลา 21:00 น.',
      icon: '⭐'
    },
  ], []);

  const fetchLotteryStats = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch stats for each lottery type
      const statsPromises = lotteryTypes.map(async (type) => {
        try {
          // Get all draws for this type
          const allResponse = await lotteryDrawService.getAll({
            lottery_type: type.value,
            limit: 1000
          });
          const allDraws = allResponse.data.lotteryDraws || [];

          // Get open draws
          const openResponse = await lotteryDrawService.getAll({
            lottery_type: type.value,
            status: 'open',
            limit: 1000
          });
          const openDraws = openResponse.data.lotteryDraws || [];

          // Get closed draws
          const closedResponse = await lotteryDrawService.getAll({
            lottery_type: type.value,
            status: 'closed',
            limit: 1000
          });
          const closedDraws = closedResponse.data.lotteryDraws || [];

          // Get completed draws
          const completedResponse = await lotteryDrawService.getAll({
            lottery_type: type.value,
            status: 'completed',
            limit: 1000
          });
          const completedDraws = completedResponse.data.lotteryDraws || [];

          return {
            ...type,
            total: allDraws.length,
            open: openDraws.length,
            closed: closedDraws.length,
            completed: completedDraws.length,
          };
        } catch (err) {
          console.error(`Error fetching stats for ${type.value}:`, err);
          return {
            ...type,
            total: 0,
            open: 0,
            closed: 0,
            completed: 0,
          };
        }
      });

      const stats = await Promise.all(statsPromises);
      setLotteryStats(stats);
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [lotteryTypes]);

  useEffect(() => {
    fetchLotteryStats();
  }, [fetchLotteryStats]);

  const handleManageClick = (lotteryType) => {
    navigate(`/master/lottery-draws?type=${lotteryType}`);
  };

  const columns = [
    {
      key: 'icon',
      label: '',
      render: (value) => (
        <span className="text-3xl">{value}</span>
      ),
    },
    {
      key: 'label',
      label: 'ประเภทหวย',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-lg text-gray-800">{value}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'งวดทั้งหมด',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-700">{value} งวด</span>
      ),
    },
    {
      key: 'open',
      label: 'เปิดรับแทง',
      sortable: true,
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-emerald-300 text-emerald-700 bg-emerald-50">
          {value} งวด
        </span>
      ),
    },
    {
      key: 'closed',
      label: 'ปิดรับแทง',
      sortable: true,
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-orange-300 text-orange-700 bg-orange-50">
          {value} งวด
        </span>
      ),
    },
    {
      key: 'completed',
      label: 'ประกาศผลแล้ว',
      sortable: true,
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium border border-blue-300 text-blue-700 bg-blue-50">
          {value} งวด
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      render: (_, row) => (
        <button
          onClick={() => handleManageClick(row.value)}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          จัดการงวดหวย
        </button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการหวย</h1>
        <p className="text-gray-600">Master: {user?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">ประเภทหวยทั้งหมด</div>
          <div className="text-2xl font-bold text-amber-600">{lotteryTypes.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">งวดที่เปิดรับแทง</div>
          <div className="text-2xl font-bold text-emerald-600">
            {lotteryStats.reduce((sum, stat) => sum + stat.open, 0)} งวด
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">งวดที่ปิดรับแทง</div>
          <div className="text-2xl font-bold text-orange-600">
            {lotteryStats.reduce((sum, stat) => sum + stat.closed, 0)} งวด
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">งวดทั้งหมด</div>
          <div className="text-2xl font-bold text-blue-600">
            {lotteryStats.reduce((sum, stat) => sum + stat.total, 0)} งวด
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={lotteryStats}
        loading={loading}
        emptyMessage="ไม่พบข้อมูลประเภทหวย"
      />
    </div>
  );
};

export default LotteryTypesOverview;
