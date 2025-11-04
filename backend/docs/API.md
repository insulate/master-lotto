# เอกสาร API ระบบหวย (Lotto System)

Base URL: `http://localhost:3000/api/v1`

## สารบัญ
- [การยืนยันตัวตน (Authentication)](#การยืนยันตัวตน-authentication)
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
  "message": "Logout successful"
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
  "message": "Password changed successfully"
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
  "message": "string"
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
