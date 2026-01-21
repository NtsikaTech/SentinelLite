<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# SentinelLite SIEM Dashboard

A modern Security Information and Event Management (SIEM) system with React frontend and Python Flask backend.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)](https://flask.palletsprojects.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)

</div>

---

## 🚀 Features

- **📊 Real-time Dashboard** - Security posture overview with live statistics and traffic visualization
- **📋 Log Analysis** - Browse, search, filter, and review security logs from multiple sources (SSH, Web, Auth, System)
- **🚨 Threat Center** - Manage security alerts with severity levels and status tracking
- **⚙️ Settings** - Configure MFA, IP whitelisting, session timeout, and data retention
- **🔐 Authentication** - Secure login portal with session management

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
2. **Python** (v3.10 or higher) - [Download Python](https://www.python.org/downloads/)
   - ⚠️ During Python installation, **check "Add Python to PATH"**

## 🛠️ Installation

### Option 1: Quick Start (Windows)

1. Double-click `start-all.bat` to launch both servers automatically

### Option 2: Manual Setup

**Backend (Python Flask):**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend (React + Vite):**

```bash
npm install
npm run dev
```

## 🖥️ Access the Application

| Service | URL |
|---------|-----|
| **Frontend Dashboard** | http://localhost:3000 |
| **Backend API** | http://localhost:5000 |
| **API Health Check** | http://localhost:5000/api/health |

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@sentinel.lite` | `sentinel2025` | Admin |
| `analyst@sentinel.lite` | `analyst2025` | Analyst |

## 📁 Project Structure

```
sentinellite-siem-dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── components/
│   ├── Dashboard.tsx       # Main dashboard view
│   ├── Layout.tsx          # App layout with sidebar
│   ├── LogAnalysis.tsx     # Log browser and search
│   ├── Login.tsx           # Authentication page
│   ├── Settings.tsx        # Configuration panel
│   ├── Support.tsx         # Help and system health
│   └── ThreatCenter.tsx    # Alert management
├── services/
│   └── api.ts              # Frontend API client
├── App.tsx                 # Main React component
├── types.ts                # TypeScript definitions
├── vite.config.ts          # Vite configuration
├── package.json            # NPM dependencies
├── start-backend.bat       # Backend startup script
├── start-frontend.bat      # Frontend startup script
└── start-all.bat           # Full stack startup
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get security statistics |

### Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Get paginated logs |
| PATCH | `/api/logs/:id` | Update log entry |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts |
| POST | `/api/alerts` | Create new alert |
| PATCH | `/api/alerts/:id` | Update alert status |

## 🔒 Security Features

- **Multi-Factor Authentication** (MFA) support
- **IP Whitelisting** for dashboard access
- **Session Timeout** configuration
- **Token-based Authentication** with secure session management
- **CORS Protection** with Flask-CORS

## 🎨 Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons

**Backend:**
- Python 3 with Flask
- Flask-CORS for cross-origin requests
- RESTful API design

## 📝 License

This project is for educational and demonstration purposes.

---

<div align="center">
<p>Powered by SentinelCore v4.2.0 • Encryption: AES-256</p>
</div>
