# 🚀 Project Management Dashboard

A modern, full-stack Project Management Dashboard built with cutting-edge technologies. Manage projects, tasks, and team collaboration with an intuitive interface and powerful features.

## ✨ Live Demo

**Live Site:** [Coming Soon]  
**Backend API:** [Coming Soon]

## 🎯 Features

### 🎨 Core Functionality
- ✅ **Complete CRUD Operations** - Create, read, update, delete projects & tasks
- ✅ **4 View Types** - Board (Kanban), List, Table, and Timeline views
- ✅ **Priority System** - 5 levels (Urgent, High, Medium, Low, Backlog) with visual indicators
- ✅ **Drag & Drop** - Intuitive task management across status columns
- ✅ **Real-time Updates** - Instant UI synchronization with RTK Query

### 🎪 User Experience
- ✅ **Dark/Light Mode** - Full theme support with persistent preferences
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Advanced Navigation** - Collapsible sidebar with active state indicators
- ✅ **Search Functionality** - Quick project and task search
- ✅ **Clean UI/UX** - Professional interface with smooth animations

### 🔐 Authentication & Security
- ✅ **NextAuth.js** - Secure authentication with credentials
- ✅ **Session Management** - JWT-based sessions with 15-minute security
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Role-based Access** - Admin and user permission levels

### 🔧 Technical Excellence
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **State Management** - Redux Toolkit with RTK Query for optimal performance
- ✅ **Database Relations** - Proper PostgreSQL schema with Prisma ORM
- ✅ **API Excellence** - RESTful endpoints with proper error handling
- ✅ **Code Quality** - Clean, maintainable, and scalable architecture

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State Management:** Redux Toolkit + RTK Query
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React + Material-UI Icons
- **UI Components:** Radix UI + Custom components
- **Charts:** Recharts

### Backend
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Validation:** TypeScript runtime checks

### Deployment
- **Platform:** Vercel
- **Database:** Vercel Postgres
- **Environment:** Production-ready configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your database
npm run db:push

# Start development server
npm run dev