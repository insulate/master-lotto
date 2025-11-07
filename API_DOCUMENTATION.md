# Member Betting API Documentation

API สำหรับระบบแทงหวยของสมาชิก (Member) รองรับการแทงหวยหลายประเภท การตรวจสอบประวัติการแทง และการดูรายละเอียดบิลการแทง

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

API ทั้งหมดต้องใช้ JWT Authentication โดยใส่ Access Token ใน Header:

```
Authorization: Bearer <access_token>
```

## สิทธิ์การใช้งาน

API ทั้งหมดในเอกสารนี้ต้องใช้สิทธิ์ **Member** เท่านั้น

---

## 1. แทงหวย (Place Bet)

สร้างบิลการแทงหวยใหม่ พร้อมตัดเครดิตและบันทึกค่าคอมมิชชั่น

### Endpoint

```
POST /member/bets
```

### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token |
| Content-Type | string | Yes | application/json |

### Request Body

```json
{
  "lottery_draw_id": "string",
  "bet_items": [
    {
      "bet_type": "string",
      "number": "string",
      "amount": number
    }
  ]
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| lottery_draw_id | string | Yes | ObjectId ของงวดหวยที่ต้องการแทง |
| bet_items | array | Yes | รายการเลขที่ต้องการแทง (อย่างน้อย 1 รายการ) |
| bet_items[].bet_type | string | Yes | ประเภทการแทง: `three_top`, `three_tod`, `two_top`, `two_bottom`, `run_top`, `run_bottom` |
| bet_items[].number | string | Yes | เลขที่แทง (1-3 หลักตามประเภท) |
| bet_items[].amount | number | Yes | จำนวนเงินที่แทง (ต้อง > 0) |

#### Bet Types

| bet_type | Description | Digits | Example |
|----------|-------------|--------|---------|
| three_top | สามตัวบน | 3 | "123" |
| three_tod | สามตัวโต๊ด | 3 | "456" |
| two_top | สองตัวบน | 2 | "78" |
| two_bottom | สองตัวล่าง | 2 | "90" |
| run_top | วิ่งบน | 1 | "5" |
| run_bottom | วิ่งล่าง | 1 | "7" |

### Request Example

```json
{
  "lottery_draw_id": "674e8a5f9c8e2a3b4c5d6e7f",
  "bet_items": [
    {
      "bet_type": "three_top",
      "number": "123",
      "amount": 100
    },
    {
      "bet_type": "two_top",
      "number": "45",
      "amount": 50
    },
    {
      "bet_type": "run_bottom",
      "number": "7",
      "amount": 20
    }
  ]
}
```

### Response (Success - 201 Created)

```json
{
  "success": true,
  "message": "แทงหวยสำเร็จ",
  "data": {
    "bet": {
      "_id": "674e8b1f9c8e2a3b4c5d6e80",
      "member_id": {
        "_id": "674e8a1f9c8e2a3b4c5d6e70",
        "username": "testmember",
        "name": "สมชาย ใจดี"
      },
      "agent_id": {
        "_id": "674e8a2f9c8e2a3b4c5d6e71",
        "username": "agent01",
        "name": "Agent 01"
      },
      "lottery_draw_id": {
        "_id": "674e8a5f9c8e2a3b4c5d6e7f",
        "lottery_type": "government",
        "draw_date": "2025-01-15T14:30:00.000Z",
        "close_time": "2025-01-15T14:25:00.000Z"
      },
      "bet_items": [
        {
          "_id": "674e8b1f9c8e2a3b4c5d6e81",
          "bet_type": "three_top",
          "number": "123",
          "amount": 100,
          "payout_rate": 900,
          "potential_win": 90000,
          "is_win": null,
          "win_amount": 0
        },
        {
          "_id": "674e8b1f9c8e2a3b4c5d6e82",
          "bet_type": "two_top",
          "number": "45",
          "amount": 50,
          "payout_rate": 95,
          "potential_win": 4750,
          "is_win": null,
          "win_amount": 0
        },
        {
          "_id": "674e8b1f9c8e2a3b4c5d6e83",
          "bet_type": "run_bottom",
          "number": "7",
          "amount": 20,
          "payout_rate": 3.5,
          "potential_win": 70,
          "is_win": null,
          "win_amount": 0
        }
      ],
      "total_amount": 170,
      "total_potential_win": 94820,
      "status": "pending",
      "actual_win_amount": 0,
      "commission_data": {
        "agent": {
          "rates": {
            "three_top": 2,
            "two_top": 1.5,
            "run_bottom": 1
          },
          "total_commission": 3.45
        },
        "master": {
          "rates": {
            "three_top": 1,
            "two_top": 0.5,
            "run_bottom": 0.5
          },
          "total_commission": 1.35
        }
      },
      "settled_at": null,
      "createdAt": "2025-01-10T08:30:00.000Z",
      "updatedAt": "2025-01-10T08:30:00.000Z"
    },
    "deducted": {
      "credit": 170,
      "balance": 0,
      "total": 170
    },
    "remaining": {
      "credit": 830,
      "balance": 0,
      "total": 830
    }
  }
}
```

### Validation Rules

#### Lottery Draw Validation
- งวดหวยต้องมีสถานะ `open`
- เวลาปัจจุบันต้องอยู่ระหว่าง `open_time` และ `close_time`
- ห้ามแทงก่อนเวลาเปิด (จะได้รับข้อความ "ยังไม่ถึงเวลาเปิดรับแทง")
- ห้ามแทงหลังเวลาปิด (จะได้รับข้อความ "เลยเวลาปิดรับแทงแล้ว")

#### Number Validation
- `three_top`, `three_tod`: ต้องเป็นเลข 3 หลัก (000-999)
- `two_top`, `two_bottom`: ต้องเป็นเลข 2 หลัก (00-99)
- `run_top`, `run_bottom`: ต้องเป็นเลข 1 หลัก (0-9)
- เลขต้องเป็นตัวเลขเท่านั้น (ห้ามมีอักษรพิเศษ)

#### Amount Validation
- จำนวนเงินต้องมากกว่า 0
- ต้องไม่น้อยกว่า `min_bet` ของงวดนั้นๆ
- ต้องไม่มากกว่า `max_bet` ของงวดนั้นๆ
- ตัวอย่าง: หาก `min_bet = 10` และ `max_bet = 5000` แล้วแทง 5 บาท จะได้รับ error "three_top: ขั้นต่ำ 10 บาท"

#### Member Validation
- สมาชิกต้องมีสถานะ `active`
- Agent ของสมาชิกต้องมีสถานะ `active`
- เครดิตรวม (credit + balance) ต้องเพียงพอ
- ตัดเครดิตจาก `credit` ก่อน หากไม่พอจึงตัดจาก `balance`

#### Bet Type Validation
- ประเภทการแทงต้องเปิดรับในงวดนั้นๆ (`bet_settings[bet_type].enabled = true`)
- หากประเภทปิดรับ จะได้รับข้อความ "ประเภท {bet_type} ปิดรับแทงในงวดนี้"

### Error Responses

#### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "message": "กรุณาระบุงวดหวยที่ต้องการแทง"
}
```

