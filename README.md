# Inventory & Order Management System

A premium, modern full-stack application built to manage products, customers, and orders efficiently. Built with FastAPI (Python 3.11), SQLAlchemy, PostgreSQL, and React (Vite). Supports interactive dashboard analytics, stock validations, and automatic inventory adjustments.

### 🌐 Live Deployments
- **Frontend App:** [https://inventory-order-management-system-git-main-roshangxhs-projects.vercel.app/](https://inventory-order-management-system-git-main-roshangxhs-projects.vercel.app/)
- **Backend API:** [https://inventory-backend-latest-8t57.onrender.com](https://inventory-backend-latest-8t57.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
  - [System](#system)
  - [Products](#products)
  - [Customers](#customers)
  - [Orders](#orders)
  - [Dashboard](#dashboard)
- [License](#license)

---

## Features

- **Dynamic Dashboard** — Real-time insights highlighting Total Revenue, Product Count, Customer Count, Total Orders, Stock Alerts, and Recent Orders.
- **Product Directory** — Create, view, update, and delete products with SKU, price, and real-time inventory levels.
- **Customer Directory** — Simple management of customer profiles (Name, Email, Phone).
- **Multi-Item Checkout** — Create orders with multiple products, automated subtotal calculations, and interactive quantity adjustment.
- **Automatic Stock Control** — Stock levels validate automatically during checkout. Order cancellation restores product stock automatically, while pending/delivered transitions manage deductions.
- **Responsive Modals & Steppers** — Modern UI dialog boxes with dark-mode elements, animations, and inline-flex numeric steppers.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Runtime    | Python 3.11 (Backend), Node.js (Frontend)|
| Framework  | FastAPI (Backend), React + Vite (Frontend)|
| Database   | PostgreSQL (SQLAlchemy ORM)             |
| Styling    | Vanilla CSS (Glassmorphism & HSL Colors)|
| Container  | Docker & Docker Compose                 |

---

## Project Structure

```
Inventory-Order-Management-System/
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── config.py             # App configurations & CORS handler
│   │   ├── crud.py               # DB queries & business logic
│   │   ├── database.py           # DB connection & session factory
│   │   ├── main.py               # FastAPI router endpoints
│   │   ├── models.py             # SQLAlchemy schemas
│   │   └── schemas.py            # Pydantic validation schemas
│   ├── Dockerfile                # Containerization setup
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React (Vite) Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Analytics stats & charts
│   │   │   ├── Products.jsx      # Product database controls
│   │   │   ├── Customers.jsx     # Customer contact directories
│   │   │   ├── Orders.jsx        # Order creation & checkout list
│   │   │   └── Layout.jsx        # Dashboard layout sidebar wrapper
│   │   ├── api.js                # Async client fetch routes
│   │   ├── App.jsx               # Navigation & Global Router state
│   │   ├── index.css             # Tailored styling & design tokens
│   │   └── main.jsx              # React app mounting point
│   ├── nginx.conf                # Nginx production configuration
│   ├── Vite.config.js            # Build configurations
│   ├── index.html                # App entrypoint HTML template
│   ├── Dockerfile                # Production Docker building
│   └── package.json              # NPM manifest
├── docker-compose.yml            # Multi-service local coordinator
├── .env.example                  # Environment configurations template
└── README.md                     # Documentation
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/roshanGxH/Inventory-Order-Management-System.git
cd Inventory-Order-Management-System
```

### Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

| Variable       | Description                                                          | Default Value |
|----------------|----------------------------------------------------------------------|---------------|
| `DB_USER`      | PostgreSQL database username                                         | `postgres`    |
| `DB_PASSWORD`  | PostgreSQL database password                                         | `postgres`    |
| `DB_NAME`      | Database name                                                        | `inventory_db`|
| `VITE_API_URL` | Frontend client target URL pointing to backend API                   | `http://localhost:8000` |
| `CORS_ORIGINS` | CORS allowed origins (comma-separated or JSON list, support `*` wildcard) | `*`           |

---

## Running the App

**Using Docker Compose** (spins up Frontend, Backend, and PostgreSQL database instantly):

```bash
# Build and start services
docker compose up --build
```

- **Frontend:** Access at [http://localhost:3000](http://localhost:3000)
- **Backend API:** Access at [http://localhost:8000](http://localhost:8000)
- **API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

**Stop Services:**

```bash
# Stop containers
docker compose down

# Stop containers and wipe local database volumes (fresh database start)
docker compose down -v
```

---

## API Reference

All error responses follow the shape:
```json
{ "detail": "error message" }
```

---

### System

#### `GET /health`
Verify API status.

**Response `200`:**
```json
{ "status": "healthy" }
```

---

### Products

#### `GET /products`
Retrieve all products. Supports skip/limit pagination.

#### `POST /products`
Create a new product.

**Body:**
```json
{
  "name": "Wireless Mouse",
  "sku": "WM-1234",
  "price": 29.99,
  "quantity": 100
}
```

#### `GET /products/:id`
Retrieve detailed info on a single product.

#### `PUT /products/:id`
Update an existing product's fields.

#### `DELETE /products/:id`
Delete a product.

---

### Customers

#### `GET /customers`
Retrieve all customers.

#### `POST /customers`
Create a new customer profile.

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

#### `DELETE /customers/:id`
Delete a customer.

---

### Orders

#### `GET /orders`
Retrieve all orders with status and total value.

#### `POST /orders`
Create a new order. Triggers inventory check and reduces stock.

**Body:**
```json
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

#### `PATCH /orders/:id/status`
Update status of an order. Changing status to `"Cancelled"` automatically restores product stock.

**Body:**
```json
{ "status": "Cancelled" }
```
Accepted values: `Pending`, `Delivered`, `Cancelled`

#### `DELETE /orders/:id`
Delete an order and automatically recover its inventory stock.

---

### Dashboard

#### `GET /dashboard/stats`
Retrieve stats data for dashboard analytics.

**Response `200`:**
```json
{
  "total_revenue": 89.97,
  "total_products": 25,
  "total_customers": 12,
  "total_orders": 8,
  "stock_alerts": 3,
  "recent_orders": [
    {
      "id": 1,
      "customer_name": "Jane Doe",
      "total_price": 89.97,
      "status": "Pending",
      "created_at": "2026-06-19T10:00:00"
    }
  ]
}
```
