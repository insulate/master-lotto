# Todo List: Frontend Agent Management System

## Phase 1: Reusable Components

- [ ] 1. สร้าง Reusable Table Component (DataTable.jsx)
  - ตำแหน่ง: `frontend/src/components/common/DataTable.jsx`
  - รองรับ columns configuration
  - มี pagination
  - มี search/filter
  - มี actions ต่อแถว

- [ ] 2. สร้าง Reusable Modal Component (Modal.jsx)
  - ตำแหน่ง: `frontend/src/components/common/Modal.jsx`
  - รองรับ title และ content slots
  - มีปุ่มปิด
  - คลิก backdrop เพื่อปิด
  - Responsive และมี animation

- [ ] 3. สร้าง Reusable ConfirmDialog Component (ConfirmDialog.jsx)
  - ตำแหน่ง: `frontend/src/components/common/ConfirmDialog.jsx`
  - แสดงข้อความเตือน
  - ปุ่ม Confirm/Cancel
  - Customizable text และ actions

## Phase 2: API Service

- [ ] 4. สร้าง API Service สำหรับ Agent Management (agentService.js)
  - ตำแหน่ง: `frontend/src/services/agentService.js`
  - ฟังก์ชัน: getAll, getById, create, update, toggleStatus, adjustCredit
  - รวม error handling

## Phase 3: Main Page & Features

- [ ] 5. สร้างหน้า AgentManagement.jsx พร้อม layout และ state management
  - ตำแหน่ง: `frontend/src/pages/master/AgentManagement.jsx`
  - State สำหรับ agents, loading, modals, selected agent
  - Layout พื้นฐาน

- [ ] 6. สร้าง Agent Table พร้อม pagination และ search/filter
  - แสดงข้อมูล: Username, Name, Credit, Balance, Status, Created Date
  - Actions: Edit, Adjust Credit, Toggle Status
  - Search by name/username
  - Filter by status

- [ ] 7. สร้าง Create Agent Modal พร้อม form validation
  - ฟอร์ม: username, name, password, credit
  - Validation: required fields, password min 6 chars
  - แสดง Master credit ที่เหลือ

- [ ] 8. สร้าง Edit Agent Modal พร้อม form validation
  - ฟอร์ม: name (commission_rate ยังไม่ใช้)
  - Pre-fill ข้อมูลเดิม

- [ ] 9. สร้าง Adjust Credit Modal พร้อมแสดงยอดเครดิต Master
  - ฟอร์ม: amount, action (add/deduct)
  - แสดง Master credit ปัจจุบัน
  - แสดง Agent credit ปัจจุบัน
  - Validation: amount > 0, เช็คเครดิตเพียงพอ

- [ ] 10. สร้าง Toggle Status Confirmation Dialog
  - แสดงข้อความยืนยัน
  - แสดงสถานะที่จะเปลี่ยน (active/suspended)

## Phase 4: Integration

- [ ] 11. เพิ่ม route /master/agents ใน App.jsx
  - เพิ่ม route สำหรับหน้า AgentManagement
  - ใช้ PrivateRoute wrapper
  - เฉพาะ role: master

- [ ] 12. เพิ่มเมนู 'จัดการเอเย่นต์' ใน Sidebar สำหรับ Master
  - เพิ่มในส่วนของ Master menu
  - Icon และข้อความเหมาะสม

- [ ] 13. สร้าง utility function สำหรับ format ตัวเลข (formatCurrency)
  - ตำแหน่ง: `frontend/src/lib/utils.js`
  - Format: 10,000.00 (คอมม่า + 2 ทศนิยม)

## Phase 5: Testing

- [ ] 14. ทดสอบการทำงานของทุกฟีเจอร์ (CRUD, search, pagination)
  - ทดสอบ Create Agent
  - ทดสอบ Edit Agent
  - ทดสอบ Adjust Credit (add/deduct)
  - ทดสอบ Toggle Status
  - ทดสอบ Search/Filter
  - ทดสอบ Pagination

---

**หมายเหตุ:**
- ✅ = เสร็จแล้ว
- ⏳ = กำลังทำ
- [ ] = ยังไม่ได้ทำ

**เริ่มทำเมื่อ:** 2025-11-05
**อัพเดทล่าสุด:** 2025-11-05
