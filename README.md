# SQL Web Editor 🚀

Một ứng dụng web editor cho phép thực thi SQL queries với Monaco Editor (VS Code editor) và SQL Server database.

## ✨ Features

- 🎨 **Monaco Editor Integration** - Code editor với syntax highlighting cho SQL
- 💡 **SQL IntelliSense** - Auto-complete cho SQL keywords, functions, tables và columns
- 🔒 **Security** - Chỉ cho phép thực thi SELECT queries, chặn INSERT/UPDATE/DELETE
- 📊 **Result Display** - Hiển thị kết quả query dạng table với scrollbar
- 📚 **Swagger API Documentation** - API docs tự động với Swagger UI
- 🎯 **Real-time Execution** - Thực thi SQL queries real-time
- 🔍 **Error Handling** - Hiển thị lỗi SQL chi tiết và dễ hiểu

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Monaco Editor** - Code editor (VS Code engine)
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQL Server** - Database
- **node-sql-parser** - SQL validation
- **Swagger** - API documentation
- **dotenv** - Environment configuration

## 📋 Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** >= 16.x
- **npm** hoặc **yarn**
- **SQL Server** (hoặc SQL Server Express)
- **Git**

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/SQL_Web_Editor.git
cd SQL_Web_Editor
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Tạo file .env
cp .env.example .env
```

#### Cấu hình Database (.env)

Mở file `backend/.env` và cập nhật thông tin database:

```env
# Database Configuration
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=your_database_name
DB_ENCRYPT=false
DB_TRUST_CERT=true

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Server sẽ chạy tại: `http://localhost:5001`

API Documentation: `http://localhost:5001/api-docs`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác được hiển thị trong terminal)

## 📖 Usage Guide

### 1. Mở Ứng Dụng

Truy cập `http://localhost:5173` trong browser

### 2. Viết SQL Query

- Gõ SQL query trong editor
- Bật "Suggestions" để sử dụng auto-complete:
  - Nhấn `Ctrl + Space` để hiển thị suggestions
  - Gõ để lọc suggestions
  - Tab/Enter để chấp nhận

### 3. Thực Thi Query

- Click nút **Run** (hoặc icon Play ▶️)
- Kết quả sẽ hiển thị ở phần Output bên dưới

### 4. Xem Kết Quả

- Table với columns và rows
- Scroll để xem nhiều data
- Hover để highlight row

## 🔑 SQL Suggestions

Editor hỗ trợ auto-complete cho:

### Keywords
```sql
SELECT, FROM, WHERE, JOIN, ORDER BY, GROUP BY, HAVING, DISTINCT, etc.
```

### Functions
```sql
COUNT(), SUM(), AVG(), MIN(), MAX(), UPPER(), LOWER(), CONCAT(), etc.
```

### Snippets
- `SELECT *` - Template SELECT query
- `INSERT INTO` - Template INSERT query
- `UPDATE` - Template UPDATE query

## 🔒 Security Features

### SQL Injection Protection

Backend sử dụng `node-sql-parser` để parse và validate SQL:

```javascript
// Chỉ cho phép SELECT
if (statement.type !== 'select') {
  return res.status(403).json({
    error: 'Chỉ được phép thực thi câu lệnh SELECT'
  });
}
```

### Ví Dụ

 **Allowed:**
```sql
SELECT * FROM users;
SELECT id, name FROM products WHERE price > 100;
```

 **Blocked:**
```sql
INSERT INTO users VALUES (1, 'test');
UPDATE users SET name = 'hack';
DELETE FROM users;
DROP TABLE users;
```

## 📚 API Documentation

### Swagger UI

Truy cập: `http://localhost:5001/api-docs`

### Endpoints

#### Health Check
```http
GET /api/health
```

#### Execute SQL Query
```http
POST /api/query
Content-Type: application/json

{
  "query": "SELECT * FROM users"
}
```

**Response:**
```json
{
  "success": true,
  "columns": ["id", "username", "email"],
  "rows": [
    { "id": 1, "username": "user1", "email": "user1@example.com" }
  ],
  "rowCount": 1
}
```

## 📁 Project Structure

```
SQL_Web_Editor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── connect.js      # Database connection
│   │   │   └── swagger.js      # Swagger configuration
│   │   └── app.js              # Express app & routes
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License

## 📧 Contact

Pe - nguyenbatho2k5@gmail.com

Project Link: [https://github.com/nbatho/SQL_Web_Editor](https://github.com/nbatho/SQL_Web_Editor)