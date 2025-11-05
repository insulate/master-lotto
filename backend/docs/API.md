# เอกสาร API ระบบหวย (Lotto System)

Base URL: `http://localhost:3000/api/v1`

## สารบัญ
- [การยืนยันตัวตน (Authentication)](#การยืนยันตัวตน-authentication)
- [จัดการเอเย่นต์ (Agent Management - Master)](#จัดการเอเย่นต์-agent-management---master)
- [รูปแบบ Response](#รูปแบบ-response)
- [รหัสข้อผิดพลาด (Error Codes)](#รหัสข้อผิดพลาด-error-codes)

---

## การยืนยันตัวตน (Authentication)

Endpoints ที่ต้องการการยืนยันตัวตนจะต้องส่ง Bearer token ใน Authorization header:

```
Authorization: Bearer <access_token>
```

### ประเภทของ Token
- **Access Token**: Token อายุสั้น (15 นาที) สำหรับเรียกใช้ API
- **Refresh Token**: Token อายุยาว (7 วัน) สำหรับขอ access token ใหม่

---

## Authentication Endpoints

### 1. เข้าสู่ระบบ (Login)

เข้าสู่ระบบและรับ access token และ refresh token

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "role": "master|agent|member",
      "status": "active|suspended",
      "credit": 0.00,
      "balance": 0.00,
      "commission_rate": {},
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**ข้อผิดพลาด (Error Responses):**
- `400 Bad Request` - ไม่ได้ระบุ username หรือ password
- `401 Unauthorized` - ข้อมูลเข้าสู่ระบบไม่ถูกต้อง
- `403 Forbidden` - บัญชีถูกระงับการใช้งาน

**ตัวอย่าง:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

---

### 2. ออกจากระบบ (Logout)

ออกจากระบบและยกเลิก refresh token

**Endpoint:** `POST /auth/logout`

**ต้องการ Authentication:** ใช่

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**ข้อผิดพลาด:**
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ

**ตัวอย่าง:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. ดูข้อมูลผู้ใช้ปัจจุบัน (Get Current User)

ดึงข้อมูลของผู้ใช้ที่เข้าสู่ระบบอยู่

**Endpoint:** `GET /auth/me`

**ต้องการ Authentication:** ใช่

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "role": "master|agent|member",
      "parent_id": "uuid|null",
      "status": "active|suspended",
      "credit": 0.00,
      "balance": 0.00,
      "commission_rate": {},
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**ข้อผิดพลาด:**
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ

**ตัวอย่าง:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

### 4. ต่ออายุ Token (Refresh Token)

ขอ access token ใหม่โดยใช้ refresh token

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "string"
  }
}
```

**ข้อผิดพลาด:**
- `400 Bad Request` - ต้องระบุ refresh token
- `401 Unauthorized` - Refresh token ไม่ถูกต้องหรือหมดอายุ

**ตัวอย่าง:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

---

### 5. เปลี่ยนรหัสผ่าน (Change Password)

เปลี่ยนรหัสผ่านของผู้ใช้ปัจจุบัน

**Endpoint:** `PUT /auth/change-password`

**ต้องการ Authentication:** ใช่

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**ข้อผิดพลาด:**
- `400 Bad Request` - ข้อมูลไม่ครบหรือรหัสผ่านสั้นเกินไป (ต้องมีอย่างน้อย 6 ตัวอักษร)
- `401 Unauthorized` - Token ไม่ถูกต้องหรือรหัสผ่านเดิมไม่ถูกต้อง

**ตัวอย่าง:**
```bash
curl -X PUT http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }'
```

---

## จัดการเอเย่นต์ (Agent Management - Master)

APIs สำหรับ Master ในการจัดการเอเย่นต์ (Agent) ที่อยู่ภายใต้การดูแล

**ต้องการ Authentication:** ใช่ (Master role เท่านั้น)

### 1. ดึงรายการเอเย่นต์ทั้งหมด (Get All Agents)

ดึงรายการเอเย่นต์ทั้งหมดที่อยู่ภายใต้ Master ที่ login อยู่

**Endpoint:** `GET /master/agents`

**ต้องการสิทธิ์:** Master

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "ดึงข้อมูลเอเย่นต์สำเร็จ",
  "data": {
    "agents": [
      {
        "_id": "690ad7ccab89858ec41eaa2e",
        "username": "agent01",
        "name": "Agent Name",
        "role": "agent",
        "parent_id": "690abf7d3da89da188649b87",
        "credit": 10000,
        "balance": 0,
        "commission_rate": {
          "three_top": 25,
          "three_tod": 25,
          "two_top": 25,
          "two_bottom": 25,
          "run_top": 25,
          "run_bottom": 25,
          "_id": "690ad7ccab89858ec41eaa2f"
        },
        "status": "active",
        "createdAt": "2025-11-05T04:51:24.426Z",
        "updatedAt": "2025-11-05T04:51:24.426Z"
      }
    ],
    "total": 1
  }
}
```

**ข้อผิดพลาด:**
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง (ต้องเป็น Master)

**ตัวอย่าง:**
```bash
curl -X GET http://localhost:3000/api/v1/master/agents \
  -H "Authorization: Bearer <access_token>"
```

---

### 2. ดึงข้อมูลเอเย่นต์ตาม ID (Get Agent By ID)

ดึงข้อมูลเอเย่นต์รายเดียวตาม ID (ต้องเป็นเอเย่นต์ของ Master ที่ login เท่านั้น)

**Endpoint:** `GET /master/agents/:id`

**ต้องการสิทธิ์:** Master

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (string, required) - Agent ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "ดึงข้อมูลเอเย่นต์สำเร็จ",
  "data": {
    "agent": {
      "_id": "690ad7ccab89858ec41eaa2e",
      "username": "agent01",
      "name": "Agent Name",
      "role": "agent",
      "parent_id": "690abf7d3da89da188649b87",
      "credit": 10000,
      "balance": 0,
      "commission_rate": {
        "three_top": 25,
        "three_tod": 25,
        "two_top": 25,
        "two_bottom": 25,
        "run_top": 25,
        "run_bottom": 25,
        "_id": "690ad7ccab89858ec41eaa2f"
      },
      "status": "active",
      "createdAt": "2025-11-05T04:51:24.426Z",
      "updatedAt": "2025-11-05T04:51:24.426Z"
    }
  }
}
```

**ข้อผิดพลาด:**
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง
- `404 Not Found` - ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง

**ตัวอย่าง:**
```bash
curl -X GET http://localhost:3000/api/v1/master/agents/690ad7ccab89858ec41eaa2e \
  -H "Authorization: Bearer <access_token>"
