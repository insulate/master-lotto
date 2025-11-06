import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import agentService from './agentService';
import lotteryTypeService from '../lottery-types/lotteryTypeService';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import PageHeader from '../../../components/common/PageHeader';
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  parseErrorMessage,
  isValidUsername,
  isValidPassword,
} from '../../../lib/utils';
import toast from 'react-hot-toast';

/**
 * Agent Management Page
 * หน้าจัดการเอเย่นต์สำหรับ Master
 */
const AgentManagement = () => {
  // Authentication
  const { user } = useAuthStore();

  // State Management
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lotteryTypes, setLotteryTypes] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditHistoryModalOpen, setCreditHistoryModalOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);

  // Selected Agent
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Credit History State
  const [creditHistory, setCreditHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    credit: 0,
  });

  const [creditFormData, setCreditFormData] = useState({
    amount: 0,
    action: 'add',
  });

  // Loading States
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filter credit history by selected date
  const filteredHistory = useMemo(() => {
    return creditHistory.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
      return transactionDate === selectedDate;
    });
  }, [creditHistory, selectedDate]);

  // Fetch agents and lottery types on component mount
  useEffect(() => {
    fetchAgents();
    fetchLotteryTypes();
  }, []);

  // Fetch all agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentService.getAll();
      setAgents(response.data.agents || []);
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch all lottery types
  const fetchLotteryTypes = async () => {
    try {
      const response = await lotteryTypeService.getAll();
      setLotteryTypes(response.data.lotteryTypes || []);
    } catch (err) {
      toast.error(parseErrorMessage(err));
    }
  };

  // Filter and search agents
  const filteredAgents = agents.filter((agent) => {
    const matchSearch =
      agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || agent.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Table Columns Configuration
  const columns = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
    },
    {
      key: 'name',
      label: 'ชื่อ-นามสกุล',
      sortable: true,
    },
    {
      key: 'credit',
      label: 'เครดิต',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-primary-light-gold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      sortable: true,
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            value
          )}`}
        >
          {getStatusLabel(value)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'วันที่สร้าง',
      sortable: true,
      render: (value) => (
        <span className="text-text-muted text-xs">{formatDateTime(value)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditClick(row)}
            className="px-3 py-1 bg-accent-info hover:bg-accent-info/90 text-white text-xs rounded transition-colors"
          >
            แก้ไข
          </button>
          <button
            onClick={() => handleCommissionClick(row)}
            className="px-3 py-1 bg-accent-info hover:bg-accent-info/90 text-white text-xs rounded transition-colors"
            title="จัดการค่าคอมมิชชัน"
          >
            จัดการค่าคอม
          </button>
          <button
            onClick={() => handleCreditClick(row)}
            className="px-3 py-1 bg-primary-mustard hover:bg-primary-dark-gold text-white text-xs rounded transition-colors"
          >
            ปรับเครดิต
          </button>
          <button
            onClick={() => handleCreditHistoryClick(row)}
            className="px-3 py-1 bg-primary-gold hover:bg-primary-light-gold text-white text-xs rounded transition-colors"
          >
            ประวัติเครดิต
          </button>
          <button
            onClick={() => handleStatusClick(row)}
            className={`px-3 py-1 text-white text-xs rounded transition-colors ${
              row.status === 'active'
                ? 'bg-accent-error hover:bg-accent-error/90'
                : 'bg-accent-success hover:bg-accent-success/90'
            }`}
          >
            {row.status === 'active' ? 'ระงับ' : 'เปิดใช้งาน'}
          </button>
        </div>
      ),
    },
  ];

  // Handle Create Agent Click
  const handleCreateClick = () => {
    setFormData({
      username: '',
      name: '',
      password: '',
      credit: 0,
    });
    setCreateModalOpen(true);
  };

  // Handle Edit Click
  const handleEditClick = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      username: agent.username,
      name: agent.name,
      password: '',
      credit: agent.credit,
    });
    setEditModalOpen(true);
  };

  // Handle Commission Click
  const handleCommissionClick = (agent) => {
    setSelectedAgent(agent);
    setCommissionModalOpen(true);
  };

  // Handle Credit Click
  const handleCreditClick = (agent) => {
    setSelectedAgent(agent);
    setCreditFormData({
      amount: 0,
      action: 'add',
    });
    setCreditModalOpen(true);
  };

  // Handle Status Click
  const handleStatusClick = (agent) => {
    setSelectedAgent(agent);
    setStatusDialogOpen(true);
  };

  // Handle Credit History Click
  const handleCreditHistoryClick = async (agent) => {
    setSelectedAgent(agent);
    setCreditHistoryModalOpen(true);
    setHistoryLoading(true);

    // Reset to today's date
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);

    try {
      const result = await agentService.getCreditHistory(agent._id);
      setCreditHistory(result.data.transactions || []);
    } catch (err) {
      toast.error(parseErrorMessage(err));
      setCreditHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Close all modals
  const closeAllModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setCreditModalOpen(false);
    setCreditHistoryModalOpen(false);
    setStatusDialogOpen(false);
    setCommissionModalOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader
        title="จัดการเอเย่นต์"
        subtitle={`ผู้ใช้: ${user?.name}`}
        rightContent={
          <button
            onClick={handleCreateClick}
            className="px-6 py-3 bg-accent-success hover:bg-accent-success/90 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 shadow-md"
          >
            <span>+</span>
            <span>สร้างเอเย่นต์ใหม่</span>
          </button>
        }
      />

      {/* Search & Filter */}
      <div className="bg-bg-card rounded-lg p-4 mb-6 border border-border-default shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-text-secondary mb-2 font-medium">ค้นหา</label>
            <input
              type="text"
              placeholder="ค้นหาด้วย Username หรือชื่อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-text-secondary mb-2 font-medium">สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="suspended">ระงับ</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-text-muted">
          พบ {filteredAgents.length} รายการ
          {searchTerm && ` จากการค้นหา "${searchTerm}"`}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-bg-card rounded-lg overflow-hidden border border-border-default shadow-md">
        <DataTable
          columns={columns}
          data={paginatedAgents}
          loading={loading}
          emptyMessage="ไม่พบข้อมูลเอเย่นต์"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 p-4 border-t border-border-default bg-bg-light-cream">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#6c757d] text-white rounded hover:bg-[#5a6268] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ก่อนหน้า
            </button>

            <span className="text-text-secondary font-medium">
              หน้า {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#6c757d] text-white rounded hover:bg-[#5a6268] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={createModalOpen}
        onClose={closeAllModals}
        formData={formData}
        setFormData={setFormData}
        submitLoading={submitLoading}
        setSubmitLoading={setSubmitLoading}
        fetchAgents={fetchAgents}
        masterCredit={user?.credit || 0}
      />

      {/* Edit Agent Modal */}
      <EditAgentModal
        isOpen={editModalOpen}
        onClose={closeAllModals}
        selectedAgent={selectedAgent}
        formData={formData}
        setFormData={setFormData}
        submitLoading={submitLoading}
        setSubmitLoading={setSubmitLoading}
        fetchAgents={fetchAgents}
      />

      {/* Commission Management Modal */}
      <ManageCommissionModal
        isOpen={commissionModalOpen}
        onClose={closeAllModals}
        selectedAgent={selectedAgent}
        lotteryTypes={lotteryTypes}
        submitLoading={submitLoading}
        setSubmitLoading={setSubmitLoading}
        fetchAgents={fetchAgents}
      />

      {/* Adjust Credit Modal */}
      <AdjustCreditModal
        isOpen={creditModalOpen}
        onClose={closeAllModals}
        selectedAgent={selectedAgent}
        creditFormData={creditFormData}
        setCreditFormData={setCreditFormData}
        submitLoading={submitLoading}
        setSubmitLoading={setSubmitLoading}
        fetchAgents={fetchAgents}
        masterCredit={user?.credit || 0}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusDialogOpen}
        onClose={closeAllModals}
        onConfirm={async () => {
          try {
            setSubmitLoading(true);
            const newStatus = selectedAgent.status === 'active' ? 'suspended' : 'active';
            await agentService.toggleStatus(selectedAgent._id, newStatus);
            toast.success(
              `${newStatus === 'active' ? 'เปิดใช้งาน' : 'ระงับ'}เอเย่นต์ ${
                selectedAgent.username
              } สำเร็จ`
            );
            fetchAgents();
            closeAllModals();
          } catch (err) {
            toast.error(parseErrorMessage(err));
          } finally {
            setSubmitLoading(false);
          }
        }}
        title={
          selectedAgent?.status === 'active' ? 'ยืนยันการระงับเอเย่นต์' : 'ยืนยันการเปิดใช้งาน'
        }
        message={`คุณต้องการ${
          selectedAgent?.status === 'active' ? 'ระงับ' : 'เปิดใช้งาน'
        }เอเย่นต์ "${selectedAgent?.username}" หรือไม่?`}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        type={selectedAgent?.status === 'active' ? 'danger' : 'warning'}
        loading={submitLoading}
      />

      {/* Credit History Modal */}
      <Modal
        isOpen={creditHistoryModalOpen}
        onClose={closeAllModals}
        title={`ประวัติเครดิต - ${selectedAgent?.name || ''}`}
        size="large"
      >
        {/* Date Filter */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-text-secondary">เลือกวันที่:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
          />
        </div>

        {historyLoading ? (
          <div className="flex justify-center items-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-primary-gold"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>ไม่มีประวัติการเติม-ลดเครดิตในวันที่เลือก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-dark-gray border-b border-border-default">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">วันที่</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">ประเภท</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">จำนวน</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">ก่อนทำรายการ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">หลังทำรายการ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">ดำเนินการโดย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredHistory.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-bg-cream/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.action === 'add'
                            ? 'bg-accent-success/10 text-accent-success'
                            : 'bg-accent-error/10 text-accent-error'
                        }`}
                      >
                        {transaction.action === 'add' ? 'เพิ่มเครดิต' : 'ลดเครดิต'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-text-primary">
                      {transaction.action === 'add' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-text-muted">
                      {formatCurrency(transaction.balance_before)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary-gold">
                      {formatCurrency(transaction.balance_after)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {transaction.performed_by?.name || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={closeAllModals}
            className="px-6 py-2 bg-[#6c757d] text-white rounded-lg hover:bg-[#5a6268] transition-colors"
          >
            ปิด
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Create Agent Modal Component
const CreateAgentModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  submitLoading,
  setSubmitLoading,
  fetchAgents,
}) => {
  const [errors, setErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอก Username';
    } else if (!isValidUsername(formData.username)) {
      newErrors.username = 'Username ต้องเป็นตัวอักษรและตัวเลขเท่านั้น 3-20 ตัวอักษร';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.credit < 0) {
      newErrors.credit = 'เครดิตต้องไม่น้อยกว่า 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      await agentService.create(formData);
      toast.success(`สร้างเอเย่นต์ ${formData.username} สำเร็จ`);
      fetchAgents();
      onClose();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="สร้างเอเย่นต์ใหม่" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Username <span className="text-accent-error">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 ${
                errors.username ? 'ring-2 ring-accent-error border-accent-error' : 'focus:ring-primary-gold focus:border-transparent'
              }`}
              placeholder="ตัวอักษรและตัวเลข 3-20 ตัวอักษร"
            />
            {errors.username && <p className="text-accent-error text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              ชื่อ-นามสกุล <span className="text-accent-error">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'ring-2 ring-accent-error border-accent-error' : 'focus:ring-primary-gold focus:border-transparent'
              }`}
              placeholder="ชื่อและนามสกุล"
            />
            {errors.name && <p className="text-accent-error text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              รหัสผ่าน <span className="text-accent-error">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'ring-2 ring-accent-error border-accent-error' : 'focus:ring-primary-gold focus:border-transparent'
              }`}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
            {errors.password && <p className="text-accent-error text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Credit */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              เครดิตเริ่มต้น
            </label>
            <input
              type="number"
              value={formData.credit}
              onChange={(e) =>
                setFormData({ ...formData, credit: parseFloat(e.target.value) || 0 })
              }
              className={`w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 ${
                errors.credit ? 'ring-2 ring-accent-error border-accent-error' : 'focus:ring-primary-gold focus:border-transparent'
              }`}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.credit && <p className="text-accent-error text-sm mt-1">{errors.credit}</p>}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitLoading}
            className="px-6 py-2 bg-[#6c757d] text-white rounded-lg hover:bg-[#5a6268] transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-6 py-2 bg-accent-success hover:bg-accent-success/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {submitLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{submitLoading ? 'กำลังสร้าง...' : 'สร้างเอเย่นต์'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Agent Modal Component
const EditAgentModal = ({
  isOpen,
  onClose,
  selectedAgent,
  formData,
  setFormData,
  submitLoading,
  setSubmitLoading,
  fetchAgents,
}) => {
  const [errors, setErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      const updateData = {
        name: formData.name,
      };
      await agentService.update(selectedAgent._id, updateData);
      toast.success(`แก้ไขข้อมูลเอเย่นต์ ${selectedAgent.username} สำเร็จ`);
      fetchAgents();
      onClose();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!selectedAgent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="แก้ไขข้อมูลเอเย่นต์" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
            <input
              type="text"
              value={selectedAgent.username}
              disabled
              className="w-full px-4 py-2 bg-border-default/20 text-text-muted rounded-lg cursor-not-allowed"
            />
            <p className="text-xs text-text-muted mt-1">Username ไม่สามารถแก้ไขได้</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              ชื่อ-นามสกุล <span className="text-accent-error">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'ring-2 ring-accent-error border-accent-error' : 'focus:ring-primary-gold focus:border-transparent'
              }`}
              placeholder="ชื่อและนามสกุล"
            />
            {errors.name && <p className="text-accent-error text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitLoading}
            className="px-6 py-2 bg-[#6c757d] text-white rounded-lg hover:bg-[#5a6268] transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-6 py-2 bg-accent-info hover:bg-accent-info/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {submitLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{submitLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Adjust Credit Modal Component
const AdjustCreditModal = ({
  isOpen,
  onClose,
  selectedAgent,
  creditFormData,
  setCreditFormData,
  submitLoading,
  setSubmitLoading,
  fetchAgents,
}) => {
  const [errors, setErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!creditFormData.amount || creditFormData.amount <= 0) {
      newErrors.amount = 'กรุณากรอกจำนวนเครดิตที่ถูกต้อง (มากกว่า 0)';
    }

    if (
      creditFormData.action === 'deduct' &&
      creditFormData.amount > (selectedAgent?.credit || 0)
    ) {
      newErrors.amount = `จำนวนเครดิตต้องไม่เกิน ${formatCurrency(
        selectedAgent?.credit || 0
      )} (เครดิตของเอเย่นต์)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      await agentService.adjustCredit(
        selectedAgent._id,
        creditFormData.amount,
        creditFormData.action
      );
      toast.success(
        `${creditFormData.action === 'add' ? 'เพิ่ม' : 'ลด'}เครดิตเอเย่นต์ ${
          selectedAgent.username
        } สำเร็จ`
      );
      fetchAgents();
      onClose();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!selectedAgent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ปรับเครดิตเอเย่นต์" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Agent Info */}
          <div className="bg-bg-light-cream p-4 rounded-lg border border-border-default">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">เอเย่นต์:</span>
              <span className="font-semibold text-text-primary">{selectedAgent.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">เครดิตปัจจุบัน:</span>
              <span className="font-semibold text-primary-dark-gold">
                {formatCurrency(selectedAgent.credit)}
              </span>
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              ประเภทการทำรายการ
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setCreditFormData({ ...creditFormData, action: 'add' });
                  setErrors({});
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-colors border ${
                  creditFormData.action === 'add'
                    ? 'bg-accent-success text-white border-accent-success'
                    : 'bg-bg-light-cream text-text-secondary border-border-default hover:bg-bg-cream'
                }`}
              >
                เพิ่มเครดิต
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreditFormData({ ...creditFormData, action: 'deduct' });
                  setErrors({});
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-colors border ${
                  creditFormData.action === 'deduct'
                    ? 'bg-accent-error text-white border-accent-error'
                    : 'bg-bg-light-cream text-text-secondary border-border-default hover:bg-bg-cream'
                }`}
              >
                ลดเครดิต
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              จำนวนเครดิต <span className="text-accent-error">*</span>
            </label>
            <input
              type="number"
              value={creditFormData.amount}
              onChange={(e) =>
                setCreditFormData({ ...creditFormData, amount: parseFloat(e.target.value) || 0 })
              }
              className={`w-full px-4 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 ${
                errors.amount ? 'ring-2 ring-accent-error border-accent-error' : 'focus:ring-primary-gold focus:border-transparent'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.amount && <p className="text-accent-error text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Preview */}
          {creditFormData.amount > 0 && (
            <div className="bg-bg-light-cream border border-primary-gold/50 p-4 rounded-lg">
              <p className="text-sm text-text-secondary">
                {creditFormData.action === 'add' ? 'เครดิตหลังเพิ่ม:' : 'เครดิตหลังลด:'}{' '}
                <span className="font-semibold text-primary-dark-gold">
                  {formatCurrency(
                    creditFormData.action === 'add'
                      ? selectedAgent.credit + creditFormData.amount
                      : selectedAgent.credit - creditFormData.amount
                  )}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitLoading}
            className="px-6 py-2 bg-[#6c757d] text-white rounded-lg hover:bg-[#5a6268] transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${
              creditFormData.action === 'add'
                ? 'bg-accent-success hover:bg-accent-success/90'
                : 'bg-accent-error hover:bg-accent-error/90'
            }`}
          >
            {submitLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>
              {submitLoading
                ? 'กำลังดำเนินการ...'
                : creditFormData.action === 'add'
                ? 'เพิ่มเครดิต'
                : 'ลดเครดิต'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Manage Commission Modal Component
const ManageCommissionModal = ({
  isOpen,
  onClose,
  selectedAgent,
  lotteryTypes,
  submitLoading,
  setSubmitLoading,
  fetchAgents,
}) => {
  const [commissionRates, setCommissionRates] = useState([]);
  const [expandedTypes, setExpandedTypes] = useState({});

  // Initialize commission rates when agent changes
  useEffect(() => {
    if (selectedAgent && lotteryTypes.length > 0) {
      const rates = lotteryTypes.map((type) => {
        const existingRate = selectedAgent.commission_rates?.find(
          (rate) => rate.lottery_type_id === type._id
        );

        return {
          lottery_type_id: type._id,
          rates: existingRate?.rates || {
            three_top: 0,
            three_tod: 0,
            two_top: 0,
            two_bottom: 0,
            run_top: 0,
            run_bottom: 0,
          },
        };
      });
      setCommissionRates(rates);
    }
  }, [selectedAgent, lotteryTypes]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      const updateData = {
        commission_rates: commissionRates.map((rate) => ({
          lottery_type_id: rate.lottery_type_id,
          rates: {
            three_top: rate.rates.three_top || 0,
            three_tod: rate.rates.three_tod || 0,
            two_top: rate.rates.two_top || 0,
            two_bottom: rate.rates.two_bottom || 0,
            run_top: rate.rates.run_top || 0,
            run_bottom: rate.rates.run_bottom || 0,
          },
        })),
      };
      await agentService.update(selectedAgent._id, updateData);
      toast.success(`อัพเดทค่าคอมมิชชันเอเย่นต์ ${selectedAgent.username} สำเร็จ`);
      fetchAgents();
      onClose();
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!selectedAgent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`จัดการค่าคอมมิชชัน - ${selectedAgent.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Agent Info */}
          <div className="bg-bg-light-cream p-4 rounded-lg border border-border-default">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">เอเย่นต์:</span>
              <span className="font-semibold text-text-primary">{selectedAgent.username}</span>
            </div>
          </div>

          {/* Commission Rates */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              อัตราค่าคอมมิชชัน (%)
            </label>

            <div className="space-y-3">
              {lotteryTypes.map((lotteryType) => {
                const rateIndex = commissionRates.findIndex(
                  (r) => r.lottery_type_id === lotteryType._id
                );
                const isExpanded = expandedTypes[lotteryType._id];

                return (
                  <div key={lotteryType._id} className="border border-border-default rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTypes({
                          ...expandedTypes,
                          [lotteryType._id]: !isExpanded,
                        })
                      }
                      className="w-full px-4 py-3 bg-bg-light-cream hover:bg-bg-cream flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium text-text-primary">{lotteryType.label}</span>
                      <svg
                        className={`w-5 h-5 text-text-secondary transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isExpanded && rateIndex >= 0 && (
                      <div className="p-4 bg-bg-card border-t border-border-default">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs text-text-muted mb-1">3 ตัวบน</label>
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.three_top}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.three_top = parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">3 ตัวโต๊ด</label>
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.three_tod}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.three_tod = parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">2 ตัวบน</label>
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.two_top}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.two_top = parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">2 ตัวล่าง</label>
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.two_bottom}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.two_bottom = parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">วิ่งบน</label>
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.run_top}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.run_top = parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-text-muted mb-1">วิ่งล่าง</label>
                            <input
                              type="number"
                              value={commissionRates[rateIndex].rates.run_bottom}
                              onChange={(e) => {
                                const newRates = [...commissionRates];
                                newRates[rateIndex].rates.run_bottom = parseFloat(e.target.value) || 0;
                                setCommissionRates(newRates);
                              }}
                              className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitLoading}
            className="px-6 py-2 bg-[#6c757d] text-white rounded-lg hover:bg-[#5a6268] transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="px-6 py-2 bg-accent-success hover:bg-accent-success/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {submitLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{submitLoading ? 'กำลังบันทึก...' : 'บันทึกค่าคอมมิชชัน'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgentManagement;
