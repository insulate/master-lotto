# Lotto System - Frontend

ระบบหวยออนไลน์ Frontend แอปพลิเคชัน สร้างด้วย React + Vite + TailwindCSS

## 🎨 Features

- ⚡️ **Vite** - Fast build tool และ dev server
- ⚛️ **React 18** - Modern React with hooks
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 🎭 **Luxury Gold Theme** - ธีมสีทองหรูหรา
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ
- 🔄 **React Router** - Client-side routing
- 🔥 **React Hot Toast** - Beautiful notifications
- 🎯 **Lucide Icons** - Modern icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx          # Main layout with Header & Sidebar
│   ├── pages/
│   │   ├── master/
│   │   │   └── MasterDashboard.jsx # Master dashboard page
│   │   ├── agent/                  # Agent pages (future)
│   │   └── member/                 # Member pages (future)
│   ├── lib/
│   │   └── utils.js                # Utility functions
│   ├── theme/                      # Theme configuration
│   ├── assets/                     # Static assets
│   ├── App.jsx                     # Main App component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── public/                         # Static files
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
└── package.json                    # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ และ npm

### Installation

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

## 🎨 Color Theme

โปรเจคใช้ **Luxury Muted Gold Theme** ที่ออกแบบมาเพื่อความหรูหราและอ่านง่าย:

### Primary Colors
- Gold: `#DAA520`
- Light Gold: `#E6BE5A`
- Dark Gold: `#B8860B`
- Mustard: `#C4941F`

### Background Colors
- Dark: `#5D4037`
- Darker: `#3E2723`
- Cream: `#FFF9E6`
- Card: `#FFFFFF`

### Accent Colors
- Success: `#4CAF50`
- Error: `#E53935`
- Warning: `#FB8C00`
- Info: `#1E88E5`

## 📱 Responsive Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## 🔧 Scripts

- `npm run dev` - เริ่ม development server
- `npm run build` - Build สำหรับ production
- `npm run preview` - Preview production build
- `npm run lint` - ตรวจสอบ code quality

## 📝 License

Proprietary - All rights reserved