```

---

### 3. สร้างเอเย่นต์ใหม่ (Create Agent)

สร้างเอเย่นต์ใหม่ภายใต้ Master ที่ login อยู่ (จะหัก credit จาก Master)

**Endpoint:** `POST /master/agents`

**ต้องการสิทธิ์:** Master

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string (required)",
  "name": "string (required)",
  "password": "string (required, min 6 characters)",
  "credit": "number (optional, default: 0)",
  "commission_rate": {
    "three_top": "number (optional, default: 0)",
    "three_tod": "number (optional, default: 0)",
    "two_top": "number (optional, default: 0)",
    "two_bottom": "number (optional, default: 0)",
    "run_top": "number (optional, default: 0)",
    "run_bottom": "number (optional, default: 0)"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "สร้างเอเย่นต์สำเร็จ",
  "data": {
    "agent": {
      "_id": "690ad7ccab89858ec41eaa2e",
      "username": "agent01",
      "name": "Agent Name",
      "role": "agent",
      "parent_id": "690abf7d3da89da188649b87",
      "credit": 5000,
      "balance": 0,
      "commission_rate": {
        "three_top": 20,
        "three_tod": 20,
        "two_top": 20,
        "two_bottom": 20,
        "run_top": 20,
        "run_bottom": 20,
        "_id": "690ad7ccab89858ec41eaa2f"
      },
      "status": "active",
      "createdAt": "2025-11-05T04:51:24.426Z",
      "updatedAt": "2025-11-05T04:51:24.426Z"
    }
  }
}
```

**ข้อผิดพลาด:**
- `400 Bad Request` - ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง
  - กรุณากรอกข้อมูลให้ครบถ้วน
  - รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
  - ชื่อผู้ใช้นี้ถูกใช้งานแล้ว
  - เครดิตไม่สามารถเป็นค่าลบได้
  - เครดิตไม่เพียงพอ
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง
- `404 Not Found` - ไม่พบข้อมูลผู้ใช้

**ตัวอย่าง:**
```bash
curl -X POST http://localhost:3000/api/v1/master/agents \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent01",
    "name": "Agent Name",
    "password": "password123",
    "credit": 5000,
    "commission_rate": {
      "three_top": 20,
      "three_tod": 20,
      "two_top": 20,
      "two_bottom": 20,
      "run_top": 20,
      "run_bottom": 20
    }
  }'
```

