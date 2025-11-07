import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import lotteryDrawService from './lotteryDrawService';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';
import AutoCreateModal from './AutoCreateModal';
import {
  formatDateTime,
  parseErrorMessage,
} from '../../../lib/utils';
import toast from 'react-hot-toast';

/**
 * Lottery Draw Management Page
 * หน้าจัดการงวดหวยสำหรับ Master
 */
const LotteryDrawManagement = () => {
  // Authentication
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get lottery type from URL
  const typeFromUrl = searchParams.get('type') || 'all';

  // State Management
  const [lotteryDraws, setLotteryDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [lotteryTypeFilter, setLotteryTypeFilter] = useState(typeFromUrl);
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination (handled by backend)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [autoCreateModalOpen, setAutoCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Selected Lottery Draw
  const [selectedDraw, setSelectedDraw] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    lottery_type: 'government',
    draw_date: '',
    open_time: '',
    close_time: '',
    bet_settings: {
      three_top: { payout_rate: 900, min_bet: 1, max_bet: 10000, enabled: true },
      three_bottom: { payout_rate: 150, min_bet: 1, max_bet: 10000, enabled: true },
      two_top: { payout_rate: 90, min_bet: 1, max_bet: 10000, enabled: true },
      two_bottom: { payout_rate: 90, min_bet: 1, max_bet: 10000, enabled: true },
      run_top: { payout_rate: 3, min_bet: 1, max_bet: 10000, enabled: true },
      run_bottom: { payout_rate: 3, min_bet: 1, max_bet: 10000, enabled: true },
    },
  });

  const [resultFormData, setResultFormData] = useState({
    three_top: '',
    two_top: '',
    two_bottom: '',
    run_top: '',
    run_bottom: '',
  });

  const [targetStatus, setTargetStatus] = useState('');

  // Loading States
  const [submitLoading, setSubmitLoading] = useState(false);

  // Lottery Type Options
  const lotteryTypes = [
    { value: 'government', label: 'รัฐบาล' },
    { value: 'lao_pattana', label: 'ลาวพัฒนา' },
    { value: 'hanoi_regular', label: 'ฮานอยปกติ' },
    { value: 'hanoi_vip', label: 'ฮานอย VIP' },
  ];

  // Status Options
  const statusOptions = [
    { value: 'open', label: 'เปิดรับแทง', color: 'text-accent-success border-accent-success bg-accent-success/10' },
    { value: 'closed', label: 'ปิดรับแทง', color: 'text-accent-warning border-accent-warning bg-accent-warning/10' },
    { value: 'completed', label: 'ประกาศผล', color: 'text-accent-info border-accent-info bg-accent-info/10' },
    { value: 'cancelled', label: 'ยกเลิก', color: 'text-accent-error border-accent-error bg-accent-error/10' },
  ];

  // Fetch all lottery draws
  const fetchLotteryDraws = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (lotteryTypeFilter !== 'all') {
        params.lottery_type = lotteryTypeFilter;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await lotteryDrawService.getAll(params);
      setLotteryDraws(response.data.lotteryDraws || []);

      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, lotteryTypeFilter, statusFilter]);

  // Fetch lottery draws on component mount and filter change
  useEffect(() => {
    fetchLotteryDraws();
  }, [fetchLotteryDraws]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [lotteryTypeFilter, statusFilter]);

  // Update URL when lottery type filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (lotteryTypeFilter !== 'all') {
      params.set('type', lotteryTypeFilter);
    }
    const newSearch = params.toString();
    const newPath = newSearch ? `?${newSearch}` : window.location.pathname;
    navigate(newPath, { replace: true });
  }, [lotteryTypeFilter, navigate]);

  // Helper function to format date for datetime-local input (Bangkok timezone)
  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper: Get lottery type label
  const getLotteryTypeLabel = (type) => {
    const found = lotteryTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  // Helper: Get status badge with pending check
  const getStatusBadge = (status, openTime) => {
    // Check if status is 'open' but not yet reached open_time
    if (status === 'open' && openTime) {
      const now = new Date();
      const open = new Date(openTime);

      if (now < open) {
        // Show "รอเปิด" status for draws that haven't started yet
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium border text-accent-warning border-accent-warning bg-accent-warning/10">
            รอเปิด
          </span>
        );
      }
    }

    const found = statusOptions.find((s) => s.value === status);
    if (!found) return null;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${found.color}`}>
        {found.label}
      </span>
    );
  };

  // Helper: Format draw date in Thai format with time (Bangkok timezone)
  const formatDrawDate = (dateString) => {
    const date = new Date(dateString);

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    // Use local time methods (Bangkok timezone)
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // Convert to Buddhist year
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
  };

  // Table Columns Configuration
  const columns = [
    {
      key: 'lottery_type',
      label: 'ประเภทหวย',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-bg-dark">{getLotteryTypeLabel(value)}</span>
      ),
    },
    {
      key: 'draw_date',
      label: 'วันออกผล',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{formatDrawDate(value)}</span>
      ),
    },
    {
      key: 'open_time',
      label: 'เปิดรับแทง',
      render: (value) => (
        <span className="text-xs text-text-muted">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'close_time',
      label: 'ปิดรับแทง',
      render: (value) => (
        <span className="text-xs text-text-muted">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      sortable: true,
      render: (value, row) => getStatusBadge(value, row.open_time),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.status === 'open' && (
            <>
              <button
                onClick={() => handleEditClick(row)}
                className="px-3 py-1 bg-accent-info hover:bg-accent-info/90 text-white text-xs rounded transition-colors"
              >
                แก้ไข
              </button>
              <button
                onClick={() => handleStatusChangeClick(row, 'closed')}
                className="px-3 py-1 bg-accent-warning hover:bg-accent-warning/90 text-white text-xs rounded transition-colors"
              >
                ปิดรับแทง
              </button>
            </>
          )}
          {row.status === 'closed' && (
            <button
              onClick={() => handleResultClick(row)}
              className="px-3 py-1 bg-primary-mustard hover:bg-primary-dark-gold text-white text-xs rounded transition-colors"
            >
              ประกาศผล
            </button>
          )}
          {row.status === 'completed' && (
            <button
              onClick={() => handleViewResultClick(row)}
              className="px-3 py-1 bg-primary-gold hover:bg-primary-light-gold text-white text-xs rounded transition-colors"
            >
              ดูผล
            </button>
          )}
          {(row.status === 'open' || row.status === 'cancelled') && (
            <button
              onClick={() => handleDeleteClick(row)}
              className="px-3 py-1 bg-accent-error hover:bg-accent-error/90 text-white text-xs rounded transition-colors"
            >
              ลบ
            </button>
          )}
          {row.status !== 'cancelled' && row.status !== 'completed' && (
            <button
              onClick={() => handleStatusChangeClick(row, 'cancelled')}
              className="px-3 py-1 bg-neutral-gray hover:bg-neutral-gray/90 text-white text-xs rounded transition-colors"
            >
              ยกเลิก
            </button>
          )}
        </div>
      ),
    },
  ];

  // Handle Create Click
  const handleCreateClick = () => {
    // Set default dates (Bangkok timezone)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setFormData({
      lottery_type: 'government',
      draw_date: formatDateTimeLocal(tomorrow),
      open_time: formatDateTimeLocal(now),
      close_time: formatDateTimeLocal(tomorrow),
      bet_settings: {
        three_top: { payout_rate: 900, min_bet: 1, max_bet: 10000, enabled: true },
        three_bottom: { payout_rate: 150, min_bet: 1, max_bet: 10000, enabled: true },
        two_top: { payout_rate: 90, min_bet: 1, max_bet: 10000, enabled: true },
        two_bottom: { payout_rate: 90, min_bet: 1, max_bet: 10000, enabled: true },
        run_top: { payout_rate: 3, min_bet: 1, max_bet: 10000, enabled: true },
        run_bottom: { payout_rate: 3, min_bet: 1, max_bet: 10000, enabled: true },
      },
    });
    setCreateModalOpen(true);
  };

  // Handle Edit Click
  const handleEditClick = (draw) => {
    setSelectedDraw(draw);
    setFormData({
      lottery_type: draw.lottery_type,
      draw_date: formatDateTimeLocal(draw.draw_date),
      open_time: formatDateTimeLocal(draw.open_time),
      close_time: formatDateTimeLocal(draw.close_time),
      bet_settings: draw.bet_settings,
    });
    setEditModalOpen(true);
  };

  // Handle Result Click
  const handleResultClick = (draw) => {
    setSelectedDraw(draw);
    setResultFormData({
      three_top: '',
      two_top: '',
      two_bottom: '',
      run_top: '',
      run_bottom: '',
    });
    setResultModalOpen(true);
  };

  // Handle View Result Click
  const handleViewResultClick = (draw) => {
    setSelectedDraw(draw);
    const result = draw.result || {};
    setResultFormData({
      three_top: result.three_top || '',
      two_top: result.two_top || '',
      two_bottom: result.two_bottom || '',
      run_top: Array.isArray(result.run_top) ? result.run_top.join(',') : '',
      run_bottom: Array.isArray(result.run_bottom) ? result.run_bottom.join(',') : '',
    });
    setResultModalOpen(true);
  };

  // Handle Status Change Click
  const handleStatusChangeClick = (draw, status) => {
    setSelectedDraw(draw);
    setTargetStatus(status);
    setStatusDialogOpen(true);
  };

  // Handle Delete Click
  const handleDeleteClick = (draw) => {
    setSelectedDraw(draw);
    setDeleteDialogOpen(true);
  };

  // Create Lottery Draw
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Send datetime-local values directly (will be interpreted as Bangkok timezone by backend)
      await lotteryDrawService.create(formData);

      toast.success('สร้างงวดหวยสำเร็จ');
      setCreateModalOpen(false);
      fetchLotteryDraws();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Update Lottery Draw
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Send datetime-local values directly (will be interpreted as Bangkok timezone by backend)
      const updateData = {
        draw_date: formData.draw_date,
        open_time: formData.open_time,
        close_time: formData.close_time,
        bet_settings: formData.bet_settings,
      };

      await lotteryDrawService.update(selectedDraw._id, updateData);

      toast.success('แก้ไขงวดหวยสำเร็จ');
      setEditModalOpen(false);
      fetchLotteryDraws();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Update Result
  const handleUpdateResult = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Convert comma-separated strings to arrays
      const resultData = {
        three_top: resultFormData.three_top,
        two_top: resultFormData.two_top,
        two_bottom: resultFormData.two_bottom,
        run_top: resultFormData.run_top
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        run_bottom: resultFormData.run_bottom
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
      };

      await lotteryDrawService.updateResult(selectedDraw._id, resultData);

      toast.success('ประกาศผลรางวัลสำเร็จ');
      setResultModalOpen(false);
      fetchLotteryDraws();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Change Status
  const handleStatusChange = async () => {
    try {
      setSubmitLoading(true);

      await lotteryDrawService.updateStatus(selectedDraw._id, targetStatus);

      const statusLabel = statusOptions.find(s => s.value === targetStatus)?.label || targetStatus;
      toast.success(`เปลี่ยนสถานะเป็น${statusLabel}สำเร็จ`);
      setStatusDialogOpen(false);
      fetchLotteryDraws();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Lottery Draw
  const handleDelete = async () => {
    try {
      setSubmitLoading(true);

      await lotteryDrawService.delete(selectedDraw._id);

      toast.success('ลบงวดหวยสำเร็จ');
      setDeleteDialogOpen(false);
      fetchLotteryDraws();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Auto Create
  const handleAutoCreate = async (formData) => {
    try {
      setSubmitLoading(true);

      const response = await lotteryDrawService.bulkCreate(formData);

      // Show success message
      toast.success(response.message || `สร้างงวดหวยสำเร็จ ${response.data.created} งวด`);

      // Show errors if any
      if (response.data.errors && response.data.errors.length > 0) {
        toast.error(`พบข้อผิดพลาด ${response.data.errors.length} รายการ กรุณาตรวจสอบ`);
        console.error('Bulk create errors:', response.data.errors);
      }

      setAutoCreateModalOpen(false);
      fetchLotteryDraws();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader
        title="จัดการงวดหวย"
        subtitle={`Master: ${user?.name}`}
      />

      {/* Filters and Create Button */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          {/* Lottery Type Filter */}
          <select
            value={lotteryTypeFilter}
            onChange={(e) => setLotteryTypeFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold text-sm"
          >
            <option value="all">ทุกประเภทหวย</option>
            {lotteryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold text-sm"
          >
            <option value="all">ทุกสถานะ</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          {/* <button
            onClick={() => setAutoCreateModalOpen(true)}
            className="px-6 py-2 bg-accent-info hover:bg-accent-info/90 text-white font-semibold rounded-lg transition-colors"
          >
            ⚡ สร้างอัตโนมัติ
          </button> */}
          <button
            onClick={handleCreateClick}
            className="px-6 py-2 bg-primary-gold text-bg-dark font-semibold rounded-lg"
          >
            + สร้างงวดหวยใหม่
          </button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">กำลังโหลด...</div>
      ) : lotteryDraws.length === 0 ? (
        <div className="text-center py-12 text-text-muted">ไม่พบข้อมูลงวดหวย</div>
      ) : (
        <>
          <DataTable columns={columns} data={lotteryDraws} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg hover:bg-neutral-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ก่อนหน้า
              </button>

              <span className="px-4 py-2 text-text-muted">
                หน้า {currentPage} จาก {totalPages} (รวม {total} รายการ)
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg hover:bg-neutral-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="สร้างงวดหวยใหม่"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Lottery Type */}
          <div>
            <label className="block text-sm font-medium mb-2">ประเภทหวย</label>
            <select
              value={formData.lottery_type}
              onChange={(e) => setFormData({ ...formData, lottery_type: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            >
              {lotteryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Draw Date */}
          <div>
            <label className="block text-sm font-medium mb-2">วันออกผล</label>
            <input
              type="datetime-local"
              value={formData.draw_date}
              onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
          </div>

          {/* Open Time */}
          <div>
            <label className="block text-sm font-medium mb-2">เวลาเปิดรับแทง</label>
            <input
              type="datetime-local"
              value={formData.open_time}
              onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
          </div>

          {/* Close Time */}
          <div>
            <label className="block text-sm font-medium mb-2">เวลาปิดรับแทง</label>
            <input
              type="datetime-local"
              value={formData.close_time}
              onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
          </div>

          {/* Bet Settings (simplified - can be expanded) */}
          <div className="text-sm text-text-muted">
            <p>* ใช้ค่า Bet Settings เริ่มต้น (สามารถแก้ไขได้ภายหลัง)</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-6 py-2 bg-neutral-gray hover:bg-neutral-gray/90 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2 bg-primary-gold hover:bg-primary-light-gold text-neutral-charcoal font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {submitLoading ? 'กำลังสร้าง...' : 'สร้าง'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="แก้ไขงวดหวย"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Draw Date */}
          <div>
            <label className="block text-sm font-medium mb-2">วันออกผล</label>
            <input
              type="datetime-local"
              value={formData.draw_date}
              onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
          </div>

          {/* Open Time */}
          <div>
            <label className="block text-sm font-medium mb-2">เวลาเปิดรับแทง</label>
            <input
              type="datetime-local"
              value={formData.open_time}
              onChange={(e) => setFormData({ ...formData, open_time: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
          </div>

          {/* Close Time */}
          <div>
            <label className="block text-sm font-medium mb-2">เวลาปิดรับแทง</label>
            <input
              type="datetime-local"
              value={formData.close_time}
              onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-6 py-2 bg-neutral-gray hover:bg-neutral-gray/90 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2 bg-primary-gold hover:bg-primary-light-gold text-neutral-charcoal font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {submitLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={selectedDraw?.status === 'completed' ? 'ผลรางวัล' : 'ประกาศผลรางวัล'}
      >
        <form onSubmit={handleUpdateResult} className="space-y-4">
          {/* Three Top */}
          <div>
            <label className="block text-sm font-medium mb-2">3 ตัวบน</label>
            <input
              type="text"
              maxLength={3}
              value={resultFormData.three_top}
              onChange={(e) => setResultFormData({ ...resultFormData, three_top: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              placeholder="เช่น 123"
              disabled={selectedDraw?.status === 'completed'}
            />
          </div>

          {/* Two Top */}
          <div>
            <label className="block text-sm font-medium mb-2">2 ตัวบน</label>
            <input
              type="text"
              maxLength={2}
              value={resultFormData.two_top}
              onChange={(e) => setResultFormData({ ...resultFormData, two_top: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              placeholder="เช่น 12"
              disabled={selectedDraw?.status === 'completed'}
            />
          </div>

          {/* Two Bottom */}
          <div>
            <label className="block text-sm font-medium mb-2">2 ตัวล่าง</label>
            <input
              type="text"
              maxLength={2}
              value={resultFormData.two_bottom}
              onChange={(e) => setResultFormData({ ...resultFormData, two_bottom: e.target.value })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              placeholder="เช่น 34"
              disabled={selectedDraw?.status === 'completed'}
            />
          </div>

          {/* Run Top */}
          <div>
            <label className="block text-sm font-medium mb-2">วิ่งบน (คั่นด้วยเครื่องหมายจุลภาค)</label>
            <input
              type="text"
              value={resultFormData.run_top}
              onChange={(e) => setResultFormData({
                ...resultFormData,
                run_top: e.target.value
              })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              placeholder="เช่น 1,2,3"
              disabled={selectedDraw?.status === 'completed'}
            />
          </div>

          {/* Run Bottom */}
          <div>
            <label className="block text-sm font-medium mb-2">วิ่งล่าง (คั่นด้วยเครื่องหมายจุลภาค)</label>
            <input
              type="text"
              value={resultFormData.run_bottom}
              onChange={(e) => setResultFormData({
                ...resultFormData,
                run_bottom: e.target.value
              })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              placeholder="เช่น 4,5,6"
              disabled={selectedDraw?.status === 'completed'}
            />
          </div>

          {/* Submit Button */}
          {selectedDraw?.status !== 'completed' && (
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setResultModalOpen(false)}
                className="px-6 py-2 bg-neutral-gray hover:bg-neutral-gray/90 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-primary-gold hover:bg-primary-light-gold text-neutral-charcoal font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {submitLoading ? 'กำลังบันทึก...' : 'ประกาศผล'}
              </button>
            </div>
          )}

          {selectedDraw?.status === 'completed' && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setResultModalOpen(false)}
                className="px-6 py-2 bg-neutral-gray hover:bg-neutral-gray/90 rounded-lg transition-colors"
              >
                ปิด
              </button>
            </div>
          )}
        </form>
      </Modal>

      {/* Status Change Confirm Dialog */}
      <ConfirmDialog
        isOpen={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={handleStatusChange}
        title="ยืนยันการเปลี่ยนสถานะ"
        message={`คุณต้องการเปลี่ยนสถานะเป็น "${statusOptions.find(s => s.value === targetStatus)?.label}" ใช่หรือไม่?`}
        loading={submitLoading}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="ยืนยันการลบ"
        message="คุณต้องการลบงวดหวยนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        loading={submitLoading}
        confirmText="ลบ"
        confirmButtonClass="bg-accent-error hover:bg-accent-error/90"
      />

      {/* Auto Create Modal */}
      <AutoCreateModal
        isOpen={autoCreateModalOpen}
        onClose={() => setAutoCreateModalOpen(false)}
        onSubmit={handleAutoCreate}
        loading={submitLoading}
      />
    </div>
  );
};

export default LotteryDrawManagement;
