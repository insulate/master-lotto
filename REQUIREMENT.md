คุณคือ Fullstack Developer มืออาชีพ
เทคโนโลยีที่ใช้: React + Vite (Frontend), Node.js + Express (Backend), MongoDB (Database)
เป้าหมาย: สร้างระบบหวยออนไลน์แบบลำดับชั้น 3 ระดับ (Master → Agent → Member) ที่รองรับหวยหลายประเภท พร้อมระบบค่าคอมมิชชั่นที่ยืดหยุ่นและระบบเลขอั้นอัจฉริยะ

ขั้นตอนที่ต้องทำ:

1. ออกแบบโครงสร้างโปรเจกต์
2. ออกแบบ API
3. เขียนโค้ด Backend
4. เขียนโค้ด Frontend
5. อธิบาย flow การทำงานทั้งหมด
6. คุยหรืออธิบายเป็นภาษาไทย
7. ห้าม commit หรือ push โค้ดเองเด็ดขาด

# Lottery System Constitution

## 1. ภาพรวมระบบ (System Overview)

ระบบหวยออนไลน์แบบลำดับชั้น 3 ระดับ (Master → Agent → Member) ที่รองรับหวยหลายประเภท พร้อมระบบค่าคอมมิชชั่นที่ยืดหยุ่นและระบบเลขอั้นอัจฉริยะ

### 1.1 วัตถุประสงค์

- จัดการระบบหวยออนไลน์แบบครบวงจร
- รองรับโครงสร้างตัวแทน 3 ระดับ (Master → Agent → Member)
- รองรับหวยหลายประเภท (รัฐบาล, ลาวพัฒนา, ฮานอย)
- ระบบค่าคอมมิชชั่นแยกตามประเภทหวย
- ระบบเลขอั้นอัตโนมัติ พร้อม Alert
- คำนวณค่าคอมมิชชั่นอัตโนมัติตามลำดับชั้น

### 1.2 เทคโนโลยีหลัก

- **Frontend**: React Vite + JavaScript + Tailwind CSS
- **Backend**: Node.js + Express + JavaScript
- **Database**: MongoDB Atlas
- **ORM**: Mongoose
- **Authentication**: JWT (Access Token + Refresh Token)
- **API Spec**: RESTful API
- **Real-time**: WebSocket (สำหรับ Alert) - Planning Phase

---

## 2. โครงสร้างลำดับชั้น (Hierarchy Structure)

```
Master (เจ้า)
    └── Agent (ตัวแทน)
        └── Member (สมาชิก)
```

### 2.1 บทบาทและหน้าที่

#### Master (เจ้า)

- **บทบาท**: เจ้าของระบบ, ผู้รับแทงหวย
- **สิทธิ์**:
  - สร้างและจัดการ Agent
  - กำหนดอัตราค่าคอมสูงสุดให้ Agent (แยกตามประเภทหวย)
  - โอนเครดิตให้ Agent
  - สร้างและจัดการงวดหวย (ทุกประเภท)
  - กำหนดเลขอั้น (Number Limits)
  - ปิดรับแทง
  - ออกผลรางวัล
  - ดูรายงานทั้งระบบ
  - รับ Alert เมื่อเลขใกล้เต็ม
- **การเงิน**:
  - รับเงินแทงทั้งหมด (หลังหักส่วนลด)
  - จ่ายค่าคอมให้ Agent (จากส่วนต่าง)
  - รับผิดชอบจ่ายรางวัล
  - **ไม่ได้รับค่าคอม** (เพราะเป็นเจ้าของ)

#### Agent (ตัวแทน)

- **บทบาท**: ตัวกลางระหว่าง Master และ Member
- **สิทธิ์**:
  - สร้างและจัดการ Member
  - กำหนดอัตราค่าคอมให้ Member (ต้องไม่เกินที่ Master กำหนด)
  - โอนเครดิตให้ Member
  - รับโพยจาก Member
  - ดูรายงานในสายงานตัวเอง
  - ดูสถานะเลขอั้น
- **การเงิน**:
  - ได้รับค่าคอมจากส่วนต่าง = (อัตราที่ Master ให้) - (อัตราที่แบ่งให้ Member)
  - **ไม่สามารถสร้าง Agent อื่นได้**
- **ข้อจำกัด**:
  - Agent มีได้เฉพาะ Member เท่านั้น (ไม่มี Agent ลูก)

#### Member (สมาชิก)

- **บทบาท**: ผู้แทงหวย
- **สิทธิ์**:
  - แทงหวย (ทุกประเภท)
  - ตรวจสอบผลรางวัล
  - ดูประวัติการแทง
  - ดูยอดเครดิต
- **การเงิน**:
  - ได้รับค่าคอม (ส่วนลด) จาก Agent
  - จ่ายเงินแทงหลังหักส่วนลด
- **ข้อจำกัด**:
  - ไม่สามารถสร้าง downline ใดๆ

---

## 3. ประเภทหวย (Lottery Categories)

### 3.1 หวยที่รองรับ

| รหัส            | ชื่อ      | วันออกรางวัล       | เวลาปิดรับ |
| --------------- | --------- | ------------------ | ---------- |
| `government`    | รัฐบาล    | 1, 16 ของเดือน     | 14:30      |
| `lao_pattana`   | ลาวพัฒนา  | จันทร์, พุธ, ศุกร์ | 19:30      |
| `hanoi_regular` | ฮานอยปกติ | ทุกวัน             | 17:30      |
| `hanoi_vip`     | ฮานอยVIP  | ทุกวัน             | 18:30      |

### 3.2 ประเภทการแทง (Bet Types)

แต่ละหวยรองรับ:

| ประเภท    | รหัส           | จำนวนตัวเลข | ตัวอย่าง | อัตราจ่ายเริ่มต้น |
| --------- | -------------- | ----------- | -------- | ----------------- |
| 3 ตัวบน   | `three_top`    | 3 หลัก      | 123      | 1:850             |
| 3 ตัวโต๊ด | `three_tod`    | 3 หลัก      | 456      | 1:150             |
| 2 ตัวบน   | `two_top`      | 2 หลัก      | 12       | 1:90              |
| 2 ตัวล่าง | `two_bottom`   | 2 หลัก      | 34       | 1:90              |
| วิ่งบน    | `run_top`      | 1 หลัก      | 5        | 1:3.5             |
| วิ่งล่าง  | `run_bottom`   | 1 หลัก      | 6        | 1:4.5             |

_หมายเหตุ: อัตราจ่ายสามารถปรับแต่งได้แยกตามแต่ละประเภทหวย_

---

## 4. ระบบค่าคอมมิชชั่น (Commission System)

### 4.1 หลักการสำคัญ

> **ค่าคอม = ส่วนลด (Commission = Discount)**
>
> เมื่อ Agent "ให้ค่าคอม 5%" กับ Member = Member "ได้ส่วนลด 5%"

### 4.2 การคำนวณค่าคอม

```
Master กำหนดอัตราให้ Agent (แยกตามประเภทหวย)
    ↓
Agent แบ่งค่าคอมให้ Member (ต้องไม่เกินที่ Master ให้)
    ↓
Agent ได้จากส่วนต่าง = (อัตราจาก Master) - (อัตราที่ให้ Member)
```

### 4.3 โครงสร้างอัตราค่าคอม

**Master กำหนดให้ Agent:**

```javascript
{
  three_top: 10,      // 3 ตัวบน 10%
  three_tod: 10,      // 3 ตัวโต๊ด 10%
  two_top: 8,         // 2 ตัวบน 8%
  two_bottom: 8,      // 2 ตัวล่าง 8%
  run_top: 5,         // วิ่งบน 5%
  run_bottom: 5       // วิ่งล่าง 5%
}
```

**Agent แบ่งให้ Member:**

```javascript
{
  three_top: 6,       // 3 ตัวบน 6% (≤ 10%)
  three_tod: 6,       // 3 ตัวโต๊ด 6% (≤ 10%)
  two_top: 5,         // 2 ตัวบน 5% (≤ 8%)
  two_bottom: 5,      // 2 ตัวล่าง 5% (≤ 8%)
  run_top: 3,         // วิ่งบน 3% (≤ 5%)
  run_bottom: 3       // วิ่งล่าง 3% (≤ 5%)
}
```

### 4.4 ตัวอย่างการคำนวณ

#### กรณีที่ 1: Member แทง 3 ตัวบน 100 บาท

**เงื่อนไข:**

- Master ให้ Agent: 10%
- Agent ให้ Member: 6%

**การคำนวณ:**

1. **Member:**
   - ยอดแทง: 100 บาท
   - ได้ส่วนลด: 6%
   - ส่วนลด: 100 × 6% = 6 บาท
   - **จ่ายจริง: 94 บาท**

2. **Agent:**
   - ได้ค่าคอมจาก Master: 10%
   - แบ่งให้ Member: 6%
   - ส่วนต่าง: 10% - 6% = 4%
   - **Agent ได้: 100 × 4% = 4 บาท**

3. **Master:**
   - รับเงินจาก Member: 94 บาท
   - จ่ายค่าคอมให้ Agent: 4 บาท
   - **Master เหลือ: 94 - 4 = 90 บาท** (รับแทงไว้)

4. **ถ้า Member ถูกรางวัล (อัตราจ่าย 1:850):**
   - เงินรางวัล = 100 × 850 = **85,000 บาท**
   - Master ต้องจ่าย: 85,000 บาท

#### กรณีที่ 2: Member แทง 2 ตัวบน 200 บาท

**เงื่อนไข:**

- Master ให้ Agent: 8%
- Agent ให้ Member: 5%

**การคำนวณ:**

1. **Member:**
   - ยอดแทง: 200 บาท
   - ส่วนลด: 200 × 5% = 10 บาท
   - **จ่ายจริง: 190 บาท**

2. **Agent:**
   - ส่วนต่าง: 8% - 5% = 3%
   - **Agent ได้: 200 × 3% = 6 บาท**

3. **Master:**
   - รับเงิน: 190 บาท
   - จ่ายค่าคอม: 6 บาท
   - **Master เหลือ: 184 บาท**

### 4.5 กฎการกำหนดอัตรา

1. ✅ **Downline ต้องได้น้อยกว่า Upline เสมอ**

   ```
   ถูกต้อง:  Master 10% → Agent 6%
   ผิด:      Master 10% → Agent 12% ❌
   ```

2. ✅ **แต่ละประเภทหวยตั้งค่าอัตราแยกกันได้**

   ```
   Agent ให้ Member:
   - 3 ตัวบน: 8%
   - 2 ตัวบน: 5%
   - วิ่งบน: 3%
   ```

3. ✅ **ต้องไม่เกินที่ Master กำหนด**
   ```
   ถ้า Master ให้ Agent: 3 ตัวบน 10%
   Agent ให้ Member ได้สูงสุด: 10%
   ```

---

## 5. ระบบเลขอั้น (Number Limit System)

### 5.1 หลักการทำงาน

**เลขอั้น = จำกัดยอดรับซื้อต่อเลข ต่องวด**

- Master กำหนดว่าแต่ละเลขรับซื้อได้สูงสุดเท่าไหร่
- ยอดรวมทั้งระบบ (ไม่แยกตาม Agent)
- แต่ละงวดตั้งค่าใหม่