---

### 4. แก้ไขข้อมูลเอเย่นต์ (Update Agent)

แก้ไขข้อมูลเอเย่นต์ (ชื่อและ commission rate เท่านั้น)

**Endpoint:** `PUT /master/agents/:id`

**ต้องการสิทธิ์:** Master

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required) - Agent ID

**Request Body:**
```json
{
  "name": "string (optional)",
  "commission_rate": {
    "three_top": "number (optional)",
    "three_tod": "number (optional)",
    "two_top": "number (optional)",
    "two_bottom": "number (optional)",
    "run_top": "number (optional)",
    "run_bottom": "number (optional)"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "อัพเดทข้อมูลเอเย่นต์สำเร็จ",
  "data": {
    "agent": {
      "_id": "690ad7ccab89858ec41eaa2e",
      "username": "agent01",
      "name": "Updated Agent Name",
      "role": "agent",
      "parent_id": "690abf7d3da89da188649b87",
      "credit": 10000,
      "balance": 0,
      "commission_rate": {
        "three_top": 30,
        "three_tod": 30,
        "two_top": 30,
        "two_bottom": 30,
        "run_top": 30,
        "run_bottom": 30,
        "_id": "690ad7ccab89858ec41eaa2f"
      },
      "status": "active",
      "createdAt": "2025-11-05T04:51:24.426Z",
      "updatedAt": "2025-11-05T05:30:00.000Z"
    }
  }
}
```

**ข้อผิดพลาด:**
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง
- `404 Not Found` - ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง

**ตัวอย่าง:**
```bash
curl -X PUT http://localhost:3000/api/v1/master/agents/690ad7ccab89858ec41eaa2e \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Agent Name",
    "commission_rate": {
      "three_top": 30,
      "three_tod": 30,
      "two_top": 30,
      "two_bottom": 30,
      "run_top": 30,
      "run_bottom": 30
    }
  }'
```

---

### 5. เปลี่ยนสถานะเอเย่นต์ (Toggle Agent Status)

เปิด/ปิดการใช้งานเอเย่นต์ (active/suspended)

**Endpoint:** `PATCH /master/agents/:id/status`

**ต้องการสิทธิ์:** Master

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required) - Agent ID

**Request Body:**
```json
{
  "status": "active|suspended (required)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "เปิดใช้งานเอเย่นต์สำเร็จ",
  "data": {
    "agent": {
      "_id": "690ad7ccab89858ec41eaa2e",
      "username": "agent01",
      "name": "Agent Name",
      "role": "agent",
      "parent_id": "690abf7d3da89da188649b87",
      "credit": 10000,
      "balance": 0,
      "commission_rate": {
        "three_top": 25,
        "three_tod": 25,
        "two_top": 25,
        "two_bottom": 25,
        "run_top": 25,
        "run_bottom": 25,
        "_id": "690ad7ccab89858ec41eaa2f"
      },
      "status": "active",
      "createdAt": "2025-11-05T04:51:24.426Z",
      "updatedAt": "2025-11-05T05:35:00.000Z"
    }
  }
}
```

**ข้อผิดพลาด:**
- `400 Bad Request` - สถานะไม่ถูกต้อง (active หรือ suspended)
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง
- `404 Not Found` - ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง

**ตัวอย่าง:**
```bash
# เปิดใช้งาน
curl -X PATCH http://localhost:3000/api/v1/master/agents/690ad7ccab89858ec41eaa2e/status \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# ระงับการใช้งาน
curl -X PATCH http://localhost:3000/api/v1/master/agents/690ad7ccab89858ec41eaa2e/status \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'
```

---

### 6. ปรับเครดิตเอเย่นต์ (Adjust Agent Credit)

เพิ่มหรือลดเครดิตของเอเย่นต์ (จะโอนเครดิตระหว่าง Master และ Agent)

**Endpoint:** `PATCH /master/agents/:id/credit`

**ต้องการสิทธิ์:** Master

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (string, required) - Agent ID

