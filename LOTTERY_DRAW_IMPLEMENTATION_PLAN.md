# แผนการพัฒนาระบบจัดการหวย (Lottery Draw Management System)

## 📋 ภาพรวม

ระบบจัดการงวดหวยสำหรับ Master ในการสร้าง แก้ไข และจัดการงวดหวย 4 ประเภท:
1. หวยรัฐบาล (Government Lottery)
2. หวยลาวพัฒนา (Lao Pattana)
3. หวยฮานอยปกติ (Hanoi Regular)
4. หวยฮานอยVIP (Hanoi VIP)

---

## 🎯 Phase 1: Backend - Database Model

### 1.1 สร้าง LotteryDraw Model
**ไฟล์:** `backend/models/lotteryDraw.model.js`

#### Schema Fields:

```javascript
{
  // ข้อมูลพื้นฐาน
  lottery_type: {
    type: String,
    enum: ['government', 'lao_pattana', 'hanoi_regular', 'hanoi_vip'],
    required: true
  },

  // วันเวลา
  draw_date: Date,           // วันที่ออกผล
  open_time: Date,           // เปิดรับแทง
  close_time: Date,          // ปิดรับแทง

  // สถานะ
  status: {
    type: String,
    enum: ['open', 'closed', 'completed', 'cancelled'],
    default: 'open'
  },

  // การตั้งค่าการแทง (Bet Settings)
  bet_settings: {
    three_top: {
      payout_rate: Number,   // อัตราจ่าย เช่น 900
      min_bet: Number,       // แทงขั้นต่ำ เช่น 1
      max_bet: Number,       // แทงสูงสุด เช่น 10000
      enabled: Boolean       // เปิด/ปิดรับแทง
    },
    three_tod: { ... },
    two_top: { ... },
    two_bottom: { ... },
    run_top: { ... },
    run_bottom: { ... }
  },

  // ผลรางวัล
  result: {
    three_top: String,       // เลข 3 ตัวบน
    two_top: String,         // เลข 2 ตัวบน
    two_bottom: String,      // เลข 2 ตัวล่าง
    run_top: [String],       // เลขวิ่งบน (array)
    run_bottom: [String]     // เลขวิ่งล่าง (array)
  },

  // ข้อมูลอ้างอิง
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes:
- `lottery_type` (for filtering)
- `status` (for filtering)
- `draw_date` (for sorting and filtering)
- `createdAt` (for sorting)

---

## 🎯 Phase 2: Backend - Controllers

### 2.1 สร้าง Lottery Draw Controller
**ไฟล์:** `backend/controllers/master/lotteryDraw.controller.master.js`

#### Functions:

1. **getLotteryDraws** - `GET /api/v1/master/lottery-draws`
   - Query params: `lottery_type`, `status`, `start_date`, `end_date`, `page`, `limit`
   - Return: Array of lottery draws + pagination

2. **getLotteryDrawById** - `GET /api/v1/master/lottery-draws/:id`
   - Return: Single lottery draw

3. **createLotteryDraw** - `POST /api/v1/master/lottery-draws`
   - Body: `{ lottery_type, draw_date, open_time, close_time, bet_settings }`
   - Validation:
     - ตรวจสอบ open_time < close_time < draw_date
     - ตรวจสอบ bet_settings ทุกค่าต้อง >= 0
     - ตรวจสอบ min_bet <= max_bet

4. **updateLotteryDraw** - `PUT /api/v1/master/lottery-draws/:id`
   - อัพเดทได้เฉพาะ status = 'open'
   - Body: `{ draw_date, open_time, close_time, bet_settings }`

5. **updateDrawStatus** - `PATCH /api/v1/master/lottery-draws/:id/status`
   - Body: `{ status }`
   - Status transitions:
     - open → closed (ปิดรับแทง)
     - closed → completed (ประกาศผล)
     - any → cancelled (ยกเลิก)

6. **updateDrawResult** - `PATCH /api/v1/master/lottery-draws/:id/result`
   - อัพเดทได้เฉพาะ status = 'closed'
   - Body: `{ result: { three_top, two_top, two_bottom, run_top, run_bottom } }`
   - Auto set status to 'completed'

7. **deleteLotteryDraw** - `DELETE /api/v1/master/lottery-draws/:id`
   - ลบได้เฉพาะที่ยังไม่มีการแทง (check ใน Bet model ในอนาคต)

---

## 🎯 Phase 3: Backend - Routes

### 3.1 สร้าง Routes
**ไฟล์:** `backend/routes/master/lotteryDraw.routes.master.js`

```javascript
router.get('/', getLotteryDraws);
router.get('/:id', getLotteryDrawById);
router.post('/', createLotteryDraw);
router.put('/:id', updateLotteryDraw);
router.patch('/:id/status', updateDrawStatus);
router.patch('/:id/result', updateDrawResult);
router.delete('/:id', deleteLotteryDraw);
```

### 3.2 Register ใน app.js
```javascript
import lotteryDrawRoutes from './routes/master/lotteryDraw.routes.master.js';
app.use('/api/v1/master/lottery-draws', lotteryDrawRoutes);
```

---

## 🎯 Phase 4: Frontend - Service Layer

### 4.1 สร้าง Lottery Draw Service
**ไฟล์:** `frontend/src/pages/master/lottery-draws/lotteryDrawService.js`

#### Functions:
- `getAll(filters)` - ดึงรายการทั้งหมด
- `getById(id)` - ดึงข้อมูลตาม ID
- `create(data)` - สร้างงวดใหม่
- `update(id, data)` - แก้ไขข้อมูล
- `updateStatus(id, status)` - เปลี่ยนสถานะ
- `updateResult(id, result)` - ใส่ผลรางวัล
- `delete(id)` - ลบงวด

---

## 🎯 Phase 5: Frontend - UI Components

### 5.1 หน้าหลัก - Lottery Draws Management
**ไฟล์:** `frontend/src/pages/master/lottery-draws/index.jsx`

#### Components:

**5.1.1 Header Section**
- ปุ่ม "สร้างงวดหวย" (เปิด CreateModal)
- Filter dropdown: ประเภทหวย, สถานะ
- Date range picker

**5.1.2 Data Table**
- Columns:
  - ประเภทหวย (badge with color)
  - งวดวันที่ (draw_date)
  - เปิดรับแทง (open_time)
  - ปิดรับแทง (close_time)
  - สถานะ (badge with color)
  - จัดการ (action buttons)

- Actions:
  - ดูรายละเอียด (eye icon)
  - แก้ไข (edit icon) - แสดงเมื่อ status = 'open'
  - ใส่ผล (trophy icon) - แสดงเมื่อ status = 'closed'
  - ลบ (trash icon) - แสดงเมื่อ status = 'open'

**5.1.3 Create/Edit Modal**
- Form Fields:
  - เลือกประเภทหวย (dropdown)
  - วันที่ออกผล (date picker)
  - เวลาเปิดรับแทง (datetime picker)
  - เวลาปิดรับแทง (datetime picker)

- Bet Settings Section (ทุกประเภทการแทง):
  ```
  ✓ 3 ตัวบน
    อัตราจ่าย: [___] เท่า
    ขั้นต่ำ: [___] บาท
    สูงสุด: [___] บาท

  ✓ 3 ตัวโต๊ด
    ...
  ```

**5.1.4 Result Modal (ใส่ผลรางวัล)**
- Form Fields ตามประเภทหวย:
  - 3 ตัวบน: [___] (3 digits)
  - 2 ตัวบน: [___] (2 digits)
  - 2 ตัวล่าง: [___] (2 digits)
  - วิ่งบน: [___] ... (multiple inputs)
  - วิ่งล่าง: [___] ... (multiple inputs)

**5.1.5 View Details Modal**
- แสดงข้อมูลทั้งหมดของงวด
- แสดง Bet Settings แบบ read-only
- แสดงผลรางวัล (ถ้ามี)

**5.1.6 Confirm Delete Dialog**

---

## 🎯 Phase 6: Frontend - Routing & Menu

### 6.1 เพิ่ม Route
**ไฟล์:** `frontend/src/App.jsx`

```javascript
<Route
  path="/master/lottery-draws"
  element={<LotteryDrawsManagement />}