### 5.2 ประเภทการอั้น

#### 5.2.1 อั้นเลขเฉพาะ (Specific Number Limit)

```
เลข 456 (3 ตัวบน) - รับซื้อไม่เกิน 10,000 บาท
```

#### 5.2.2 อั้นทุกเลขในประเภท (Global Type Limit)

```
3 ตัวบน - ทุกเลข รับซื้อไม่เกิน 50,000 บาท/เลข
2 ตัวบน - ทุกเลข รับซื้อไม่เกิน 30,000 บาท/เลข
```

#### 5.2.3 ปิดเลข (Block Number)

```
เลข 123 - ปิดรับ (ไม่รับซื้อเลย)
```

### 5.3 ตัวอย่างการทำงาน

#### สถานการณ์ 1: ซื้อเลขอั้น ✅

**เงื่อนไข:**

- งวดรัฐบาล 1 ก.พ. 2025
- เลข 456 (3 ตัวบน) อั้นไว้: 10,000 บาท
- ยอดซื้อปัจจุบัน: 9,000 บาท

**ผล:**

| การซื้อ           | ยอด       | ผลลัพธ์          | เหลือรับได้ |
| ----------------- | --------- | ---------------- | ----------- |
| Member A ซื้อ 456 | 2,000 บาท | ❌ ไม่ได้ (เกิน) | -           |
| Member A ซื้อ 456 | 1,000 บาท | ✅ ได้ (พอดี)    | 0           |
| Member A ซื้อ 456 | 500 บาท   | ✅ ได้           | 500 บาท     |

**คำนวณ:**

```
ยอดปัจจุบัน: 9,000 บาท
ต้องการซื้อ: 2,000 บาท
รวม: 11,000 บาท
จำกัด: 10,000 บาท

11,000 > 10,000 ❌ ไม่อนุมัติ

ซื้อได้สูงสุด: 10,000 - 9,000 = 1,000 บาท
```

#### สถานการณ์ 2: หลายคนซื้อเลขเดียวกัน

**เงื่อนไข:**

- เลข 789 อั้นไว้: 20,000 บาท
- ยอดปัจจุบัน: 0 บาท

**ลำดับการซื้อ:**

| ลำดับ | ผู้ซื้อ  | จำนวน  | ยอดรวม | สถานะ                      |
| ----- | -------- | ------ | ------ | -------------------------- |
| 1     | Member A | 5,000  | 5,000  | ✅ ผ่าน                    |
| 2     | Member B | 8,000  | 13,000 | ✅ ผ่าน                    |
| 3     | Member C | 10,000 | 23,000 | ❌ เกิน (รับได้ 7,000)     |
| 4     | Member D | 5,000  | 20,000 | ✅ ผ่าน (ถ้า C ซื้อ 7,000) |

#### สถานการณ์ 3: เลขปิดรับ ❌

**เงื่อนไข:**

- เลข 123 (3 ตัวบน) ปิดรับ (is_blocked = true)

**ผล:**

```
Member ซื้อเลข 123 จำนวนเท่าไหร่ก็ตาม
→ ❌ ไม่อนุมัติทันที
→ Error: "เลข 123 ปิดรับซื้อ"
```

### 5.4 ระบบ Alert (แจ้งเตือน)

#### Alert Level 1: เตือนที่ 80% 🟡

```
เลข 456 ซื้อไปแล้ว 8,000/10,000 บาท (80%)
→ แจ้งเตือน Master
```

#### Alert Level 2: เตือนที่ 90% 🟠

```
เลข 456 ซื้อไปแล้ว 9,000/10,000 บาท (90%)
→ แจ้งเตือน Master (เร่งด่วน)
```

#### Alert Level 3: เต็ม 100% 🔴

```
เลข 456 ซื้อเต็ม 10,000/10,000 บาท (100%)
→ แจ้งเตือน Master
→ ระบบปิดรับอัตโนมัติ
```

**รูปแบบการแจ้งเตือน:**

- ✉️ Real-time notification (WebSocket)
- 🔔 In-app notification

### 5.5 เลขอั้นเริ่มต้น (Default Limits)

Master สามารถตั้งค่าเลขอั้นเริ่มต้นได้:

```javascript
// เลขอั้นเริ่มต้นสำหรับหวยรัฐบาล
{
  category: 'government',
  limits: {
    three_top: 50000,    // ทุกเลข 3 ตัวบน รับไม่เกิน 50,000
    three_tod: 30000,
    two_top: 80000,
    two_bottom: 80000,
    run_top: 200000,
    run_bottom: 200000
  }
}

// เมื่อสร้างงวดใหม่ จะ copy ค่าเหล่านี้ไปใช้อัตโนมัติ
```

---

## 6. กระบวนการแทงหวย (Betting Process)

### 6.1 ขั้นตอนการแทง

```mermaid
graph TD
    A[Member เลือกเลขและจำนวน] --> B[ตรวจสอบเครดิต]
    B --> C{เครดิตพอ?}
    C -->|ไม่| Z1[❌ แจ้งเครดิตไม่พอ]
    C -->|ใช่| D[ตรวจสอบสถานะงวด]
    D --> E{งวดเปิดรับ?}
    E -->|ไม่| Z2[❌ แจ้งงวดปิดแล้ว]
    E -->|ใช่| F[ตรวจสอบเลขอั้น]
    F --> G{เลขอั้น?}
    G -->|ปิดรับ| Z3[❌ แจ้งเลขปิดรับ]
    G -->|เกินจำกัด| Z4[❌ แจ้งเกินจำกัด + แสดงยอดที่รับได้]
    G -->|ผ่าน| H[คำนวณส่วนลด]
    H --> I[คำนวณค่าคอม Agent]
    I --> J[หักเครดิต Member]
    J --> K[สร้าง Ticket]
    K --> L[เพิ่มค่าคอม Agent]
    L --> M[อัพเดทยอดเลขอั้น]
    M --> N{ยอดเลข ≥ 80%?}
    N -->|ใช่| O[ส่ง Alert]
    N -->|ไม่| P[✅ เสร็จสิ้น]
    O --> P
```

