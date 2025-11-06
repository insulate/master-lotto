# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lottery management system with three-tier user hierarchy: **Master → Agent → Member**. Built with React frontend and Node.js/Express/MongoDB backend.

## Development Commands

### Backend (Port 3000)
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Development with nodemon
npm start            # Production mode
npm run seed         # Seed database with initial data
```

### Frontend (Port 5173)
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Development server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
```

### Environment Setup
Backend requires `.env` file with:
- `JWT_SECRET` and `JWT_REFRESH_SECRET`
- `MONGODB_URI` (MongoDB connection string)
- `PORT` (default: 3000)
- `CORS_ORIGIN` (default: *)

## Architecture

### User Hierarchy & Commission System

**Three-level hierarchy with strict commission rate validation:**
1. **Master**: Top-level admin, manages agents, sets commission rates (0-100%)
2. **Agent**: Manages members, commission rates must be ≤ Master's rates
3. **Member**: End users, commission rates must be ≤ Agent's rates

**Commission Rate Rules (enforced in backend controllers):**
- Downline rates must ALWAYS be ≤ Upline rates
- Each lottery type has separate rate configurations
- Six bet types per lottery: `three_top`, `three_tod`, `two_top`, `two_bottom`, `run_top`, `run_bottom`
- Validation happens at both backend (controllers) and frontend (real-time input validation with toast notifications)

**Key Files:**
- Backend validation: `backend/controllers/master/agent.controller.master.js` (Master→Agent)
- Backend validation: `backend/controllers/agent/member.controller.agent.js` (Agent→Member)
- Frontend UI: `frontend/src/pages/master/commission/AgentCommissionPage.jsx`
- Frontend UI: `frontend/src/pages/agent/commission/MemberCommissionPage.jsx`

### Backend Structure

**Role-based API routing pattern:**
```
/api/v1/auth/*                    # Authentication (all roles)
/api/v1/master/agents/*           # Master manages agents
/api/v1/master/lottery-types/*    # Master manages lottery types
/api/v1/master/lottery-draws/*    # Master manages draws
/api/v1/agent/members/*           # Agent manages members
/api/v1/agent/lottery-types/*     # Agent views lottery types
```

**Controllers organized by role:**
- `controllers/auth.controller.js` - Authentication for all roles
- `controllers/master/*.controller.master.js` - Master-specific operations
- `controllers/agent/*.controller.agent.js` - Agent-specific operations

**Authentication:**
- JWT-based with access tokens (15min) and refresh tokens (7 days)
- Middleware: `auth.middleware.js` verifies tokens and injects `req.user`
- Tokens stored in Zustand with localStorage persistence

**Database Models (MongoDB/Mongoose):**
- `User`: Stores username, role, parent_id, credit, balance, commission_rates array
- `LotteryType`: Lottery configurations with payout rates
- `LotteryDraw`: Draw schedules and results
- `CreditTransaction`: Credit transfer history

### Frontend Structure

**State Management:**
- **Zustand** with persistence for auth state (`store/authStore.js`)
- User data, tokens, and authentication status persisted to localStorage
- Initialize function checks token validity on app load

**Routing & Layouts:**
- Master/Member roles use `components/layout/Layout.jsx`
- Agent role uses dedicated `pages/agent/AgentLayout.jsx`
- Both layouts have sidebar with role-filtered menu items
- Change password menu located in bottom section near logout

**Services Pattern:**
- API calls organized in `services/` directory
- Each service wraps axios/httpClient with role-specific base paths
- Example: `services/agentService.js`, `services/memberService.js`

**Key UI Patterns:**
- React Hook Form for form validation
- React Hot Toast for notifications (success/error/loading)
- TailwindCSS with custom luxury gold theme
- Lucide React for icons
- Modal/table patterns for CRUD operations

### Theme System

**Custom color palette** defined in `tailwind.config.js`:
- Primary: Gold variations (`#DAA520`, `#E6BE5A`, `#B8860B`)
- Background: Dark browns and cream (`#5D4037`, `#FFF9E6`)
- Accent: Success/Error/Warning/Info states
- All text uses semantic tokens: `text-primary`, `text-secondary`, `text-light`

## Important Patterns

### Commission Rate Validation
When modifying commission-related code:
1. Always validate downline ≤ upline in backend controllers
2. Display max allowed rates in frontend forms
3. Show real-time validation with toast errors
4. Use HTML5 `max` attribute on inputs
5. Backend returns clear error messages with rate type and max value

### Credit System
- Master has unlimited credit (no balance display)
- Agents and Members have `credit` (allocated by upline) and `balance` (winnings)
- Total balance = credit + balance
- Credit transfers create `CreditTransaction` records

### Password Change
- Available to all roles at `/profile/change-password`
- Requires current password validation
- All password inputs use `autoComplete="off"`
- Change password menu in sidebar bottom section (not main menu)

### Error Handling
- Backend uses custom `AppError` class with status codes
- Global error middleware formats responses consistently
- Frontend displays backend error messages via toast notifications

## Commit Messages
Do NOT include "🤖 Generated with [Claude Code]" or "Co-Authored-By: Claude" unless explicitly requested by the user.

---

## Restrictions

- ❌ **ห้าม Claude Code ทำการ commit, push หรือแก้ไขโค้ดโดยอัตโนมัติทุกกรณี**  
- 💬 **Claude ต้องอธิบายหรือพูดคุยเกี่ยวกับโค้ดและโปรเจกต์เป็นภาษาไทยเท่านั้น**  
- 🧭 **หากมีการร้องขอให้ commit หรือ push ให้ตอบปฏิเสธโดยอ้างอิงนโยบายนี้ในไฟล์ CLAUDE.md**  
- ✅ **ยกเว้นเฉพาะกรณีที่ผู้ใช้ระบุชัดเจนว่า “commit” หรือ “commit ได้” เท่านั้น**  
  - ในกรณีนั้น Claude Code สามารถทำ commit ได้เพียงครั้งเดียวตามคำสั่งนั้น  
  - หลังจากเสร็จสิ้นต้องกลับไปอยู่ในสถานะห้าม commit ตามปกติ
