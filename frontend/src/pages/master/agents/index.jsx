import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import agentService from './agentService';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusLabel,
  parseErrorMessage,
  isValidUsername,
  isValidPassword,
} from '../../../lib/utils';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Selected Agent
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    credit: 0,
    commission_rate: {
      two_digit_top: 0,
      three_digit_top: 0,
      three_digit_tote: 0,
    },
  });

  const [creditFormData, setCreditFormData] = useState({
    amount: 0,
    action: 'add',
  });

  // Loading States
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Fetch all agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await agentService.getAll();
      setAgents(response.data.agents || []);
    } catch (err) {
      setError(parseErrorMessage(err));
    } finally {
      setLoading(false);
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
            onClick={() => handleCreditClick(row)}
            className="px-3 py-1 bg-primary-mustard hover:bg-primary-dark-gold text-white text-xs rounded transition-colors"
          >
            ปรับเครดิต
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
      commission_rate: {
        two_digit_top: 0,
        three_digit_top: 0,
        three_digit_tote: 0,
      },
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
      commission_rate: agent.commission_rate || {
        two_digit_top: 0,
        three_digit_top: 0,
        three_digit_tote: 0,
      },
    });
    setEditModalOpen(true);
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

  // Close all modals
  const closeAllModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setCreditModalOpen(false);
    setStatusDialogOpen(false);
    setSelectedAgent(null);
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-light-gold">จัดการเอเย่นต์</h1>
          <p className="text-text-muted mt-1">
            ผู้ใช้: {user?.name}
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-6 py-3 bg-accent-success hover:bg-accent-success/90 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 shadow-md"
        >
          <span>+</span>
          <span>สร้างเอเย่นต์ใหม่</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-accent-success/20 border border-accent-success rounded-lg text-accent-success">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-accent-error/20 border border-accent-error rounded-lg text-accent-error">
          {error}
        </div>
      )}

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
        showSuccess={showSuccess}
        showError={showError}
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
        showSuccess={showSuccess}
        showError={showError}
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
        showSuccess={showSuccess}
        showError={showError}
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
            showSuccess(
              `${newStatus === 'active' ? 'เปิดใช้งาน' : 'ระงับ'}เอเย่นต์ ${
                selectedAgent.username
              } สำเร็จ`
            );
            fetchAgents();
            closeAllModals();
          } catch (err) {
            showError(parseErrorMessage(err));
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
  showSuccess,
  showError,
  masterCredit,
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
      showSuccess(`สร้างเอเย่นต์ ${formData.username} สำเร็จ`);
      fetchAgents();
      onClose();
    } catch (err) {
      showError(parseErrorMessage(err));
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

          {/* Commission Rate */}
          <div className="border-t border-border-default pt-4">
            <label className="block text-sm font-medium text-text-secondary mb-3">
              อัตราค่าคอมมิชชัน (%)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">2 ตัวบน</label>
                <input
                  type="number"
                  value={formData.commission_rate.two_digit_top}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: {
                        ...formData.commission_rate,
                        two_digit_top: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">3 ตัวบน</label>
                <input
                  type="number"
                  value={formData.commission_rate.three_digit_top}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: {
                        ...formData.commission_rate,
                        three_digit_top: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
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
                  value={formData.commission_rate.three_digit_tote}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: {
                        ...formData.commission_rate,
                        three_digit_tote: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
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
  showSuccess,
  showError,
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
        commission_rate: formData.commission_rate,
      };
      await agentService.update(selectedAgent._id, updateData);
      showSuccess(`แก้ไขข้อมูลเอเย่นต์ ${selectedAgent.username} สำเร็จ`);
      fetchAgents();
      onClose();
    } catch (err) {
      showError(parseErrorMessage(err));
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

          {/* Commission Rate */}
          <div className="border-t border-border-default pt-4">
            <label className="block text-sm font-medium text-text-secondary mb-3">
              อัตราค่าคอมมิชชัน (%)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">2 ตัวบน</label>
                <input
                  type="number"
                  value={formData.commission_rate.two_digit_top}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: {
                        ...formData.commission_rate,
                        two_digit_top: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">3 ตัวบน</label>
                <input
                  type="number"
                  value={formData.commission_rate.three_digit_top}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: {
                        ...formData.commission_rate,
                        three_digit_top: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
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
                  value={formData.commission_rate.three_digit_tote}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: {
                        ...formData.commission_rate,
                        three_digit_tote: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-bg-light-cream text-text-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
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
  showSuccess,
  showError,
  masterCredit,
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
      showSuccess(
        `${creditFormData.action === 'add' ? 'เพิ่ม' : 'หัก'}เครดิตเอเย่นต์ ${
          selectedAgent.username
        } สำเร็จ`
      );
      fetchAgents();
      onClose();
    } catch (err) {
      showError(parseErrorMessage(err));
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
                หักเครดิต
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
                {creditFormData.action === 'add' ? 'เครดิตหลังเพิ่ม:' : 'เครดิตหลังหัก:'}{' '}
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
                : 'หักเครดิต'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgentManagement;