### 6.2 การตรวจสอบ (Validations)

#### ก่อนแทง:

1. ✅ **เครดิตเพียงพอ** - Member ต้องมีเครดิต ≥ (ยอดแทง - ส่วนลด)
2. ✅ **งวดเปิดรับ** - lottery.status = 'open'
3. ✅ **ยังไม่ปิดรับ** - now < lottery.close_time
4. ✅ **เลขไม่ปิดรับ** - is_blocked = false
5. ✅ **ไม่เกินเลขอั้น** - current_amount + bet_amount ≤ max_amount
6. ✅ **Format เลขถูกต้อง** - 3 ตัวบน = XXX, 2 ตัวบน = XX, etc.
7. ✅ **จำนวนเงิน > 0** - bet_amount > 0

#### หลังแทง:

1. ✅ **บันทึก Ticket**
2. ✅ **หักเครดิต Member**
3. ✅ **เพิ่มค่าคอม Agent**
4. ✅ **อัพเดทยอดเลขอั้น**
5. ✅ **บันทึก Transaction**
6. ✅ **ส่ง Alert (ถ้าจำเป็น)**

### 6.3 ตัวอย่าง Request/Response

#### Request: แทงหวย

```json
POST /api/v1/tickets

{
  "lottery_id": "uuid-lottery-1",
  "bet_type": "three_top",
  "number": "456",
  "bet_amount": 1000
}
```

#### Response: สำเร็จ ✅

```json
{
  "id": "uuid-ticket-1",
  "lottery_id": "uuid-lottery-1",
  "bet_type": "three_top",
  "number": "456",
  "bet_amount": 1000,
  "discount_amount": 60,
  "net_amount": 940,
  "agent_commission": 40,
  "status": "pending",
  "created_at": "2025-02-01T10:30:00Z"
}
```

#### Response: เกินเลขอั้น ❌

```json
{
  "error": "LIMIT_EXCEEDED",
  "message": "เลข 456 รับซื้อเกินจำกัด",
  "details": {
    "number": "456",
    "bet_type": "three_top",
    "requested_amount": 2000,
    "current_amount": 9000,
    "limit": 10000,
    "max_allowed": 1000
  }
}
```

#### Response: เลขปิดรับ ❌

```json
{
  "error": "NUMBER_BLOCKED",
  "message": "เลข 123 ปิดรับซื้อ",
  "details": {
    "number": "123",
    "bet_type": "three_top"
  }
}
```

### 6.4 การยกเลิกโพย

**เงื่อนไข:**

- ยกเลิกได้เฉพาะก่อนปิดรับเท่านั้น
- เครดิตจะถูกคืนเต็มจำนวน
- ค่าคอมที่คำนวณไว้จะถูกลบ
- ยอดเลขอั้นจะถูกลด

**Process:**

```
1. ตรวจสอบว่ายังไม่ปิดรับ
2. คืนเครดิตให้ Member
3. ลบค่าคอม Agent
4. ลดยอดเลขอั้น
5. อัพเดทสถานะเป็น 'cancelled'
6. บันทึก Transaction
```

---

## 7. การออกผลรางวัล (Draw Process)

### 7.1 ขั้นตอนการออกผล

```
1. Master ปิดรับแทง
    ↓
2. ตรวจสอบว่าปิดรับแล้ว (status = 'closed')
    ↓
3. Master ป้อนผลรางวัล
    ↓
4. ระบบตรวจสอบ Tickets ทั้งหมดในงวดนี้
    ↓
5. เปรียบเทียบเลขแทงกับผลรางวัล
    ↓
6. คำนวณเงินรางวัล
    ↓
7. เพิ่มเครดิตให้ผู้ถูกรางวัล
    ↓
8. อัพเดทสถานะ Tickets
    ↓
9. สร้าง Winners Record
    ↓
10. สร้าง Credit Transactions
```

### 7.2 รูปแบบผลรางวัล

```json
{
  "three_top": "123",
  "three_tod": ["456", "789", "012"],
  "two_top": "12",
  "two_bottom": "34",
  "run_top": ["1", "5", "9"],
  "run_bottom": ["2", "6", "8"]
}
```

### 7.3 Logic การตรวจสอบ

#### 3 ตัวบน

```javascript
ticket.bet_type === 'three_top' && ticket.number === results.three_top;
// ต้องตรงทุกหลัก
```

#### 3 ตัวโต๊ด

```javascript
ticket.bet_type === 'three_tod' && results.three_tod.includes(ticket.number);
// อยู่ใน array ของ 3 ตัวโต๊ด
```

#### 2 ตัวบน

```javascript
ticket.bet_type === 'two_top' && ticket.number === results.two_top;
// ต้องตรงทุกหลัก
```

#### วิ่งบน

```javascript
ticket.bet_type === 'run_top' && results.run_top.includes(ticket.number);
// อยู่ใน array ของวิ่งบน
```

### 7.4 ตัวอย่างการคำนวณรางวัล

**ผลรางวัล:**

```json
{
  "three_top": "456",
  "two_top": "45"
}
```

**Tickets:**

