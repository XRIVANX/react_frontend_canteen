<div align="center">
  <table>
    <tr>
      <td align="center" width="300">
        <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="250">
      </td>
      <td align="center" width="100">
        <h1 style="font-size: 4rem; color: #ff2d20; margin: 0;">✕</h1>
      </td>
      <td align="center" width="250">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="180">
      </td>
    </tr>
  </table>
  
  <p>
    <img src="https://img.shields.io/badge/tests-passing-brightgreen?style=flat-square">
    <img src="https://img.shields.io/badge/downloads-506M-blue?style=flat-square">
    <img src="https://img.shields.io/badge/packagist-v12.54.1-orange?style=flat-square">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square">
  </p>
</div>

## Laravel and React Project

🍽️ Canteen Management System
A full-stack web application for managing school/university canteen operations, built with Laravel 12 (backend API) and React 18 (frontend SPA). The system features role-based access for Admins, Cashiers, and Customers, real-time order processing, inventory tracking, and sales reporting.

### ✨ Features

## 👤 Authentication & Role Management
- Three user roles: Admin, Cashier, Customer
- Secure login with Laravel Sanctum (Bearer tokens)
- Role-based route protection
- Session management and logout functionality

## 📋 Menu Management
- CRUD operations for menu items
- Category management (Meals, Snacks, Beverages, Desserts, Combos)
- Real-time availability toggling
- Stock tracking with low stock alerts
- Image upload support

## 🛒 Order Processing
- Point-of-Sale (POS) interface for cashiers
- Real-time order queue with status updates
- Order status flow: Pending → Preparing → Ready → Completed
- Automatic inventory deduction upon order confirmation
- Customer order history tracking

## 📦 Inventory Management
- Real-time stock level tracking
- Low-stock warnings with visual indicators
- Inventory logs showing stock changes
- Bulk restock functionality

## 📊 Sales Dashboard & Reports
- Daily, weekly, and monthly sales reports
- Best-selling items analysis
- Category-wise sales breakdown
- Interactive charts using Recharts
- Date range filtering
- Export reports to CSV


## 🛠️ Technology Stack

### Frontend (React)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library with functional components and hooks |
| React DOM | 18.2.0 | DOM rendering |
| Vite | 4.x | Build tool and development server |
| React Router DOM | 6.20.1 | Navigation and routing |
| Axios | 1.6.2 | HTTP client for API requests |
| Tailwind CSS | 3.3.6 | Utility-first CSS framework |
| Heroicons | 2.0.18 | SVG icon library |
| React Hot Toast | 2.4.1 | Toast notifications |
| Recharts | 2.10.3 | Data visualization charts |
| date-fns | 2.30.0 | Date formatting |

### Backend (Laravel)

| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 12.54.1 | PHP framework for RESTful API |
| Laravel Sanctum | 4.3.1 | API authentication |
| MySQL | 8.0+ | Database |
| PHP | 8.4.12 | Programming language |


## 💻 System Requirements

### Backend Requirements
| Requirement | Minimum Version |
|-------------|-----------------|
| PHP | 8.1+ |
| Composer | Latest |
| MySQL | 5.7+ |
| PostgreSQL | 10.0+ |
| Laravel | 12.x |
| Node.js | 16+ |

### Frontend Requirements
| Requirement | Minimum Version |
|-------------|-----------------|
| Node.js | 16+ |
| npm | 8+ |
| yarn | 1.22+ |
| React | 18.2.0 |
| Vite | 4.x |

### Check Command

```bash
php --version
composer --version
node --version
npm --version
mysql --version
git --version
````
## 📦Step-by-Step Installation

### 🖥️ Backend Setup (Laravel 12 API)

```bash

# Create a project directory
mkdir canteen-system
cd canteen-system

# Clone the backend repository
git clone <your-repository-url> canteen-backend
cd canteen-backend

```
## 🖥️Install PHP Dependencies
```
composer install
```
## Configure Environment
```
# Copy environment template
cp .env.example .env

# Generate application key
php artisan key:generate
```

## Database Configuration

```
# Using Laragon (Windows)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=

# Using XAMPP
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=

# Using MAMP
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=8889
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=root

```
## Create Database
```
# Connect to MySQL
mysql -u root -p

# Create database (if not exists)
CREATE DATABASE canteen_db;
EXIT;
```

## Run Migrations and Seeders
```
# Run all migrations
php artisan migrate

# Run seeders to populate data
php artisan db:seed
```

## Install and Configure Sanctum
```
# Install Sanctum
composer require laravel/sanctum

# Publish Sanctum migrations
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Run Sanctum migrations
php artisan migrate
```
## Configure CORS Edit: config/cors.php

```
<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',  // Vite default
        'http://localhost:5185',   // Your React app
        'http://127.0.0.1:5185',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Configure Middleware Edit: bootstrap/app.php
```
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
    ]);
})
```
## Test Backend Installation
```
# Start the Laravel development server
php artisan serve

# In another terminal, test the API
curl http://localhost:8000/api/test-auth
# Should return 401 Unauthorized (this is good - means API is working)
```

## 🎨 Frontend Setup (React + Vite)

## Navigate to Frontend Directory 
```
# From the canteen-system folder
cd canteen-frontend
```
## Install NPM Dependencies
```
npm install
```
## This installs all dependencies from package.json:

```
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "@heroicons/react": "^2.0.18",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^4.5.0"
  }
}
```
## Configure Environment
```
cp .env.example .env
```
## Edit: .env
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Canteen Management System"
```

## Configure Tailwind CSS Create/update: tailwind.config.js
```
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

## Configure PostCSS Create/update: postcss.config.js
```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
## Create API Service Create: src/Services/api.js
```
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## 🚀 Running the Complete Application

### Terminal 1: Start Backend Server
```
cd canteen-backend
php artisan serve
```
### Terminal 2: Start Frontend Server
```
cd canteen-frontend
npm run dev
```

## Access the Application
- Frontend: http://localhost:5185
- Backend API: http://localhost:8000/api

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@canteen.com` | `password` |
| **Cashier 1** | `cashier1@canteen.com` | `password` |
| **Cashier 2** | `cashier2@canteen.com` | `password` |
| **Customer 1** | `customer1@canteen.com` | `password` |
| **Customer 2** | `customer2@canteen.com` | `password` |
| **Customer 3** | `customer3@canteen.com` | `password` |
| **Customer 4** | `customer4@canteen.com` | `password` |
| **Customer 5** | `customer5@canteen.com` | `password` |
## 🎉 Success!
## You should now have:

- ✅ Laravel 12 backend running on http://localhost:8000

- ✅ React + Vite frontend running on http://localhost:5185

- ✅ Database with seeded data

- ✅ All 40+ API endpoints working

- ✅ Role-based authentication

- ✅ Full POS functionality

## Next Steps:

- Login as different roles to test permissions

- Create orders as cashier

- View reports as admin

- Check order history as customer

- Customize menu items


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