```json
{
  "success": false,
  "message": "กรุณาเพิ่มรายการเลขที่ต้องการแทง"
}
```

```json
{
  "success": false,
  "message": "เลข three_top ต้องมี 3 หลัก"
}
```

```json
{
  "success": false,
  "message": "three_top: ขั้นต่ำ 10 บาท"
}
```

```json
{
  "success": false,
  "message": "three_top: สูงสุด 5000 บาท"
}
```

```json
{
  "success": false,
  "message": "เครดิตไม่เพียงพอ (คงเหลือ 100 บาท ต้องการ 170 บาท)"
}
```

#### 400 Bad Request - Time Validation

```json
{
  "success": false,
  "message": "งวดหวยนี้ปิดรับแทงแล้ว"
}
```

```json
{
  "success": false,
  "message": "ยังไม่ถึงเวลาเปิดรับแทง"
}
```

```json
{
  "success": false,
  "message": "เลยเวลาปิดรับแทงแล้ว"
}
```

#### 403 Forbidden - Account Status

```json
{
  "success": false,
  "message": "บัญชีของคุณถูกระงับ ไม่สามารถแทงหวยได้"
}
```

```json
{
  "success": false,
  "message": "Agent ของคุณถูกระงับ ไม่สามารถแทงหวยได้"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "ไม่พบข้อมูลสมาชิก"
}
```