/>
```

### 6.2 เพิ่มเมนู
**ไฟล์:** `frontend/src/components/layout/Sidebar.jsx`

เพิ่มภายใต้ Master Menu:
```javascript
{
  name: 'จัดการหวย',
  path: '/master/lottery-draws',
  icon: <Ticket />,
  role: 'master'
}
```

---

## 🎯 Phase 7: Default Configurations

### 7.1 สร้าง Constants File
**ไฟล์:** `frontend/src/pages/master/lottery-draws/constants.js`

```javascript
export const DEFAULT_BET_SETTINGS = {
  government: {
    three_top: { payout_rate: 900, min_bet: 1, max_bet: 10000, enabled: true },
    three_tod: { payout_rate: 150, min_bet: 1, max_bet: 10000, enabled: true },
    two_top: { payout_rate: 95, min_bet: 1, max_bet: 50000, enabled: true },
    two_bottom: { payout_rate: 95, min_bet: 1, max_bet: 50000, enabled: true },
    run_top: { payout_rate: 3.5, min_bet: 5, max_bet: 100000, enabled: true },
    run_bottom: { payout_rate: 4.5, min_bet: 5, max_bet: 100000, enabled: true }
  },
  // ... same for other lottery types
};

export const LOTTERY_TYPE_LABELS = {
  government: 'หวยรัฐบาล',
  lao_pattana: 'หวยลาวพัฒนา',
  hanoi_regular: 'หวยฮานอยปกติ',
  hanoi_vip: 'หวยฮานอยVIP'
};

