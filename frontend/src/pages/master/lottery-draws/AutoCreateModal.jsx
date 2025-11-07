import { useState } from 'react';
import Modal from '../../../components/common/Modal';

/**
 * Auto Create Lottery Draws Modal
 * Modal สำหรับสร้างงวดหวยอัตโนมัติหลายงวดพร้อมกัน
 */
const AutoCreateModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    lottery_types: ['government'], // Changed to single selection with default
    days_ahead: 30,
    frequency: 'daily',
    custom_days: [],
    monthly_dates: [],
    draw_time: '16:30',
    open_time_offset: -1440, // 24 hours before
    close_time_offset: -30,   // 30 minutes before
  });

  const lotteryTypes = [
    { value: 'government', label: 'หวยรัฐบาล' },
    { value: 'lao_pattana', label: 'หวยลาวพัฒนา' },
    { value: 'hanoi_regular', label: 'หวยฮานอยปกติ' },
    { value: 'hanoi_vip', label: 'หวยฮานอย VIP' },
  ];

  const weekDays = [
    { value: 0, label: 'อาทิตย์' },
    { value: 1, label: 'จันทร์' },
    { value: 2, label: 'อังคาร' },
    { value: 3, label: 'พุธ' },
    { value: 4, label: 'พฤหัสบดี' },
    { value: 5, label: 'ศุกร์' },
    { value: 6, label: 'เสาร์' },
  ];

  const handleCustomDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      custom_days: prev.custom_days.includes(day)
        ? prev.custom_days.filter(d => d !== day)
        : [...prev.custom_days, day]
    }));
  };

  const handleMonthlyDateToggle = (date) => {
    setFormData(prev => ({
      ...prev,
      monthly_dates: prev.monthly_dates.includes(date)
        ? prev.monthly_dates.filter(d => d !== date)
        : [...prev.monthly_dates, date]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      lottery_types: ['government'],
      days_ahead: 30,
      frequency: 'daily',
      custom_days: [],
      monthly_dates: [],
      draw_time: '16:30',
      open_time_offset: -1440,
      close_time_offset: -30,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="สร้างงวดหวยอัตโนมัติ"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lottery Type Selection (Single) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ประเภทหวย <span className="text-accent-error">*</span>
          </label>
          <select
            value={formData.lottery_types[0]}
            onChange={(e) => setFormData({ ...formData, lottery_types: [e.target.value] })}
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

        {/* Days Ahead */}
        <div>
          <label className="block text-sm font-medium mb-2">
            สร้างล่วงหน้า (วัน) <span className="text-accent-error">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={formData.days_ahead}
            onChange={(e) => setFormData({ ...formData, days_ahead: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
            required
          />
          <p className="text-xs text-text-muted mt-1">ระบุจำนวนวันที่ต้องการสร้างล่วงหน้า (1-365 วัน)</p>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ความถี่ <span className="text-accent-error">*</span>
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value, custom_days: [], monthly_dates: [] })}
            className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
            required
          >
            <option value="daily">ทุกวัน</option>
            <option value="weekly">ทุกสัปดาห์ (วันเดียวกันกับวันนี้)</option>
            <option value="custom">กำหนดเอง (เลือกวันในสัปดาห์)</option>
            <option value="monthly">รายเดือน (เลือกวันที่)</option>
          </select>
        </div>

        {/* Custom Days (only show when frequency is 'custom') */}
        {formData.frequency === 'custom' && (
          <div>
            <label className="block text-sm font-medium mb-3">
              เลือกวันในสัปดาห์ <span className="text-accent-error">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {weekDays.map((day) => (
                <label
                  key={day.value}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    formData.custom_days.includes(day.value)
                      ? 'bg-primary-gold/20 border-primary-gold'
                      : 'bg-neutral-charcoal border-neutral-gray hover:border-primary-gold/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.custom_days.includes(day.value)}
                    onChange={() => handleCustomDayToggle(day.value)}
                    className="w-3 h-3 text-primary-gold rounded focus:ring-primary-gold"
                  />
                  <span className="text-xs font-medium">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Dates (only show when frequency is 'monthly') */}
        {formData.frequency === 'monthly' && (
          <div>
            <label className="block text-sm font-medium mb-3">
              เลือกวันที่ในเดือน <span className="text-accent-error">*</span>
            </label>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                <label
                  key={date}
                  className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                    formData.monthly_dates.includes(date)
                      ? 'bg-primary-gold/20 border-primary-gold'
                      : 'bg-neutral-charcoal border-neutral-gray hover:border-primary-gold/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.monthly_dates.includes(date)}
                    onChange={() => handleMonthlyDateToggle(date)}
                    className="hidden"
                  />
                  <span className="text-xs font-medium">{date}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">เช่น เลือก 1 และ 16 สำหรับหวยรัฐบาล</p>
          </div>
        )}

        {/* Draw Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            เวลาออกผล <span className="text-accent-error">*</span>
          </label>
          <input
            type="time"
            value={formData.draw_time}
            onChange={(e) => setFormData({ ...formData, draw_time: e.target.value })}
            className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
            required
          />
        </div>

        {/* Time Offsets */}
        <div className="grid grid-cols-2 gap-4">
          {/* Open Time Offset */}
          <div>
            <label className="block text-sm font-medium mb-2">
              เปิดรับแทงก่อนออกผล (นาที)
            </label>
            <input
              type="number"
              min="1"
              max="525600"
              value={Math.abs(formData.open_time_offset)}
              onChange={(e) => setFormData({ ...formData, open_time_offset: -parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
            <p className="text-xs text-text-muted mt-1">ค่าเริ่มต้น: 1440 นาที (24 ชั่วโมง)</p>
          </div>

          {/* Close Time Offset */}
          <div>
            <label className="block text-sm font-medium mb-2">
              ปิดรับแทงก่อนออกผล (นาที)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={Math.abs(formData.close_time_offset)}
              onChange={(e) => setFormData({ ...formData, close_time_offset: -parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-neutral-charcoal border border-neutral-gray rounded-lg focus:outline-none focus:border-primary-gold"
              required
            />
            <p className="text-xs text-text-muted mt-1">ค่าเริ่มต้น: 30 นาที</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-accent-info/10 border border-accent-info/30 rounded-lg p-4">
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-accent-info">หมายเหตุ:</span> ระบบจะสร้างงวดหวยตามที่กำหนด
            และข้ามงวดที่มีอยู่แล้วในระบบ ผลลัพธ์จะแสดงจำนวนงวดที่สร้างสำเร็จและรายการที่มีข้อผิดพลาด (ถ้ามี)
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 bg-neutral-gray hover:bg-neutral-gray/90 rounded-lg transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading || (formData.frequency === 'custom' && formData.custom_days.length === 0) || (formData.frequency === 'monthly' && formData.monthly_dates.length === 0)}
            className="px-6 py-2 bg-primary-gold hover:bg-primary-light-gold text-neutral-charcoal font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังสร้าง...' : 'สร้างงวดหวย'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AutoCreateModal;