**Request Body:**
```json
{
  "amount": "number (required, > 0)",
  "action": "add|deduct (required)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "เพิ่มเครดิตเอเย่นต์สำเร็จ",
  "data": {
    "agent": {
      "_id": "690ad7ccab89858ec41eaa2e",
      "username": "agent01",
      "name": "Agent Name",
      "role": "agent",
      "parent_id": "690abf7d3da89da188649b87",
      "credit": 15000,
      "balance": 0,
      "commission_rate": {
        "three_top": 25,
        "three_tod": 25,
        "two_top": 25,
        "two_bottom": 25,
        "run_top": 25,
        "run_bottom": 25,
        "_id": "690ad7ccab89858ec41eaa2f"
      },
      "status": "active",
      "createdAt": "2025-11-05T04:51:24.426Z",
      "updatedAt": "2025-11-05T05:40:00.000Z"
    },
    "masterCredit": 85000
  }
}
```

**ข้อผิดพลาด:**
- `400 Bad Request` - ข้อมูลไม่ถูกต้อง
  - กรุณาระบุจำนวนเครดิตและประเภทการทำรายการ (add หรือ deduct)
  - จำนวนเครดิตต้องเป็นตัวเลขที่มากกว่า 0
  - เครดิตไม่เพียงพอ (Master)
  - เครดิตของเอเย่นต์ไม่เพียงพอ (Agent)
- `401 Unauthorized` - Token ไม่ถูกต้องหรือหมดอายุ
- `403 Forbidden` - ไม่มีสิทธิ์เข้าถึง
- `404 Not Found` - ไม่พบเอเย่นต์หรือไม่มีสิทธิ์เข้าถึง

**ตัวอย่าง:**
```bash
# เพิ่มเครดิต 5000
curl -X PATCH http://localhost:3000/api/v1/master/agents/690ad7ccab89858ec41eaa2e/credit \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "action": "add"
  }'

# ลดเครดิต 3000
curl -X PATCH http://localhost:3000/api/v1/master/agents/690ad7ccab89858ec41eaa2e/credit \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3000,
    "action": "deduct"
  }'
```

---

## รูปแบบ Response

### Response สำเร็จ (Success)
```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

### Response ผิดพลาด (Error)
```json
{
  "success": false,
  "message": "string",
  "data": null,
  "errors": []
}
```

---

## รหัสข้อผิดพลาด (Error Codes)

| รหัสสถานะ | คำอธิบาย |
|-------------|-------------|
| 200 | OK - คำขอสำเร็จ |
| 201 | Created - สร้างข้อมูลสำเร็จ |
| 400 | Bad Request - พารามิเตอร์ไม่ถูกต้อง |
| 401 | Unauthorized - ต้องการการยืนยันตัวตนหรือ token ไม่ถูกต้อง |
| 403 | Forbidden - ไม่มีสิทธิ์เข้าถึง |
| 404 | Not Found - ไม่พบข้อมูล |
| 500 | Internal Server Error - เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ |

---

## บทบาทผู้ใช้ (User Roles)

| บทบาท | คำอธิบาย |
|------|-------------|
| `master` | ผู้ดูแลระบบ มีสิทธิ์เข้าถึงทุกอย่าง |
| `agent` | ตัวแทน จัดการสมาชิก (member) |
| `member` | ผู้ใช้ทั่วไป เล่นหวย |

---

## สถานะบัญชี (Status)

| สถานะ | คำอธิบาย |
|--------|-------------|
| `active` | บัญชีใช้งานได้ปกติ |
| `suspended` | บัญชีถูกระงับการใช้งาน |

---

## ขั้นตอนการยืนยันตัวตน (Authentication Flow)

1. **เข้าสู่ระบบ (Login)**: ผู้ใช้ login ด้วย username และ password
   - ได้รับ `accessToken` (15 นาที) และ `refreshToken` (7 วัน)

2. **เรียกใช้ API**: ใช้ `accessToken` ใน Authorization header
   ```
   Authorization: Bearer <access_token>
   ```

3. **ต่ออายุ Token**: เมื่อ `accessToken` หมดอายุ
   - เรียก `/auth/refresh` พร้อม `refreshToken`
   - ได้รับ `accessToken` ใหม่

4. **ออกจากระบบ (Logout)**: เรียก `/auth/logout` เพื่อยกเลิก tokens

---

## หมายเหตุ

- ค่าเวลาทั้งหมดอยู่ในรูปแบบ ISO 8601 (UTC)
- ค่าทศนิยมทั้งหมดใช้ 2 ตำแหน่ง
- รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร
- Access token หมดอายุใน 15 นาที
- Refresh token หมดอายุใน 7 วัน

---

## ตัวอย่างการใช้งาน

### 1. เข้าสู่ระบบและรับ Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### 2. ใช้ Token เพื่อเรียก API
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. ต่ออายุ Token เมื่อหมดอายุ
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

### 4. ออกจากระบบ
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