```json
{
  "success": false,
  "message": "ไม่พบข้อมูล Agent"
}
```

```json
{
  "success": false,
  "message": "ไม่พบข้อมูลงวดหวย"
}
```

---

## 2. ดูประวัติการแทง (Get Bet History)

ดึงรายการประวัติการแทงหวยของสมาชิก พร้อมรองรับการกรองและ Pagination

### Endpoint

```
GET /member/bets
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lottery_draw_id | string | No | - | กรองตามงวดหวย (ObjectId) |
| status | string | No | - | กรองตามสถานะ: `pending`, `won`, `lost`, `cancelled` |
| limit | number | No | 50 | จำนวนรายการต่อหน้า (1-100) |
| page | number | No | 1 | หน้าที่ต้องการดึง |

### Request Examples

#### ดึงรายการทั้งหมด (หน้าแรก)
```
GET /member/bets
```

#### กรองตามงวดหวย
```
GET /member/bets?lottery_draw_id=674e8a5f9c8e2a3b4c5d6e7f
```

#### กรองตามสถานะ
```
GET /member/bets?status=pending
```

#### Pagination
```
GET /member/bets?page=2&limit=20
```

#### กรองหลายเงื่อนไข
```
GET /member/bets?lottery_draw_id=674e8a5f9c8e2a3b4c5d6e7f&status=won&page=1&limit=10
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "message": "ดึงข้อมูลประวัติการแทงสำเร็จ",
  "data": {
    "bets": [
      {
        "_id": "674e8b1f9c8e2a3b4c5d6e80",
        "member_id": "674e8a1f9c8e2a3b4c5d6e70",
        "agent_id": "674e8a2f9c8e2a3b4c5d6e71",
        "lottery_draw_id": {
          "_id": "674e8a5f9c8e2a3b4c5d6e7f",
          "lottery_type": "government",
          "draw_date": "2025-01-15T14:30:00.000Z",
          "close_time": "2025-01-15T14:25:00.000Z",
          "status": "open"
        },
        "bet_items": [
          {
            "_id": "674e8b1f9c8e2a3b4c5d6e81",
            "bet_type": "three_top",
            "number": "123",
            "amount": 100,
            "payout_rate": 900,
            "potential_win": 90000,
            "is_win": null,
            "win_amount": 0
          }
        ],
        "total_amount": 100,
        "total_potential_win": 90000,
        "status": "pending",
        "actual_win_amount": 0,
        "commission_data": {
          "agent": {
            "rates": { "three_top": 2 },
            "total_commission": 2
          },
          "master": {
            "rates": { "three_top": 1 },
            "total_commission": 1
          }
        },
        "settled_at": null,
        "createdAt": "2025-01-10T08:30:00.000Z",
        "updatedAt": "2025-01-10T08:30:00.000Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| bets | array | รายการบิลการแทง (เรียงจากใหม่สุดไปเก่าสุด) |
| total | number | จำนวนบิลทั้งหมดที่ตรงตามเงื่อนไข |
| page | number | หน้าปัจจุบัน |
| limit | number | จำนวนรายการต่อหน้า |
| totalPages | number | จำนวนหน้าทั้งหมด |

### Bet Status

| Status | Description |
|--------|-------------|
| pending | รอออกผล |
| won | ถูกรางวัล |
| lost | ไม่ถูกรางวัล |
| cancelled | ยกเลิก |

---

## 3. ดูรายละเอียดบิล (Get Bet Details)

ดึงรายละเอียดบิลการแทงเฉพาะบิลที่ระบุ พร้อมข้อมูลสมาชิก Agent และผลรางวัล

### Endpoint

```
GET /member/bets/:id
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | ObjectId ของบิลที่ต้องการดู |

### Request Example

```
GET /member/bets/674e8b1f9c8e2a3b4c5d6e80
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "message": "ดึงข้อมูลบิลสำเร็จ",
  "data": {
    "bet": {
      "_id": "674e8b1f9c8e2a3b4c5d6e80",
      "member_id": {
        "_id": "674e8a1f9c8e2a3b4c5d6e70",
        "username": "testmember",
        "name": "สมชาย ใจดี"
      },
      "agent_id": {
        "_id": "674e8a2f9c8e2a3b4c5d6e71",
        "username": "agent01",
        "name": "Agent 01"
      },
      "lottery_draw_id": {
        "_id": "674e8a5f9c8e2a3b4c5d6e7f",
        "lottery_type": "government",
        "draw_date": "2025-01-15T14:30:00.000Z",
        "close_time": "2025-01-15T14:25:00.000Z",
        "status": "completed",
        "result": {
          "three_top": "456",
          "two_top": "56",
          "two_bottom": "78",
          "run_top": ["4", "5", "6"],
          "run_bottom": ["7", "8"]
        }
      },
      "bet_items": [
        {
          "_id": "674e8b1f9c8e2a3b4c5d6e81",
          "bet_type": "three_top",
          "number": "456",
          "amount": 100,
          "payout_rate": 900,
          "potential_win": 90000,
          "is_win": true,
          "win_amount": 90000
        },
        {
          "_id": "674e8b1f9c8e2a3b4c5d6e82",
          "bet_type": "two_top",
          "number": "12",
          "amount": 50,
          "payout_rate": 95,
          "potential_win": 4750,
          "is_win": false,
          "win_amount": 0
        }
      ],
      "total_amount": 150,
      "total_potential_win": 94750,
      "status": "won",
      "actual_win_amount": 90000,
      "commission_data": {
        "agent": {
          "rates": {
            "three_top": 2,
            "two_top": 1.5
          },
          "total_commission": 2.75
        },
        "master": {
          "rates": {
            "three_top": 1,
            "two_top": 0.5
          },
          "total_commission": 1.25
        }
      },
      "settled_at": "2025-01-15T15:00:00.000Z",
      "createdAt": "2025-01-10T08:30:00.000Z",
      "updatedAt": "2025-01-15T15:00:00.000Z"
    }
  }
}
```

### Error Responses

#### 403 Forbidden - Ownership Check

```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์ดูบิลนี้"
}
```

#### 404 Not Found

```json
{
  "success": false,
  "message": "ไม่พบข้อมูลบิล"
}
```

---

## Data Models

### Bet Model

```typescript
{
  _id: ObjectId,
  member_id: ObjectId,              // ref: User
  agent_id: ObjectId,               // ref: User
  lottery_draw_id: ObjectId,        // ref: LotteryDraw
  bet_items: [BetItem],
  total_amount: Number,
  total_potential_win: Number,
  status: 'pending' | 'won' | 'lost' | 'cancelled',
  actual_win_amount: Number,
  commission_data: {
    agent: {
      rates: {
        three_top: Number,
        three_tod: Number,
        two_top: Number,
        two_bottom: Number,
        run_top: Number,
        run_bottom: Number
      },
      total_commission: Number
    },
    master: {
      rates: {
        three_top: Number,
        three_tod: Number,
        two_top: Number,
        two_bottom: Number,
        run_top: Number,
        run_bottom: Number
      },
      total_commission: Number
    }
  },
  settled_at: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### BetItem Model

```typescript
{
  _id: ObjectId,
  bet_type: 'three_top' | 'three_tod' | 'two_top' | 'two_bottom' | 'run_top' | 'run_bottom',
  number: String,
  amount: Number,
  payout_rate: Number,
  potential_win: Number,
  is_win: Boolean | null,
  win_amount: Number
}
```

---

## Commission Calculation

### ค่าคอมมิชชั่นคำนวณดังนี้:

```
Commission = (Amount × Rate) / 100
```

### ตัวอย่าง:

แทง three_top 100 บาท
- Agent rate = 2%
- Master rate = 1%

```
Agent Commission = (100 × 2) / 100 = 2 บาท
Master Commission = (100 × 1) / 100 = 1 บาท
Total Commission = 3 บาท
```

### หมายเหตุ:

- ค่าคอมมิชชั่นบันทึก ณ เวลาที่แทง (เก็บ snapshot)
- หากอัตราเปลี่ยนภายหลัง จะไม่กระทบบิลที่แทงไปแล้ว
- ค่าคอมแยกเป็น Agent และ Master
- แต่ละประเภทการแทงมีอัตราค่าคอมต่างกัน

---

## Transaction Flow

### การแทงหวย (Place Bet)

1. **Validate Request**
   - ตรวจสอบ lottery_draw_id และ bet_items
   - ตรวจสอบรูปแบบข้อมูล

2. **Validate Member & Agent**
   - ตรวจสอบสมาชิกและ Agent มีอยู่จริง
   - ตรวจสอบสถานะเป็น active
   - ตรวจสอบความสัมพันธ์ parent_id

3. **Validate Lottery Draw**
   - ตรวจสอบงวดหวยมีอยู่จริง
   - ตรวจสอบสถานะเป็น open
   - ตรวจสอบเวลาเปิด-ปิดรับแทง

4. **Validate Bet Items**
   - ตรวจสอบประเภทการแทงถูกต้อง
   - ตรวจสอบเลขตรงตามจำนวนหลักที่กำหนด
   - ตรวจสอบจำนวนเงินอยู่ในช่วง min-max
   - คำนวณเงินที่อาจชนะ (potential_win)

5. **Check Credit**
   - ตรวจสอบเครดิตรวม (credit + balance)
   - ตรวจสอบเพียงพอสำหรับยอดแทง

6. **Calculate Commission**
   - ดึงอัตราค่าคอมของ Agent และ Master
   - คำนวณค่าคอมแต่ละประเภทการแทง

7. **Start MongoDB Transaction**
   - เริ่ม session และ transaction

8. **Deduct Credit**
   - ตัดเครดิตจาก member.credit ก่อน
   - หากไม่พอ ตัดต่อจาก member.balance
   - บันทึกการเปลี่ยนแปลง

9. **Create Credit Transaction**
   - บันทึก transaction log
   - เก็บยอดก่อน-หลัง

10. **Create Bet Record**
    - สร้างบิลการแทง
    - บันทึกรายการเลขทั้งหมด
    - บันทึกค่าคอมมิชชั่น

11. **Commit Transaction**
    - ยืนยันการเปลี่ยนแปลงทั้งหมด

12. **Return Response**
    - Populate ข้อมูลเพิ่มเติม
    - ส่งข้อมูลบิลกลับไปยัง client

### การจัดการข้อผิดพลาด

- หากเกิด error ใด ๆ ในขั้นตอนที่ 7-11
- Transaction จะถูก abort
- ไม่มีการเปลี่ยนแปลงข้อมูลใด ๆ ในฐานข้อมูล
- รับประกัน Atomicity

---

## Testing

### ตัวอย่าง cURL Commands

#### 1. แทงหวย

```bash
curl -X POST http://localhost:3000/api/v1/member/bets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lottery_draw_id": "674e8a5f9c8e2a3b4c5d6e7f",
    "bet_items": [
      {
        "bet_type": "three_top",
        "number": "123",
        "amount": 100
      }
    ]
  }'
```

#### 2. ดูประวัติการแทง

```bash
curl -X GET "http://localhost:3000/api/v1/member/bets?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. ดูรายละเอียดบิล

```bash
curl -X GET http://localhost:3000/api/v1/member/bets/674e8b1f9c8e2a3b4c5d6e80 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Rate Limits

ปัจจุบันยังไม่มีการจำกัดจำนวน Request แต่แนะนำให้:
- หลีกเลี่ยงการส่ง Request มากเกินไป
- ใช้ Pagination สำหรับข้อมูลจำนวนมาก
- Cache ข้อมูลที่ไม่เปลี่ยนแปลงบ่อย

---

## Changelog

### Version 1.0.0 (2025-01-10)
- เพิ่ม API แทงหวย (POST /member/bets)
- เพิ่ม API ดูประวัติการแทง (GET /member/bets)
- เพิ่ม API ดูรายละเอียดบิล (GET /member/bets/:id)
- รองรับการแทงหวย 6 ประเภท
- รองรับการคำนวณค่าคอมมิชชั่นอัตโนมัติ
- รองรับ MongoDB Transaction เพื่อความปลอดภัย
