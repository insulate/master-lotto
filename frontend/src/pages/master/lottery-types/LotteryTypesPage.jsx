import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import lotteryDrawService from '../lottery-draws/lotteryDrawService';
import lotteryTypeService from './lotteryTypeService';
import DataTable from '../../../components/common/DataTable';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lotteryStats, setLotteryStats] = useState([]);
  const [lotteryTypes, setLotteryTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const fetchLotteryTypes = useCallback(async () => {
    try {
      const response = await lotteryTypeService.getAll();
      const types = response.data.lotteryTypes || [];
      setLotteryTypes(types);
      return types;
    } catch (err) {
      toast.error(parseErrorMessage(err));
      return [];
    }
  }, []);

  const fetchLotteryStats = useCallback(async () => {
    try {
      setLoading(true);

      // First, fetch lottery types from API
      const types = await fetchLotteryTypes();

      // Fetch stats for each lottery type
      const statsPromises = types.map(async (type) => {
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
  }, [fetchLotteryTypes]);

  useEffect(() => {
    fetchLotteryStats();
  }, [fetchLotteryStats]);

  const handleManageClick = (lotteryType) => {
    navigate(`/master/lottery-draws?type=${lotteryType}`);
  };

  const handleToggleStatusClick = (type) => {
    setSelectedType(type);
    setStatusDialogOpen(true);
  };

  const closeAllModals = () => {
    setStatusDialogOpen(false);
    setSelectedType(null);
  };

  const handleToggleStatus = async () => {
    try {
      setSubmitLoading(true);
      const newStatus = !selectedType.enabled;
      await lotteryTypeService.toggleStatus(selectedType._id, newStatus);
      toast.success(
        `${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}${selectedType.label}สำเร็จ`
      );
      fetchLotteryStats();
      closeAllModals();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
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
      key: 'enabled',
      label: 'สถานะ',
      sortable: true,
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value
              ? 'border border-emerald-300 text-emerald-700 bg-emerald-50'
              : 'border border-gray-300 text-gray-700 bg-gray-50'
          }`}
        >
          {value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleManageClick(row.value)}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            จัดการงวดหวย
          </button>
          <button
            onClick={() => handleToggleStatusClick(row)}
            className={`px-4 py-2 ${
              row.enabled
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-500 hover:bg-emerald-600'
            } text-white font-semibold rounded-lg transition-colors shadow-sm`}
          >
            {row.enabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-light-gold mb-2">จัดการหวย</h1>
        <p className="text-text-muted">Master: {user?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">ประเภทหวยทั้งหมด</div>
          <div className="text-2xl font-bold text-amber-600">{lotteryTypes.length}</div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">งวดที่เปิดรับแทง</div>
          <div className="text-2xl font-bold text-emerald-600">
            {lotteryStats.reduce((sum, stat) => sum + stat.open, 0)} งวด
          </div>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">งวดที่ปิดรับแทง</div>
          <div className="text-2xl font-bold text-orange-600">
            {lotteryStats.reduce((sum, stat) => sum + stat.closed, 0)} งวด
          </div>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
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
        rowClassName={(row) => (!row.enabled ? 'bg-red-50' : '')}
        disableHover={true}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusDialogOpen}
        onClose={closeAllModals}
        onConfirm={handleToggleStatus}
        title={
          selectedType?.enabled
            ? 'ยืนยันการปิดใช้งาน'
            : 'ยืนยันการเปิดใช้งาน'
        }
        message={`คุณต้องการ${
          selectedType?.enabled ? 'ปิด' : 'เปิด'
        }ใช้งาน ${selectedType?.label} หรือไม่?`}
        type="warning"
        loading={submitLoading}
      />
    </div>
  );
};

export default LotteryTypesOverview;