export const STATUS_LABELS = {
  open: 'เปิดรับแทง',
  closed: 'ปิดรับแทง',
  completed: 'ประกาศผลแล้ว',
  cancelled: 'ยกเลิก'
};
```

---

## 🎯 Phase 8: Testing Checklist

### 8.1 Backend Testing
- [ ] สร้างงวดหวยสำเร็จ
- [ ] แก้ไขงวดหวยสำเร็จ
- [ ] เปลี่ยนสถานะสำเร็จ
- [ ] ใส่ผลรางวัลสำเร็จ
- [ ] ลบงวดหวยสำเร็จ
- [ ] Validation ทำงานถูกต้อง
- [ ] Authorization (Master only) ทำงานถูกต้อง

### 8.2 Frontend Testing
- [ ] แสดงรายการงวดหวยถูกต้อง
- [ ] Filter และ Search ทำงานถูกต้อง
- [ ] สร้างงวดใหม่สำเร็จ
- [ ] แก้ไขงวดสำเร็จ
- [ ] ใส่ผลรางวัลสำเร็จ
- [ ] ลบงวดสำเร็จ
- [ ] Responsive design ทำงานดี
- [ ] Error handling แสดงข้อความถูกต้อง

---

## 📝 หมายเหตุสำคัญ

1. **Scope ของ Phase นี้**: สร้างระบบจัดการงวดหวยสำหรับ Master เท่านั้น ยังไม่รวม:
   - ระบบแทงหวยสำหรับ Agent/Member
   - ระบบคำนวณรางวัล
   - ระบบรายงาน

2. **Security**: ทุก API ต้องผ่าน `authenticate` และ `authorize('master')` middleware

3. **Validation**: ตรวจสอบข้อมูลทั้ง Frontend และ Backend

4. **UX**: ใช้ Modal แทนการไปหน้าใหม่ เพื่อ UX ที่ดีกว่า

5. **สี Badge สำหรับสถานะ**:
   - `open`: green
   - `closed`: yellow
   - `completed`: blue
   - `cancelled`: red

---

## 🚀 ขั้นตอนการพัฒนา (Step by Step)

1. ✅ สร้างไฟล์แผนนี้
2. ⏳ สร้าง Model
3. ⏳ สร้าง Controller
4. ⏳ สร้าง Routes และ register
5. ⏳ สร้าง Frontend Service
6. ⏳ สร้าง UI Components
7. ⏳ เพิ่ม Routing และ Menu
8. ⏳ Testing ทุกฟีเจอร์

---

**Last Updated:** 2025-01-05
**Status:** 🚧 In Progress
