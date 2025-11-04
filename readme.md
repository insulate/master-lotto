# โครงสร้างโปรเจค Lotto System

## 📁 โครงสร้างโดยรวม

```
lotto/
├── frontend/                 # React + Vite Frontend Application
├── backend/                  # Node.js Express Backend API
├── CLAUDE.md                # คำแนะนำสำหรับ AI Assistant
```

---

## 🎨 Frontend Structure

```
frontend/
├── public/                   # Static assets
├── src/
│   ├── main.jsx             # Entry point ของ React App
│   ├── App.jsx              # Root component พร้อม React Router
│   │
│   ├── components/          # React Components แบบ Reusable
│   │   └── layout/
│   │       ├── Navbar.jsx             # Top navigation bar
│   │       └── Sidebar.jsx            # Side navigation menu
│   │
│   ├── pages/               # Page Components สำหรับแต่ละ Role
│   │   ├── master/          # หน้าสำหรับ Master (Admin)
│   │   │   └── MasterDashboard.jsx    # Dashboard แสดงภาพรวมระบบ
│   │   │
│   │   ├── agent/
│   │   │
│   │   └── member/
│   │
│   ├── theme/
│   │   └── theme.js         # Gold Luxury Theme + Responsive Breakpoints
│   │
│   └── assets/              # Images, fonts, etc.
│
├── dist/                     # Production build output (auto-generated)
├── package.json             # NPM dependencies และ scripts
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # Frontend documentation
```

### Frontend Technology Stack
- **React 19.1.1** - UI Library
- **Vite 7.1.7** - Build tool และ dev server
- **TailwindCSS** - Utility-first CSS framework

### Backend Technology Stack
- **ExpressGenerator** - Backend framework
- **MVC** - Model View Controller
- **Node.js** - Backend framework
- **Express 5.1.0** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management