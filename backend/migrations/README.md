# Database Migrations & Seeds

โฟลเดอร์นี้เก็บ migration scripts และ seed data สำหรับ MongoDB

## ไฟล์ในโฟลเดอร์

- **seed-users.js** - ข้อมูล Master user เริ่มต้น
- **run-seed.js** - Script สำหรับรัน seed
- **README.md** - เอกสารนี้

## วิธีใช้งาน

### 1. ติดตั้ง MongoDB

#### สำหรับ Local Development:

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Windows:**
ดาวน์โหลดจาก [MongoDB Download Center](https://www.mongodb.com/try/download/community)

**Ubuntu:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ backend:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/lotto_system

# MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lotto_system?retryWrites=true&w=majority
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

แก้ไข `seed-users.js` และเพิ่ม user ใหม่:

```javascript
// สร้าง user เพิ่ม
const newUser = new User({
  username: 'agent1',
  name: 'Agent One',
  password: hashedPassword,
  role: 'agent',
  parent_id: masterId,
  credit: 50000.00,
  balance: 25000.00,
  status: 'active'
});

await newUser.save();
```

จากนั้นรัน seed ใหม่:
```bash
npm run seed
```

## หมายเหตุ

- Script จะตรวจสอบว่ามี user อยู่แล้วหรือไม่ ถ้ามีจะข้ามการสร้าง
- Password จะถูก hash ด้วย bcryptjs (10 rounds)
- สามารถรัน seed ซ้ำได้โดยไม่สร้าง duplicate
- MongoDB จะสร้าง database และ collection อัตโนมัติ ไม่ต้องสร้างเอง

## Troubleshooting

### Error: Cannot find module

```bash
# ตรวจสอบว่า install dependencies แล้ว
cd backend
npm install
```

### Error: MongoServerError: connect ECONNREFUSED

```bash
# ตรวจสอบว่า MongoDB กำลังรันอยู่หรือไม่
# macOS:
brew services list
brew services start mongodb-community@7.0

# Linux:
sudo systemctl status mongod
sudo systemctl start mongod

# Windows:
# เปิด Services และ start MongoDB
```

### Error: Authentication failed

```bash
# ตรวจสอบ MONGODB_URI ใน .env file
# สำหรับ local ไม่ต้องใช้ username/password
MONGODB_URI=mongodb://localhost:27017/lotto_system
```

### Error: Invalid connection string

```bash
# ตรวจสอบ format ของ MONGODB_URI
# Local: mongodb://localhost:27017/database_name
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/database_name
```

## MongoDB Atlas (Cloud Database)

หากต้องการใช้ MongoDB Atlas (Free tier):

1. สมัครที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. สร้าง Free Cluster
3. สร้าง Database User
4. เพิ่ม IP Address ให้เข้าถึงได้ (หรือใช้ 0.0.0.0/0 สำหรับทดสอบ)
5. คัดลอก Connection String
6. แก้ไข `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lotto_system?retryWrites=true&w=majority
   ```
