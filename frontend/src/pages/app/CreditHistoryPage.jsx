import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, TrendingDown, Loader2, RefreshCw, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import creditService from '../../services/creditService';
import { parseErrorMessage, formatDateTime } from '../../lib/utils';
import DataTable from '../../components/common/DataTable';

/**
 * Credit History Page - หน้าประวัติการเติม-ถอนเครดิต
 */
const CreditHistoryPage = () => {
  // State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch credit history
  useEffect(() => {
    fetchCreditHistory();
  }, []);

  const fetchCreditHistory = async () => {
    try {
      setLoading(true);
      const response = await creditService.getCreditHistory();
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
    } catch (err) {
      toast.error(parseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Format action text
  const getActionText = (action) => {
    return action === 'add' ? 'เติมเครดิต' : 'ถอนเครดิต';
  };

  // Get action color
  const getActionColor = (action) => {
    return action === 'add'
      ? 'text-green-500 bg-green-500/10 border-green-500/30'
      : 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  // Get action icon
  const getActionIcon = (action) => {
    return action === 'add' ? TrendingUp : TrendingDown;
  };

  // Define columns for DataTable
  const columns = [
    {
      key: 'createdAt',
      label: 'วันที่-เวลา',
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-text-secondary" />
          <span>{formatDateTime(value)}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'ประเภท',
      render: (value, row) => {
        const ActionIcon = getActionIcon(value);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getActionColor(value)}`}>
              <ActionIcon className="w-4 h-4" />
            </div>
            <span className={`text-sm font-semibold ${value === 'add' ? 'text-green-500' : 'text-red-500'}`}>
              {getActionText(value)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'จำนวนเงิน',
      render: (value, row) => (
        <div className="text-right">
          <span className={`text-sm font-bold ${row.action === 'add' ? 'text-green-500' : 'text-red-500'}`}>
            {row.action === 'add' ? '+' : '-'}
            {value.toLocaleString()} บาท
          </span>
        </div>
      ),
    },
    {
      key: 'credit_before',
      label: 'ยอดก่อน',
      render: (value, row) => (
        <div className="text-right">
          {((row.credit_before || 0) + (row.balance_before || 0)).toLocaleString()} บาท
        </div>
      ),
    },
    {
      key: 'credit_after',
      label: 'ยอดหลัง',
      render: (value, row) => (
        <div className="text-right">
          {((row.credit_after || 0) + (row.balance_after || 0)).toLocaleString()} บาท
        </div>
      ),
    },
    {
      key: 'performed_by',
      label: 'ผู้ทำรายการ',
      render: (value) => (
        <span className="text-sm text-text-primary">
          {value?.role === 'agent' ? (
            'เอเย่นต์'
          ) : value?.role === 'master' ? (
            'มาสเตอร์'
          ) : (
            value?.username || 'ไม่ระบุ'
          )}
        </span>
      ),
    },
    {
      key: 'note',
      label: 'หมายเหตุ',
      render: (value) => (
        <div className="max-w-xs">
          {value ? (
            <span className="line-clamp-2">{value}</span>
          ) : (
            <span className="text-text-muted/50">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-cream py-6 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-gold to-primary-dark-gold rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">ประวัติเครดิต</h1>
              <p className="text-sm text-text-secondary">รายการเติม-ถอนเครดิตทั้งหมด</p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchCreditHistory}
            disabled={loading}
            className="px-4 py-2 bg-primary-gold hover:bg-primary-dark-gold text-text-primary rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-primary-gold/20 to-primary-dark-gold/20 border border-primary-gold/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">รายการทั้งหมด</p>
              <p className="text-2xl font-bold text-text-primary">{total.toLocaleString()}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary-gold" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary-gold animate-spin mb-4" />
            <p className="text-text-secondary">กำลังโหลดข้อมูล...</p>
          </div>
        ) : transactions.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-gold/20 to-primary-dark-gold/20 rounded-full flex items-center justify-center">
              <Coins className="w-10 h-10 text-primary-gold" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              ยังไม่มีรายการเครดิต
            </h3>
            <p className="text-text-secondary">
              เมื่อมีการเติม-ถอนเครดิต ประวัติจะแสดงที่นี่
            </p>
          </div>
        ) : (
          // Transaction Table using DataTable component
          <div className="bg-bg-card border border-border-default rounded-lg overflow-hidden shadow-md">
            <DataTable
              columns={columns}
              data={transactions}
              emptyMessage="ไม่พบรายการเครดิต"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditHistoryPage;
