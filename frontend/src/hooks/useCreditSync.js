import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { initSocket, onCreditUpdate, offCreditUpdate } from '../lib/socket';
import toast from 'react-hot-toast';

/**
 * Custom hook to sync credit updates via WebSocket
 * Automatically refreshes user data when credit is updated by agent/master
 */
export const useCreditSync = () => {
  const { user, getMe } = useAuthStore();

  useEffect(() => {
    // Only listen for members and agents (not masters - they have unlimited credit)
    if (!user || user.role === 'master') {
      return;
    }

    // Initialize WebSocket connection
    const socket = initSocket();

    // Handle credit update events
    const handleCreditUpdate = async (data) => {
      // Check if this event is for current user
      if (data.userId === user._id) {
        console.log('💰 Credit updated:', data);

        // Refresh user data to get latest credit
        try {
          await getMe();

          // Show toast notification only for members (not agents)
          // Agents already see toast from the action they performed
          if (user.role === 'member') {
            const actionText = data.action === 'add' ? 'เพิ่ม' : 'ลด';
            const amountText = data.amount.toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            toast.success(
              `${data.performedBy} ${actionText}เครดิตให้คุณ ${amountText} บาท\nเครดิตปัจจุบัน: ${data.newCredit.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} บาท`,
              {
                duration: 5000,
                icon: '💰',
              }
            );
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      }
    };

    // Listen for credit updates
    onCreditUpdate(handleCreditUpdate);

    // Cleanup on unmount
    return () => {
      offCreditUpdate(handleCreditUpdate);
    };
  }, [user, getMe]);
};

export default useCreditSync;
