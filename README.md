# Employee Leave Management System (ELMS)

A complete, full-stack company internal HR portal for leave application, calendar scheduling, policy configuration, and manager approvals.

This application is built with **React (Vite)** + **Tailwind CSS** for the frontend, **Node.js** + **Express.js** for the backend, **MongoDB** with **Mongoose** for database persistence, and **JWT** for secure, role-based session authentication.

---

## 🌟 Key Features

### 🔐 Authentication & Session Control
- Register, login, and sign-out controls.
- Role-Based Access Control (RBAC) supporting **Employee**, **Manager**, and **Admin** actions.
- Secured route guards on the frontend and token verification middlewares on the backend.
- Dummy password recovery workflow and secure self-password update inside profiles.

### 🧑‍💼 Employee Portal
- **Dashboard**: Personal metrics showing leave balances for each category, count of approved/pending/rejected requests, and a list of recent activities.
- **Apply for Leave**: Dynamic request form that auto-calculates durations excluding Saturdays/Sundays, selects half-day durations (0.5 days), uploads medical certificates or documents, and flags emergency requests.
- **Leave History**: Comprehensive historical view of all submissions with options to cancel pending or approved requests (cancelling approved leaves automatically refunds the balance!).
- **Company Calendar**: Interactive grid highlighting general company holidays and approved/pending leaves.

### 👨‍💼 Manager Portal
- **Team Approvals Dashboard**: List of pending leave requests from direct reports.
- **Review System**: Approve or reject requests with custom comments/feedback. Approvals automatically deduct the days from the employee's respective balance.
- **Auditing**: Search requests by employee name, status, or leave type.

### 👑 Admin Operations Panel
- **Employee Management**: Create, edit, and deactivate employee profiles. Manually adjust individual category leave balances.
- **Department Configurator**: Create departments and assign supervising heads.
- **Holiday Scheduler**: Configure company-wide paid holidays.
- **Analytics Charts**: Rich visualizations using **Recharts**:
  - *Line Chart*: Monthly approved leave trends for the current year.
  - *Pie Chart*: Employee size distribution by department.
  - *Bar Chart*: Request count distribution by status.
- **Audit Logs**: Central list of all company requests with filters.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (Vite), Tailwind CSS, React Router, Axios, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer
- **Database**: MongoDB + Mongoose

---

## 📂 Project Directory Structure

```text
/
├── backend/
│   ├── config/             # Database client connection configuration (db.js)
│   ├── controllers/        # REST controllers (auth, user, leave, manager, admin)
│   ├── middleware/         # Security guards, file uploads (Multer)
│   ├── models/             # Mongoose Schemas (User, LeaveRequest, Department, Holiday, Notification)
│   ├── routes/             # Express API Endpoints
│   ├── uploads/            # Location for uploaded profile pictures and certificates
│   ├── seed.js             # Comprehensive dataset seed script
│   └── server.js           # Server startup script
│
└── frontend/
    ├── src/
    │   ├── components/     # Route guards, UI elements
    │   ├── context/        # React context providers (AuthContext, NotificationContext)
    │   ├── layouts/        # Dashboard frame layout, Authentication layout
    │   ├── pages/          # Dashboards (Employee, Manager, Admin), Forms, History, Profiles, Admin views
    │   ├── services/       # Axios API client setup (api.js)
    │   ├── index.css       # Tailwind entry and utility styling classes
    │   └── main.jsx        # App mounting entry point
    └── tailwind.config.js
```

---

## ⚙️ Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Database Seeding & Server Setup
Open a terminal in the `/backend` folder:
```bash
cd backend
npm install
```

Start the MongoDB seeding script to pre-populate dummy Admins, Managers, Employees, Departments, Holidays, and active requests:
```bash
npm run seed
```

Start the backend API server (runs on `http://localhost:5000`):
```bash
npm run dev
```

### 2. Frontend Portal Setup
Open a second terminal in the `/frontend` folder:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open your browser and navigate to the local dev URL (typically `http://localhost:5173`).

---

## 🔑 Demo Access Accounts

Use these pre-configured user logins to explore the portal features:

| Role | Email | Password | Supervisor Reports |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` | HR Department Manager |
| **Manager** | `manager1@company.com` | `manager123` | Engineering Manager (Direct supervisor to employee1 and employee2) |
| **Manager** | `manager2@company.com` | `manager123` | Sales Manager (Direct supervisor to employee3 and employee4) |
| **Employee** | `employee1@company.com` | `employee123` | Senior Developer (Reports to John Doe / manager1) |
| **Employee** | `employee2@company.com` | `employee123` | Frontend Engineer (Reports to John Doe / manager1) |
| **Employee** | `employee3@company.com` | `employee123` | Account Executive (Reports to Jane Smith / manager2) |
| **Employee** | `employee4@company.com` | `employee123` | Sales Representative (Reports to Jane Smith / manager2) |

*All passwords are encrypted with bcrypt inside the MongoDB database.*
