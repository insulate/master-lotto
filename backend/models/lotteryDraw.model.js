import mongoose from 'mongoose';

/**
 * Lottery Draw Schema
 * บันทึกข้อมูลงวดหวยแต่ละงวด
 */
const lotteryDrawSchema = new mongoose.Schema(
  {
    // ประเภทหวย
    lottery_type: {
      type: String,
      enum: ['government', 'lao_pattana', 'hanoi_regular', 'hanoi_vip'],
      required: true,
      index: true,
    },

    // วันที่ออกผล
    draw_date: {
      type: Date,
      required: true,
      index: true,
    },

    // เวลาเปิดรับแทง
    open_time: {
      type: Date,
      required: true,
    },

    // เวลาปิดรับแทง
    close_time: {
      type: Date,
      required: true,
    },

    // สถานะงวดหวย
    status: {
      type: String,
      enum: ['open', 'closed', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },

    // การตั้งค่าการแทง (Bet Settings)
    bet_settings: {
      // 3 ตัวบน
      three_top: {
        payout_rate: {
          type: Number,
          default: 900,
          min: 0,
        },
        min_bet: {
          type: Number,
          default: 1,
          min: 0,
        },
        max_bet: {
          type: Number,
          default: 10000,
          min: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // 3 ตัวโต๊ด
      three_tod: {
        payout_rate: {
          type: Number,
          default: 150,
          min: 0,
        },
        min_bet: {
          type: Number,
          default: 1,
          min: 0,
        },
        max_bet: {
          type: Number,
          default: 10000,
          min: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // 2 ตัวบน
      two_top: {
        payout_rate: {
          type: Number,
          default: 95,
          min: 0,
        },
        min_bet: {
          type: Number,
          default: 1,
          min: 0,
        },
        max_bet: {
          type: Number,
          default: 50000,
          min: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // 2 ตัวล่าง
      two_bottom: {
        payout_rate: {
          type: Number,
          default: 95,
          min: 0,
        },
        min_bet: {
          type: Number,
          default: 1,
          min: 0,
        },
        max_bet: {
          type: Number,
          default: 50000,
          min: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // วิ่งบน
      run_top: {
        payout_rate: {
          type: Number,
          default: 3.5,
          min: 0,
        },
        min_bet: {
          type: Number,
          default: 5,
          min: 0,
        },
        max_bet: {
          type: Number,
          default: 100000,
          min: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },

      // วิ่งล่าง
      run_bottom: {
        payout_rate: {
          type: Number,
          default: 4.5,
          min: 0,
        },
        min_bet: {
          type: Number,
          default: 5,
          min: 0,
        },
        max_bet: {
          type: Number,
          default: 100000,
          min: 0,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    },

    // ผลรางวัล (เก็บเมื่อประกาศผลแล้ว)
    result: {
      three_top: {
        type: String,
        default: null,
      },
      two_top: {
        type: String,
        default: null,
      },
      two_bottom: {
        type: String,
        default: null,
      },
      run_top: {
        type: [String],
        default: [],
      },
      run_bottom: {
        type: [String],
        default: [],
      },
    },

    // ผู้สร้าง (Master)
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound indexes for better query performance
lotteryDrawSchema.index({ lottery_type: 1, status: 1 });
lotteryDrawSchema.index({ lottery_type: 1, draw_date: -1 });
lotteryDrawSchema.index({ status: 1, draw_date: -1 });
lotteryDrawSchema.index({ created_by: 1, createdAt: -1 });

// Validation: open_time must be before close_time
lotteryDrawSchema.pre('save', function (next) {
  if (this.open_time >= this.close_time) {
    next(new Error('เวลาเปิดรับแทงต้องอยู่ก่อนเวลาปิดรับแทง'));
  }

  if (this.close_time >= this.draw_date) {
    next(new Error('เวลาปิดรับแทงต้องอยู่ก่อนวันที่ออกผล'));
  }

  next();
});

// Validation: min_bet must be less than or equal to max_bet
lotteryDrawSchema.pre('save', function (next) {
  const betTypes = ['three_top', 'three_tod', 'two_top', 'two_bottom', 'run_top', 'run_bottom'];

  for (const betType of betTypes) {
    const settings = this.bet_settings[betType];
    if (settings && settings.min_bet > settings.max_bet) {
      next(new Error(`${betType}: ขั้นต่ำต้องไม่เกินขั้นสูงสุด`));
    }
  }

  next();
});

const LotteryDraw = mongoose.model('LotteryDraw', lotteryDrawSchema);

export default LotteryDraw;
