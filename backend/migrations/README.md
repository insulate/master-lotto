# Database Migrations & Seeds

โฟลเดอร์นี้เก็บ migration scripts และ seed data สำหรับ database

## ไฟล์ในโฟลเดอร์

- **seed-users.js** - ข้อมูล Master user เริ่มต้น
- **run-seed.js** - Script สำหรับรัน seed
- **README.md** - เอกสารนี้

## วิธีใช้งาน

### 1. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env` ในโฟลเดอร์ backend:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lotto_system
DB_PORT=3306
```

### 2. สร้าง Database และ Tables

ก่อนรัน seed ต้องสร้าง database และ tables ก่อน:

```sql
-- สร้าง database
CREATE DATABASE lotto_system;
USE lotto_system;

-- สร้าง users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('master', 'agent', 'member') NOT NULL,
  parent_id VARCHAR(36),
  credit DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) DEFAULT 0,
  commission_rate JSON,
  status ENUM('active', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_users_parent_id (parent_id),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
);
```

### 3. รัน Seed

```bash
cd backend
npm run seed
```

## ข้อมูล Master User ที่สร้าง

```
Username: master
Password: master123
Role: master
Credit: 100,000.00
Balance: 50,000.00
Status: active
```

### Commission Rate

```json
{
  "three_top": 30,
  "three_tod": 30,
  "two_top": 30,
  "two_bottom": 30,
  "run_top": 30,
  "run_bottom": 30
}
```

## การเพิ่ม User ใหม่

แก้ไข `seed-users.js` และเพิ่ม user ใหม่ใน array `users`:

```javascript
export const users = [
  {
    id: uuidv4(),
    username: 'master',
    name: 'Master Admin',
    password: null,
    role: 'master',
    parent_id: null,
    credit: 100000.00,
    balance: 50000.00,
    commission_rate: JSON.stringify({}),
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  }
];
```

จากนั้นรัน seed ใหม่:
```bash
npm run seed
```

## หมายเหตุ

- Script จะตรวจสอบว่ามี user อยู่แล้วหรือไม่ ถ้ามีจะข้ามการสร้าง
- Password จะถูก hash ด้วย bcryptjs (10 rounds)
- สามารถรัน seed ซ้ำได้โดยไม่สร้าง duplicate
- ต้อง setup database และ tables ก่อนรัน seed

## Troubleshooting

### Error: Cannot find module

```bash
# ตรวจสอบว่า install dependencies แล้ว
cd backend
npm install
```

### Error: Access denied for user

```bash
# ตรวจสอบ .env file
# ตรวจสอบ MySQL username/password
```

### Error: Unknown database

```bash
# สร้าง database ก่อน
mysql -u root -p
CREATE DATABASE lotto_system;
```

### Error: Table doesn't exist

```bash
# สร้าง tables ตาม SQL ในหัวข้อ "2. สร้าง Database และ Tables"
```
