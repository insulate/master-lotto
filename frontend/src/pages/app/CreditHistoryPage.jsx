import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, TrendingDown, Loader2, RefreshCw, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import creditService from '../../services/creditService';
import { parseErrorMessage, formatDateTime } from '../../lib/utils';

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
          // Transaction Table
          <div className="bg-bg-card border border-border-default rounded-lg overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-default">
                <thead className="bg-bg-light-cream">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      วันที่-เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      ประเภท
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      จำนวนเงิน
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      ยอดก่อน
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      ยอดหลัง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      ผู้ทำรายการ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-default">
                  {transactions.map((transaction) => {
                    const ActionIcon = getActionIcon(transaction.action);

                    return (
                      <tr
                        key={transaction._id}
                        className="hover:bg-bg-cream transition-colors"
                      >
                        {/* Date Time */}
                        <td className="px-6 py-4 text-sm text-text-primary whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-text-secondary" />
                            <span>{formatDateTime(transaction.createdAt)}</span>
                          </div>
                        </td>

                        {/* Action Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getActionColor(transaction.action)}`}>
                              <ActionIcon className="w-4 h-4" />
                            </div>
                            <span className={`text-sm font-semibold ${transaction.action === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                              {getActionText(transaction.action)}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className={`text-sm font-bold ${transaction.action === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.action === 'add' ? '+' : '-'}
                            {transaction.amount.toLocaleString()} บาท
                          </span>
                        </td>

                        {/* Balance Before */}
                        <td className="px-6 py-4 text-right text-sm text-text-primary whitespace-nowrap">
                          {((transaction.credit_before || 0) + (transaction.balance_before || 0)).toLocaleString()} บาท
                        </td>

                        {/* Balance After */}
                        <td className="px-6 py-4 text-right text-sm text-text-primary whitespace-nowrap">
                          {((transaction.credit_after || 0) + (transaction.balance_after || 0)).toLocaleString()} บาท
                        </td>

                        {/* Performed By */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-primary">
                            {transaction.performed_by?.role === 'agent' ? (
                              // ถ้า agent ทำรายการ แสดง "เอเย่นต์"
                              'เอเย่นต์'
                            ) : transaction.performed_by?.role === 'master' ? (
                              // ถ้า master ทำรายการ แสดง "มาสเตอร์"
                              'มาสเตอร์'
                            ) : (
                              // ถ้า member ทำรายการเอง แสดง username
                              transaction.performed_by?.username || 'ไม่ระบุ'
                            )}
                          </span>
                        </td>

                        {/* Note */}
                        <td className="px-6 py-4 text-sm text-text-muted max-w-xs">
                          {transaction.note ? (
                            <span className="line-clamp-2">{transaction.note}</span>
                          ) : (
                            <span className="text-text-muted/50">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditHistoryPage;
