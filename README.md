# Enterprise URL Shortener

A full-stack URL shortening application with user authentication, analytics, and QR code generation.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Architecture](#project-architecture)

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens
- **URL Shortening**: Convert long URLs into short, shareable links
- **QR Code Generation**: Automatically generate QR codes for shortened URLs
- **Analytics**: Track clicks, referrers, and device information
- **User Dashboard**: Manage shortened URLs and view analytics
- **CORS Support**: Secure cross-origin requests
- **Password Security**: Bcrypt hashing for secure password storage

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2
- **Database**: MongoDB with Mongoose 9.5
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Security**: bcryptjs 3.0
- **URL Generation**: nanoid 5.1
- **QR Codes**: qrcode 1.5
- **HTTP Client**: axios 1.15
- **Utilities**: ua-parser-js, CORS, dotenv
- **Development**: Nodemon

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.14
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.8
- **HTTP Client**: axios 1.6
- **Build CSS**: PostCSS & Autoprefixer

## 📁 Project Structure

```
URLSHORTENER/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── server.js              # Server entry point
│   │   ├── controllers/           # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── urlController.js
│   │   │   └── redirectController.js
│   │   ├── routes/                # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── urlRoutes.js
│   │   │   └── redirectRoutes.js
│   │   ├── models/                # Database schemas
│   │   │   ├── User.js
│   │   │   ├── Url.js
│   │   │   └── Analytics.js
│   │   ├── middleware/            # Express middleware
│   │   │   └── authMiddleware.js
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   └── tmp_auth_test.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # React entry point
│   │   ├── index.css              # Global styles
│   │   ├── components/            # React components
│   │   │   └── AnalyticsChart.jsx
│   │   └── services/
│   │       └── ApiService.js      # API communication
│   ├── index.html                 # HTML template
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                # Deployment config
│   └── package.json
└── README.md
```

## 📦 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Git**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd URLSHORTENER
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

## 🔧 Environment Setup

### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/urlshortener
# Or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlshortener

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Optional: API Configuration
API_BASE_URL=http://localhost:5000
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Build

**Backend**
```bash
cd backend
npm start
```

**Frontend**
```bash
cd frontend
npm run build
npm run preview
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login

### URL Routes (`/api/urls`)
- `POST /create` - Create a new shortened URL
- `GET /` - Get all shortened URLs for authenticated user
- `GET /:shortCode` - Get URL details
- `DELETE /:shortCode` - Delete a shortened URL

### Redirect Routes (`/api/:shortCode`)
- `GET /:shortCode` - Redirect to original URL and track analytics

## 🏗️ Project Architecture

The application follows a **3-tier architecture**:

1. **Frontend Layer**: React-based SPA with Vite
   - Handles user interface and interactions
   - Manages client-side routing
   - Displays analytics charts

2. **API Layer**: Express.js REST API
   - Handles authentication and authorization
   - Manages URL creation and retrieval
   - Tracks analytics data

3. **Database Layer**: MongoDB
   - User data and authentication tokens
   - Shortened URL records
   - Analytics and tracking information

## 📝 Notes

- Make sure MongoDB is running before starting the backend
- JWT tokens are stored in cookies/localStorage on the frontend
- Short codes are generated using nanoid for uniqueness
- Analytics are tracked for each URL redirect
- QR codes are generated in the backend and served to frontend

## 📄 License

ISC

## 👤 Author

Your Name / Organization

---

For issues or questions, please open an issue in the repository.