```
1. Member A แทง 456 (3 ตัวบน) 100 บาท
2. Member B แทง 123 (3 ตัวบน) 200 บาท
3. Member C แทง 45 (2 ตัวบน) 50 บาท
```

**ผลการตรวจ:**

| Ticket   | เลขแทง | ถูก/ผิด   | อัตราจ่าย | รางวัล                 |
| -------- | ------ | --------- | --------- | ---------------------- |
| Member A | 456    | ✅ ถูก    | 1:850     | 100 × 850 = 85,000 บาท |
| Member B | 123    | ❌ ไม่ถูก | -         | 0 บาท                  |
| Member C | 45     | ✅ ถูก    | 1:90      | 50 × 90 = 4,500 บาท    |

**Master ต้องจ่าย:**

```
รวมรางวัล = 85,000 + 4,500 = 89,500 บาท
```

---

## 8. ระบบเครดิต (Credit System)

### 8.1 การไหลของเครดิต

```
Master
    ↓ โอนเครดิต
Agent
    ↓ โอนเครดิต
Member
    ↓ แทงหวย (ใช้เครดิต)
```

### 8.2 ประเภทธุรกรรม

| ประเภท        | รหัส         | คำอธิบาย                 | ผู้ทำ        |
| ------------- | ------------ | ------------------------ | ------------ |
| โอนเครดิต     | `transfer`   | โอนจาก upline → downline | Master/Agent |
| ค่าคอมมิชชั่น | `commission` | ค่าคอมจากยอดแทง          | ระบบ (auto)  |
| เงินรางวัล    | `winning`    | รางวัลที่ถูก             | ระบบ (auto)  |
| ฝากเงิน       | `deposit`    | ฝากเครดิตเข้าระบบ        | Master       |
| ถอนเงิน       | `withdraw`   | ถอนเครดิตออก             | Master/Agent |
| ปรับปรุงยอด   | `adjustment` | แก้ไขยอดโดย Master       | Master       |
| แทงหวย        | `bet`        | หักเครดิตเมื่อแทง        | ระบบ (auto)  |
| ยกเลิกโพย     | `bet_cancel` | คืนเครดิตเมื่อยกเลิก     | ระบบ (auto)  |

### 8.3 กฎการโอนเครดิต

1. ✅ **โอนได้เฉพาะ downline** ที่สร้างโดยตัวเองเท่านั้น
2. ✅ **ต้องมีเครดิตเพียงพอ** ก่อนโอน
3. ✅ **จำนวนเงิน > 0**
4. ✅ **บันทึกทุกครั้ง** (Audit Trail)
5. ✅ **ใช้ Transaction** (ถ้าผิดพลาดจะ rollback)

### 8.4 ตัวอย่างการโอนเครดิต

```javascript
// Master โอนเครดิตให้ Agent
{
  from_user_id: 'master-uuid',
  to_user_id: 'agent-uuid',
  amount: 50000,
  type: 'transfer',
  note: 'เติมเครดิตครั้งที่ 5'
}

// Agent โอนเครดิตให้ Member
{
  from_user_id: 'agent-uuid',
  to_user_id: 'member-uuid',
  amount: 5000,
  type: 'transfer',
  note: 'เติมเครดิต'
}
```

---

## 9. โครงสร้างฐานข้อมูล (Database Schema)

### 9.1 ตารางหลัก

#### Users

```sql
id                  UUID PRIMARY KEY
username            VARCHAR(50) UNIQUE NOT NULL
name               VARCHAR(50) UNIQUE NOT NULL
password            VARCHAR(255) NOT NULL
role                ENUM('master', 'agent', 'member') NOT NULL
parent_id           UUID REFERENCES users(id)
credit_balance      DECIMAL(15,2) DEFAULT 0
commission_rate     JSONB
status              ENUM('active', 'suspended', 'inactive') DEFAULT 'active'
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()

INDEX idx_users_parent_id (parent_id)
INDEX idx_users_role (role)
INDEX idx_users_status (status)
```

**commission_rate format:**

```json
{
  "three_top": 10.0,
  "three_tod": 10.0,
  "two_top": 8.0,
  "two_bottom": 8.0,
  "run_top": 5.0,
  "run_bottom": 5.0
}
```

#### Lottery_Categories

```sql
id                  UUID PRIMARY KEY
code                VARCHAR(50) UNIQUE NOT NULL
name                VARCHAR(100) NOT NULL
draw_schedule       JSONB
payout_rates        JSONB
status              ENUM('active', 'inactive') DEFAULT 'active'
created_at          TIMESTAMP DEFAULT NOW()

INDEX idx_lottery_categories_code (code)
INDEX idx_lottery_categories_status (status)
```

**draw_schedule format:**

```json
{
  "days": ["monday", "friday"],
  "time": "14:30:00",
  "timezone": "Asia/Bangkok"
}
```

**payout_rates format:**

```json
{
  "three_top": 850,
  "three_tod": 150,
  "two_top": 90,
  "two_bottom": 90,
  "run_top": 3.5,
  "run_bottom": 4.5
}
```

#### Lotteries

```sql
id                  UUID PRIMARY KEY
category_id         UUID REFERENCES lottery_categories(id) NOT NULL
draw_date           TIMESTAMP NOT NULL
close_time          TIMESTAMP NOT NULL
status              ENUM('open', 'closed', 'drawn', 'cancelled') DEFAULT 'open'
results             JSONB
created_by          UUID REFERENCES users(id)
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()

INDEX idx_lotteries_category_id (category_id)
INDEX idx_lotteries_status (status)
INDEX idx_lotteries_draw_date (draw_date)
```

#### Number_Limits

