# Time Management Coach - Backend

A robust backend service for the **Time Management Coach** application, built with modern web technologies to help users manage their tasks, track focus sessions, and improve productivity.

## 🚀 Features

- ✅ **Google Sign-In Authentication** (JWT-based)
- ✅ **Task Management** (Full CRUD operations)
- ✅ **Quick Tasks** logging for unplanned interruptions
- ✅ **Focus Mode** sessions tracking with analytics
- ✅ **Priority Tags Editor** for advanced task classification

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Server runtime environment |
| **Express.js** | Web application framework |
| **Prisma ORM** | Database management and migrations |
| **MariaDB** | Primary database |
| **JWT** | Authentication and authorization |
| **bcryptjs** | Password hashing |
| **Google OAuth2** | authentication |

## ⚡ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Gurunath-S/Time-Management-Coach-backend.git

cd Time-Management-Coach-backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/time_management_db"
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
# Server Configuration
PORT=5000
```

### 4️⃣ Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push
# Or
npx prisma migrate dev
```

### 5️⃣ Start Commands
```bash
# Frontend
npm run dev
```
```bash
# Backend
npm start
```

The server will be running at `http://localhost:5000`
