import mongoose from 'mongoose';

/**
 * Credit Transaction Schema
 * บันทึกประวัติการเติม-ถอนเครดิตระหว่าง master และ agent
 */
const creditTransactionSchema = new mongoose.Schema(
  {
    // ผู้ทำรายการ (master)
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ผู้รับรายการ (agent หรือ member)
    downline_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ประเภทรายการ: add (เพิ่ม) หรือ deduct (ห็ัก)
    action: {
      type: String,
      enum: ['add', 'deduct'],
      required: true,
    },

    // จำนวนเครดิต
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // เครดิตก่อนทำรายการ
    balance_before: {
      type: Number,
      required: true,
    },

    // เครดิตหลังทำรายการ
    balance_after: {
      type: Number,
      required: true,
    },

    // หมายเหตุ (optional)
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for better query performance
creditTransactionSchema.index({ downline_id: 1, createdAt: -1 });
creditTransactionSchema.index({ performed_by: 1, createdAt: -1 });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);

export default CreditTransaction;
