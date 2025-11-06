import { useEffect } from 'react';

/**
 * Reusable Modal Component
 * Modal popup สำหรับแสดงเนื้อหาต่างๆ
 */
const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showCloseButton = false, // เปลี่ยน default เป็น false
  closeOnBackdropClick = false, // เปลี่ยน default เป็น false
  closeOnEsc = false, // เพิ่ม prop ใหม่สำหรับควบคุม ESC key
  footer = null,
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEsc) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEsc]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} animate-slideUp border border-primary-gold/30`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border-default bg-bg-light-cream">
            <h3 className="text-xl font-semibold text-primary-dark-gold">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors p-1"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto bg-white">{children}</div>

        {/* Footer */}
        {footer && <div className="p-6 border-t border-border-default bg-bg-light-cream">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