```sql
id                  UUID PRIMARY KEY
lottery_id          UUID REFERENCES lotteries(id) NOT NULL
bet_type            VARCHAR(20) NOT NULL
number              VARCHAR(10)
max_amount          DECIMAL(15,2) NOT NULL
current_amount      DECIMAL(15,2) DEFAULT 0
is_blocked          BOOLEAN DEFAULT false
alert_sent_80       BOOLEAN DEFAULT false
alert_sent_90       BOOLEAN DEFAULT false
alert_sent_100      BOOLEAN DEFAULT false
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()

INDEX idx_number_limits_lottery_id (lottery_id)
INDEX idx_number_limits_bet_type (bet_type)
INDEX idx_number_limits_number (number)
UNIQUE (lottery_id, bet_type, number)
```

#### Default_Number_Limits

```sql
id                  UUID PRIMARY KEY
master_id           UUID REFERENCES users(id) NOT NULL
category_id         UUID REFERENCES lottery_categories(id)
bet_type            VARCHAR(20)
max_amount          DECIMAL(15,2) NOT NULL
is_blocked          BOOLEAN DEFAULT false
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()

INDEX idx_default_limits_master_id (master_id)
INDEX idx_default_limits_category_id (category_id)
```

#### Tickets

```sql
id                  UUID PRIMARY KEY
lottery_id          UUID REFERENCES lotteries(id) NOT NULL
user_id             UUID REFERENCES users(id) NOT NULL
agent_id            UUID REFERENCES users(id)
master_id           UUID REFERENCES users(id)
bet_type            VARCHAR(20) NOT NULL
number              VARCHAR(10) NOT NULL
bet_amount          DECIMAL(15,2) NOT NULL
discount_amount     DECIMAL(15,2) DEFAULT 0
net_amount          DECIMAL(15,2) NOT NULL
commission_amount   DECIMAL(15,2) DEFAULT 0
status              ENUM('pending', 'win', 'lose', 'cancelled') DEFAULT 'pending'
win_amount          DECIMAL(15,2)
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()

INDEX idx_tickets_lottery_id (lottery_id)
INDEX idx_tickets_user_id (user_id)
INDEX idx_tickets_agent_id (agent_id)
INDEX idx_tickets_status (status)
INDEX idx_tickets_number (number)
INDEX idx_tickets_created_at (created_at)
```

#### Credit_Transactions

```sql
id                  UUID PRIMARY KEY
from_user_id        UUID REFERENCES users(id)
to_user_id          UUID REFERENCES users(id) NOT NULL
amount              DECIMAL(15,2) NOT NULL
type                VARCHAR(20) NOT NULL
reference_id        UUID
balance_before      DECIMAL(15,2) NOT NULL
balance_after       DECIMAL(15,2) NOT NULL
note                TEXT
created_at          TIMESTAMP DEFAULT NOW()

INDEX idx_credit_transactions_from_user (from_user_id)
INDEX idx_credit_transactions_to_user (to_user_id)
INDEX idx_credit_transactions_type (type)
INDEX idx_credit_transactions_created_at (created_at)
INDEX idx_credit_transactions_reference (reference_id)
```

---

## 10. API Endpoints

### 10.1 Authentication

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/refresh
PUT    /api/v1/auth/change-password
```

### 10.2 Users Management

```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
PUT    /api/v1/users/:id/status
PUT    /api/v1/users/:id/commission-rate
GET    /api/v1/users/:id/downline
```

### 10.3 Credits

```
GET    /api/v1/credits/balance
POST   /api/v1/credits/transfer
GET    /api/v1/credits/transactions
GET    /api/v1/credits/summary
```

### 10.4 Lottery Categories

```
GET    /api/v1/lottery-categories
GET    /api/v1/lottery-categories/:id
POST   /api/v1/lottery-categories (Master only)
PUT    /api/v1/lottery-categories/:id (Master only)
DELETE /api/v1/lottery-categories/:id (Master only)
```

### 10.5 Lotteries

```
GET    /api/v1/lotteries
POST   /api/v1/lotteries (Master only)
GET    /api/v1/lotteries/:id
PUT    /api/v1/lotteries/:id (Master only)
DELETE /api/v1/lotteries/:id (Master only)
PUT    /api/v1/lotteries/:id/close (Master only)
POST   /api/v1/lotteries/:id/draw (Master only)
GET    /api/v1/lotteries/active
```

### 10.6 Number Limits (เลขอั้น)

```
GET    /api/v1/lotteries/:lottery_id/limits
POST   /api/v1/lotteries/:lottery_id/limits (Master only)
PUT    /api/v1/lotteries/:lottery_id/limits/:id (Master only)
DELETE /api/v1/lotteries/:lottery_id/limits/:id (Master only)
GET    /api/v1/lotteries/:lottery_id/limits/check

