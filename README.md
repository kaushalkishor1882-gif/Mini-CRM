# 🚀 Mini CRM - Full Stack Web Application

A **Mini Customer Relationship Management (CRM)** system built using the **MERN Stack (MongoDB, Express, React, Node.js)**.
This project helps manage leads, track their status, and organize follow-ups efficiently.

---

## 📌 Features

### 🔐 Authentication

* User Registration & Login
* Secure JWT-based authentication
* Protected API routes

---

### 📊 Lead Management

* Add new leads (Name, Email, Source)
* View all leads in dashboard
* Update lead status:

  * New
  * Contacted
  * Converted
* Delete leads

---

### 📝 Notes & Follow-ups

* Add notes for each lead
* Maintain notes history
* Track follow-up information

---

### 🔍 Search & Filter

* Search leads by name/email
* Filter leads by status
* Real-time data filtering

---

### 📄 Pagination

* Efficient handling of large data
* Navigate through pages (Next/Prev)

---

### 📊 Dashboard Analytics

* Total Leads
* Contacted Leads
* Converted Leads
* Conversion Rate

---

### 🎯 Additional Features

* Priority tagging (Low, Medium, High)
* Follow-up date tracking
* Responsive UI design

---

## 🛠️ Tech Stack

### Frontend:

* React (Vite)
* Axios
* CSS

### Backend:

* Node.js
* Express.js

### Database:

* MongoDB (Mongoose)

### Authentication:

* JWT (jsonwebtoken)
* bcryptjs

---

## 📁 Project Structure

```
Mini-CRM/
│
├── client/        # React Frontend
├── server/        # Node.js Backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔹 1. Clone Repository

```bash
git clone https://github.com/kaushalkishor1882-gif/Mini-CRM.git
cd Mini-CRM
```

---

### 🔹 2. Backend Setup

```bash
cd server
npm install
node index.js
```

---

### 🔹 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

### 🔹 4. Open in Browser

```
http://localhost:5173
```

---

## 🔐 API Endpoints

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user    |
| GET    | /api/leads         | Get all leads |
| POST   | /api/leads         | Create lead   |
| PUT    | /api/leads/:id     | Update lead   |
| DELETE | /api/leads/:id     | Delete lead   |

---

## 🧠 Learning Outcomes

* Full Stack Development (MERN)
* REST API Design
* Authentication & Security (JWT)
* State Management in React
* Database Design with MongoDB
* Real-world CRM logic implementation

---

## 🌐 Future Improvements

* Role-based access (Admin/User)
* Email notifications
* Export leads (CSV/Excel)
* Deployment (Vercel + Render)

---

## 👨‍💻 Author

**Kaushal Kishor**
GitHub: https://github.com/kaushalkishor1882-gif

---

## ⭐ Show Your Support

If you like this project, please ⭐ the repository!
