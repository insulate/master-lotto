import mongoose from 'mongoose';

/**
 * Bet Item Schema (Embedded)
 * รายการเลขแต่ละตัวในบิลการแทง
 */
const betItemSchema = new mongoose.Schema(
  {
    // ประเภทการแทง
    bet_type: {
      type: String,
      enum: ['three_top', 'three_tod', 'two_top', 'two_bottom', 'run_top', 'run_bottom'],
      required: true,
    },

    // เลขที่แทง
    number: {
      type: String,
      required: true,
      trim: true,
    },

    // จำนวนเงินที่แทง
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // อัตราจ่าย (เก็บไว้ ณ เวลาที่แทง)
    payout_rate: {
      type: Number,
      required: true,
      min: 0,
    },

    // เงินที่อาจได้รับ (amount * payout_rate)
    potential_win: {
      type: Number,
      required: true,
      min: 0,
    },

    // ผลการแทง (เติมหลังประกาศผล)
    is_win: {
      type: Boolean,
      default: null,
    },

    // เงินที่ได้จริง (เติมหลังประกาศผล)
    win_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true, // เปิดใช้ _id สำหรับ subdocument
  }
);

/**
 * Bet Schema
 * บันทึกข้อมูลการแทงหวยของ Member
 */
const betSchema = new mongoose.Schema(
  {
    // ผู้แทง (Member)
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Agent ที่ดูแล Member คนนี้
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // งวดหวยที่แทง
    lottery_draw_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LotteryDraw',
      required: true,
      index: true,
    },

    // รายการเลขทั้งหมดในบิล
    bet_items: {
      type: [betItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'ต้องมีรายการเลขอย่างน้อย 1 รายการ',
      },
    },

    // ยอดรวมเงินที่แทงทั้งหมด
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ยอดรวมเงินที่อาจได้รับทั้งหมด
    total_potential_win: {
      type: Number,
      required: true,
      min: 0,
    },

    // สถานะบิล
    status: {
      type: String,
      enum: ['pending', 'won', 'lost', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // เงินที่ได้รับจริง (หลังประกาศผล)
    actual_win_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // หมายเหตุจากผู้ใช้
    note: {
      type: String,
      maxlength: 100,
      trim: true,
      default: null,
    },

    // ข้อมูลค่าคอมมิชชั่น
    commission_data: {
      // ค่าคอม Agent
      agent: {
        // อัตราค่าคอมแต่ละประเภท ณ เวลาที่แทง
        rates: {
          three_top: { type: Number, default: 0, min: 0, max: 100 },
          three_tod: { type: Number, default: 0, min: 0, max: 100 },
          two_top: { type: Number, default: 0, min: 0, max: 100 },
          two_bottom: { type: Number, default: 0, min: 0, max: 100 },
          run_top: { type: Number, default: 0, min: 0, max: 100 },
          run_bottom: { type: Number, default: 0, min: 0, max: 100 },
        },
        // ยอดค่าคอมที่คำนวณได้
        total_commission: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
      // ค่าคอม Member
      member: {
        // อัตราค่าคอมแต่ละประเภท ณ เวลาที่แทง
        rates: {
          three_top: { type: Number, default: 0, min: 0, max: 100 },
          three_tod: { type: Number, default: 0, min: 0, max: 100 },
          two_top: { type: Number, default: 0, min: 0, max: 100 },
          two_bottom: { type: Number, default: 0, min: 0, max: 100 },
          run_top: { type: Number, default: 0, min: 0, max: 100 },
          run_bottom: { type: Number, default: 0, min: 0, max: 100 },
        },
        // ยอดค่าคอมที่คำนวณได้
        total_commission: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    },

    // วันที่คำนวณผล
    settled_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound indexes for better query performance
betSchema.index({ member_id: 1, createdAt: -1 });
betSchema.index({ agent_id: 1, createdAt: -1 });
betSchema.index({ lottery_draw_id: 1, status: 1 });
betSchema.index({ status: 1, createdAt: -1 });
betSchema.index({ member_id: 1, lottery_draw_id: 1 });

// Validation: bet_items ไม่ว่างเปล่า
betSchema.pre('save', function (next) {
  if (!this.bet_items || this.bet_items.length === 0) {
    return next(new Error('ต้องมีรายการเลขอย่างน้อย 1 รายการ'));
  }
  next();
});

// Static method: ค้นหาบิลของ member
betSchema.statics.findByMember = function (memberId, options = {}) {
  const query = { member_id: memberId };

  if (options.lottery_draw_id) {
    query.lottery_draw_id = options.lottery_draw_id;
  }

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query).sort({ createdAt: -1 });
};

// Static method: ค้นหาบิลภายใต้ agent
betSchema.statics.findByAgent = function (agentId, options = {}) {
  const query = { agent_id: agentId };

  if (options.member_id) {
    query.member_id = options.member_id;
  }

  if (options.lottery_draw_id) {
    query.lottery_draw_id = options.lottery_draw_id;
  }

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query).sort({ createdAt: -1 });
};

// Static method: ค้นหาบิลที่ยังไม่ได้คำนวณผลในงวดนั้นๆ
betSchema.statics.findPendingByDraw = function (lotteryDrawId) {
  return this.find({
    lottery_draw_id: lotteryDrawId,
    status: 'pending',
  });
};

// Instance method: คำนวณค่าคอมมิชชั่นรวม
betSchema.methods.calculateTotalCommission = function () {
  const agentCommission = this.commission_data?.agent?.total_commission || 0;
  const memberCommission = this.commission_data?.member?.total_commission || 0;
  return agentCommission + memberCommission;
};

const Bet = mongoose.model('Bet', betSchema);

export default Bet;