GET    /api/v1/default-limits
POST   /api/v1/default-limits (Master only)
PUT    /api/v1/default-limits/:id (Master only)
DELETE /api/v1/default-limits/:id (Master only)
```

### 10.7 Tickets

```
GET    /api/v1/tickets
POST   /api/v1/tickets
POST   /api/v1/tickets/validate
GET    /api/v1/tickets/:id
DELETE /api/v1/tickets/:id (ยกเลิก)
GET    /api/v1/tickets/user/:user_id
GET    /api/v1/tickets/lottery/:lottery_id
```

### 10.8 Reports

```
GET    /api/v1/reports/sales
GET    /api/v1/reports/commissions
GET    /api/v1/reports/winnings
GET    /api/v1/reports/number-sales
GET    /api/v1/reports/daily-summary
GET    /api/v1/reports/agent-performance
```

### 10.9 Results

```
GET    /api/v1/results
GET    /api/v1/results/:lottery_id
POST   /api/v1/results/check
```

### 10.10 Alerts

```
GET    /api/v1/alerts
PUT    /api/v1/alerts/:id/read
DELETE /api/v1/alerts/:id
```

---

## 11. ระบบความปลอดภัย (Security)

### 11.1 Authentication

**JWT Token:**

```json
{
  "user_id": "uuid",
  "username": "string",
  "role": "master|agent|member",
  "iat": 1706803200,
  "exp": 1707408000
}
```

### 11.2 Authorization Rules

| Role       | สิทธิ์                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Master** | - เข้าถึงทุกอย่างในระบบ<br>- สร้าง/แก้ไข Agent<br>- กำหนดค่าคอม<br>- จัดการงวดหวย<br>- กำหนดเลขอั้น<br>- ดูรายงานทั้งหมด                                |
| **Agent**  | - เข้าถึงข้อมูลในสายงานตัวเอง<br>- สร้าง/แก้ไข Member<br>- กำหนดค่าคอมให้ Member<br>- โอนเครดิตให้ Member<br>- ดูรายงานสายงานตัวเอง<br>- ดูสถานะเลขอั้น |
| **Member** | - เข้าถึงข้อมูลตัวเองเท่านั้น<br>- แทงหวย<br>- ตรวจผลรางวัล<br>- ดูประวัติ<br>- ดูยอดเครดิต                                                             |

### 11.3 Data Protection

1. **Password Hashing**: bcrypt (salt rounds: 10)
2. **Input Validation**: Joi/Zod schema validation
3. **SQL Injection**: Protected by Prisma ORM
4. **XSS Prevention**: Sanitize all inputs/outputs
5. **CSRF Protection**: CSRF tokens for state-changing operations
6. **Rate Limiting**:
   - Login: 5 attempts per 15 minutes
   - API: 100 requests per minute per IP
   - Betting: 10 bets per minute per user

### 11.4 Audit Trail

บันทึกทุก action สำคัญ:

- ✅ Login/Logout
- ✅ สร้าง/แก้ไข/ลบ User
- ✅ โอนเครดิต
- ✅ แทงหวย
- ✅ ยกเลิกโพย
- ✅ ออกผลรางวัล
- ✅ เปลี่ยนอัตราค่าคอม
- ✅ ตั้งค่าเลขอั้น

---

## 12. Error Handling

### 12.1 HTTP Status Codes

| Code | ความหมาย          | ใช้เมื่อ            |
| ---- | ----------------- | ------------------- |
| 200  | OK                | สำเร็จ              |
| 201  | Created           | สร้างข้อมูลสำเร็จ   |
| 400  | Bad Request       | ข้อมูล invalid      |
| 401  | Unauthorized      | ไม่ได้ login        |
| 403  | Forbidden         | ไม่มีสิทธิ์         |
| 404  | Not Found         | ไม่พบข้อมูล         |
| 409  | Conflict          | ข้อมูลซ้ำ           |
| 422  | Unprocessable     | Validation error    |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Error    | ข้อผิดพลาดระบบ      |

### 12.2 Error Response Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": {
    "field": "field_name",
    "value": "invalid_value",
    "constraint": "must be greater than 0"
  },
  "timestamp": "2025-02-01T10:30:00Z"
}
```

### 12.3 Error Codes

```
AUTH_001: Invalid credentials
AUTH_002: Token expired
AUTH_003: Unauthorized access
AUTH_004: Account suspended

USER_001: User not found
USER_002: Username already exists
USER_003: Cannot create user of higher role
USER_004: Cannot modify parent user
USER_005: Commission rate exceeds parent's rate

CREDIT_001: Insufficient balance
CREDIT_002: Invalid transfer amount
CREDIT_003: Cannot transfer to parent

LOTTERY_001: Lottery not found
LOTTERY_002: Lottery not open
LOTTERY_003: Lottery already closed
LOTTERY_004: Cannot draw unopened lottery
LOTTERY_005: Results already published

TICKET_001: Invalid bet amount
TICKET_002: Invalid number format
TICKET_003: Cannot bet on closed lottery
TICKET_004: Cannot cancel ticket after close time

LIMIT_001: Number blocked
LIMIT_002: Number limit exceeded
LIMIT_003: Invalid limit amount
LIMIT_004: Cannot modify limit after bets placed

SYSTEM_001: Database error
SYSTEM_002: External service unavailable
```

---

## 13. Performance & Scalability

### 13.1 Database Optimization

**Indexes:**

- ✅ Foreign keys
- ✅ Status fields
- ✅ Date/Time fields
- ✅ Frequently queried fields

**Query Optimization:**

- ✅ Use Prisma includes sparingly
- ✅ Pagination for large datasets
- ✅ Aggregate queries for reports
- ✅ Avoid N+1 queries

### 13.2 Caching Strategy

**Redis Caching:**

```javascript
// Cache lottery data (15 minutes)
cache.set(`lottery:${id}`, data, 900);

// Cache number limits (5 minutes)
cache.set(`limits:${lottery_id}`, data, 300);

// Cache user data (1 hour)
cache.set(`user:${id}`, data, 3600);
```

### 13.3 Real-time Updates

**WebSocket Events:**

