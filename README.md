# 📦 Inventory & Order Management System

A premium, modern full-stack web application designed to manage products, customers, and orders efficiently. Powered by a high-performance backend and a sleek, glassmorphic dark-mode frontend.

## 🔗 Live Demo

| Service | Link |
| :--- | :--- |
| 🌐 **Frontend (Vercel)** | [inventory-order-management-system-three-ecru.vercel.app](https://inventory-order-management-system-three-ecru.vercel.app) |
| ⚙️ **Backend API (Render)** | [inventory-backend-latest-8t57.onrender.com](https://inventory-backend-latest-8t57.onrender.com) |

---

## ✨ Features

- 📊 **Dynamic Dashboard** — Real-time analytics tracking total revenue, items, clients, transaction volumes, and critical low-stock alerts.
- 📦 **Product Directory** — Complete control over inventory listings, detailing SKUs, pricing, and stock levels.
- 👥 **Customer Directory** — Clean registry for customer contact information and profile records.
- 🛒 **Multi-Item Checkout** — Create orders with multiple product selections, real-time quantity modifiers, and inline subtotal updates.
- ⚙️ **Automated Stock Controls** — Real-time validations block checkouts that exceed stock limits. Status transitions (Delivered, Pending) automatically adjust counts, and cancellations instantly restore stock.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | `FastAPI (Python 3.12)` | High-performance, compile-safe modern web API. |
| **Frontend** | `React (Vite)` | Fast component rendering and hot-module reloading. |
| **Database** | `PostgreSQL (SQLAlchemy)` | Relational transactional database utilizing raw ORM mapper. |
| **Styling** | `Vanilla CSS` | Sleek custom-tailored layout using HSL gradients & dark mode. |
| **Containers**| `Docker & Compose` | Instant multi-service local stack runner. |

---

## 📂 Project Structure

```bash
Inventory-Order-Management-System/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── config.py             # Configuration & CORS settings
│   │   ├── database.py           # DB connection & session factory
│   │   ├── crud.py               # SQL queries & business rules
│   │   ├── models.py             # SQLAlchemy schemas
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   └── main.py               # API Router endpoints
│   ├── Dockerfile                # Container instructions
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Sidebar navigation framework
│   │   │   ├── Dashboard.jsx     # Stats grids & charts
│   │   │   ├── Products.jsx      # Inventory lists & controls
│   │   │   ├── Customers.jsx     # Client records
│   │   │   └── Orders.jsx        # Shopping carts & transaction lists
│   │   ├── api.js                # Async client fetch handlers
│   │   ├── App.jsx               # Router & state manager
│   │   ├── index.css             # Tailored styling & variables
│   │   └── main.jsx              # React app mount
│   ├── Dockerfile                # Frontend builder
│   └── package.json              # NPM manifest
├── docker-compose.yml            # Multi-container local orchestra
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed & running (Optional: Python 3.12 & Node.js if running directly on host).

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/roshanGxH/Inventory-Order-Management-System.git
cd Inventory-Order-Management-System
```

### 2. Environment Variables

Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DB_USER` | PostgreSQL admin username | `postgres` |
| `DB_PASSWORD` | PostgreSQL admin password | `postgres` |
| `DB_NAME` | Initial database name | `inventory_db` |
| `VITE_API_URL` | API target endpoint for the client | `http://localhost:8000` |
| `CORS_ORIGINS` | Allowed CORS domains (supports `*` wildcard) | `*` |

---

## 💻 Running the App

### Method A: Using Docker (Recommended)
Build and spin up the backend, frontend, and local database services in a single step:

```bash
docker compose up --build
```
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Method B: Manual Local Startup

> [!TIP]
> Ensure you copy the `.env` file into both `backend/` and `frontend/` if running manually outside Docker.

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# PowerShell (Windows):
.\venv\Scripts\Activate.ps1
# Bash (Linux/macOS):
source venv/bin/activate

python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### 2. Frontend Setup
```bash
cd frontend
pnpm install  # or npm install
pnpm dev      # or npm run dev
```

---

## 📡 API Reference

All error responses return the following body shape:
```json
{ "detail": "error message" }
```

### Endpoints Overview

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/health` | Check API system status |
| `GET` | `/dashboard/stats` | Retrieve dashboard stats & recent order summaries |
| `GET` | `/products` | List all inventory products (paginated) |
| `POST` | `/products` | Add a new product to inventory |
| `PUT` | `/products/{id}` | Update product information (SKU, price, stock) |
| `DELETE`| `/products/{id}` | Delete a product from inventory |
| `GET` | `/customers` | List all registered customers |
| `POST` | `/customers` | Register a new customer profile |
| `DELETE`| `/customers/{id}` | Delete customer (automatically cancels their orders) |
| `GET` | `/orders` | List order history records |
| `POST` | `/orders` | Place a checkout order (validates & adjusts stock) |
| `PATCH` | `/orders/{id}/status`| Update status (Pending, Delivered, Cancelled) |
| `DELETE`| `/orders/{id}` | Delete order (automatically restores product stock) |

### Request/Response Payload Samples

#### `POST /products`
```json
// Request Body
{
  "name": "Neck Band Bluetooth",
  "sku": "BT-NB-113",
  "price": 500.00,
  "quantity": 500
}
```

#### `POST /orders`
```json
// Request Body
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 2,
      "quantity": 3
    }
  ]
}
```

#### `PATCH /orders/{id}/status`
```json
// Request Body
{
  "status": "Cancelled"
}
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
