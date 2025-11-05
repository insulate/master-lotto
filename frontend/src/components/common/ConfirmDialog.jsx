/**
 * Reusable ConfirmDialog Component
 * Dialog สำหรับยืนยันการทำงาน (Confirmation)
 */
const ConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'ยืนยันการทำงาน',
  message = 'คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'warning', // 'warning', 'danger', 'info'
  loading = false,
}) => {
  if (!isOpen) return null;

  // Type colors
  const typeConfig = {
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
      borderColor: 'border-yellow-500',
    },
    danger: {
      icon: '🗑️',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      borderColor: 'border-red-500',
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      borderColor: 'border-blue-500',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-slideUp">
        {/* Header with Icon */}
        <div className={`flex items-center space-x-3 p-6 border-b-2 ${config.borderColor}`}>
          <span className="text-3xl">{config.icon}</span>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${config.confirmBg}`}
          >
            {loading && (
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
            <span>{loading ? 'กำลังดำเนินการ...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
