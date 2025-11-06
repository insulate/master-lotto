import mongoose from 'mongoose';

/**
 * Lottery Type Schema
 * บันทึกข้อมูลประเภทหวย
 */
const lotteryTypeSchema = new mongoose.Schema(
  {
    // ชื่อประเภทหวย (ใช้เป็น key ในระบบ)
    value: {
      type: String,
      enum: ['government', 'lao_pattana', 'hanoi_regular', 'hanoi_vip'],
      required: true,
      unique: true,
      index: true,
    },

    // ชื่อแสดงผล
    label: {
      type: String,
      required: true,
    },

    // คำอธิบาย
    description: {
      type: String,
      required: true,
    },

    // ไอคอน emoji
    icon: {
      type: String,
      required: true,
    },

    // สถานะ (เปิดใช้งาน/ปิดใช้งาน)
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const LotteryType = mongoose.model('LotteryType', lotteryTypeSchema);

export default LotteryType;