```javascript
// Alert เมื่อเลขใกล้เต็ม
ws.emit('number_limit_alert', {
  lottery_id,
  number,
  percentage: 90,
  current_amount: 9000,
  max_amount: 10000,
});

// อัพเดทยอดเลขอั้นแบบ Real-time
ws.emit('number_limit_update', {
  lottery_id,
  number,
  current_amount: 9500,
});
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

- ✅ คำนวณส่วนลด
- ✅ คำนวณค่าคอม
- ✅ ตรวจสอบเลขถูกรางวัล
- ✅ ตรวจสอบเลขอั้น
- ✅ Validation functions

### 14.2 Integration Tests

- ✅ Authentication flow
- ✅ User hierarchy creation
- ✅ Credit transfer
- ✅ Betting process
- ✅ Number limit enforcement
- ✅ Drawing process

### 14.3 E2E Tests

- ✅ สร้าง Agent และ Member
- ✅ โอนเครดิต
- ✅ แทงหวยจนถึงรับรางวัล
- ✅ ทดสอบเลขอั้น
- ✅ ทดสอบ Alert

---

## 15. Deployment

### 15.1 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/lottery_db

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://api.lottery.com
REACT_APP_WS_URL=wss://api.lottery.com

# Redis
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@lottery.com
SMTP_PASS=password

# SMS (optional)
SMS_API_KEY=your-sms-api-key
```

### 15.2 Deployment Checklist

**Backend:**

- [ ] Build JavaScript
- [ ] Run Prisma migrations
- [ ] Set environment variables
- [ ] Configure CORS
- [ ] Set up SSL/TLS
- [ ] Configure Nginx reverse proxy
- [ ] Set up monitoring (PM2/Docker)
- [ ] Configure logging
- [ ] Set up Redis
- [ ] Configure WebSocket

**Frontend:**

- [ ] Build production bundle
- [ ] Optimize assets
- [ ] Configure CDN
- [ ] Set API endpoints
- [ ] Enable compression
- [ ] Configure caching headers

**Database:**

- [ ] Backup strategy
- [ ] Regular maintenance schedule
- [ ] Monitor performance
- [ ] Set up replication (optional)

---

## 16. Monitoring & Alerts

### 16.1 System Monitoring

**Metrics:**

- CPU usage
- Memory usage
- Disk space
- Network I/O
- Database connections
- API response time
- Error rate

**Tools:**

- PM2 monitoring
- PostgreSQL pg_stat_statements
- Redis INFO command

### 16.2 Business Alerts

**Alert Types:**

1. **เลขอั้น 80%** 🟡

   ```
   เลข 456 ซื้อไปแล้ว 80%
   → แจ้งเตือน Master
   ```

2. **เลขอั้น 90%** 🟠

   ```
   เลข 456 ซื้อไปแล้ว 90%
   → แจ้งเตือนเร่งด่วน Master
   ```

3. **เลขอั้นเต็ม 100%** 🔴

   ```
   เลข 456 ซื้อเต็ม 100%
   → ปิดรับอัตโนมัติ + แจ้งเตือน Master
   ```

4. **ยอดถูกรางวัลสูง** 💰

   ```
   งวดนี้มีผู้ถูกรางวัล 500,000 บาท
   → แจ้งเตือน Master
   ```

5. **เครดิตต่ำ** ⚠️
   ```
   Agent/Member เครดิตเหลือต่ำกว่า threshold
   → แจ้งเตือน
   ```

---

## 17. Future Enhancements

### 17.1 Phase 2 Features

- 📱 Mobile App (React Native)
- 🔔 Push Notifications
- 💬 Live Chat Support
- 📊 Advanced Analytics Dashboard
- 🎨 Customizable UI Themes
- 🌍 Multi-language (EN/TH/LA)
- 📈 Predictive Analytics

### 17.2 Phase 3 Features

- 🤖 AI Fraud Detection
- 🎯 Marketing Automation
- 💳 Payment Gateway Integration
- 📱 SMS OTP Verification
- 🔗 API for Third-party Integration
- 📊 Business Intelligence Tools

---

## 18. Glossary

| คำศัพท์        | ความหมาย                            |
| -------------- | ----------------------------------- |
| Master         | เจ้า, เจ้าของระบบ, ผู้รับแทงหวย     |
| Agent          | ตัวแทน, ตัวกลาง                     |
| Member         | สมาชิก, ผู้แทงหวย                   |
| Commission     | ค่าคอมมิชชั่น, ค่าตอบแทน (= ส่วนลด) |
| Discount       | ส่วนลด (= ค่าคอม)                   |
| Upline         | ผู้ที่อยู่ระดับบน                   |
| Downline       | ผู้ที่อยู่ระดับล่าง                 |
| Payout         | อัตราจ่ายรางวัล                     |
| Draw           | การออกรางวัล                        |
| Ticket         | โพย, ใบแทง                          |
| Number Limit   | เลขอั้น, จำกัดยอดรับซื้อ            |
| Blocked Number | เลขปิดรับ                           |
| Alert          | การแจ้งเตือน                        |
| Stake          | ยอดเดิมพัน                          |
| Net Amount     | ยอดสุทธิ (หลังหักส่วนลด)            |

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-02-01  
**Status**: Active

**Prepared by**: Development Team  
**Approved by**: Master/Owner

---

## สรุปสำคัญ

### โครงสร้างระบบ:

```
Master (เจ้า)
  └── Agent (ตัวแทน)
      └── Member (สมาชิก)
```

### จุดเด่นของระบบ:

1. ✅ **ค่าคอม = ส่วนลด** (ไม่แยก)
2. ✅ **แยกอัตราตามประเภทหวย** (3ตัวบน, 2ตัวบน, ฯลฯ)
3. ✅ **4 ประเภทหวย** (รัฐบาล, ลาว, ฮานอย 2 แบบ)
4. ✅ **ระบบเลขอั้นอัจฉริยะ** พร้อม Alert
5. ✅ **รวมยอดทั้งระบบ** (ไม่แยก Agent)
6. ✅ **Master เป็นผู้รับแทง** (ไม่ได้ค่าคอม)
7. ✅ **Agent มีได้แค่ Member** (ไม่มี Agent ลูก)
