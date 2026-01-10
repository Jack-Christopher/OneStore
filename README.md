# 🏪 OneStore

> A comprehensive, multi-tenant inventory and sales management system built with the MERN stack

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

OneStore is a full-featured, enterprise-grade inventory and sales management system designed for businesses of all sizes. It provides comprehensive tools for managing products, sales, purchases, warehouses, customers, suppliers, and financial operations with a modern, intuitive interface.

## ✨ Features

### 📦 Core Inventory Management
- **Product Management**: Complete product catalog with categories, units of measure, and formulas
- **Multi-Warehouse Support**: Manage inventory across multiple warehouses with real-time stock tracking
- **Stock Movements**: Track all inventory movements including transfers, adjustments, and movements
- **Product Formulas**: Define complex product formulas for manufacturing and assembly operations
- **Stock Adjustments**: Record and manage inventory adjustments with detailed audit trails

### 💰 Sales & Billing
- **Sales Management**: Create and manage sales orders, tickets, and notes
- **Billing System**: Generate invoices, proformas, credit notes, and debit notes
- **Customer Management**: Comprehensive customer database with purchase history
- **Sales Analytics**: Track sales performance with detailed statistics and reports

### 🛒 Purchase Management
- **Purchase Orders**: Create and manage purchase orders from suppliers
- **Supplier Management**: Maintain supplier database with contact information and history
- **Purchase Tracking**: Monitor purchase orders from creation to fulfillment

### 📊 Analytics & Reporting
- **Dashboard**: Real-time overview of key business metrics
- **Statistics**: Comprehensive analytics for sales, inventory, and financial performance
- **Reports**: Generate detailed reports for various business operations
- **Audit Logs**: Complete audit trail of all system activities

### 👥 Multi-Tenant Architecture
- **Tenant Management**: Support for multiple organizations (tenants) in a single system
- **Role-Based Access Control**: Admin, Manager, and Clerk roles with appropriate permissions
- **User Management**: Hierarchical user management (Admin → Manager → Clerk)
- **Session Management**: Secure session handling with JWT authentication

### 🔄 Data Management
- **Import/Export**: Import and export data in CSV and JSON formats
- **Bulk Operations**: Perform bulk operations on products, sales, and other entities
- **Data Migration**: Database migration system for schema updates

### ⚙️ Configuration & Settings
- **Tenant Settings**: Customizable settings per tenant
- **Base Currency**: Multi-currency support with base currency configuration
- **Theme Support**: Light and dark theme modes
- **Profile Management**: User profile management with preferences

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **MSW** - API mocking for development

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **CSV Parse/Stringify** - CSV processing
- **XLSX** - Excel file processing
- **Migrate-Mongo** - Database migrations
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server (production frontend)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized deployment)
- **MongoDB** (if running without Docker)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/onestore.git
cd onestore

# Start all services (development mode)
docker-compose -f docker-compose.dev.yml up --build

# Or start production services
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:5173 (dev) or http://localhost:5173 (prod)
- **Backend API**: http://localhost:4000
- **MongoDB**: localhost:27017

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # Create .env file with your configuration

# Run database migrations
npm run migrate:up

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # Create .env file with your configuration

# Start development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/onestore
JWT_SECRET=your-secret-key-here
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
```

### Database Migrations

The backend uses `migrate-mongo` for database migrations:

```bash
# Create a new migration
npm run migrate:create

# Run pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down
```

## 📁 Project Structure

```
onestore/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── app.ts          # Express app configuration
│   │   ├── server.ts        # Server entry point
│   │   ├── config/         # Configuration files
│   │   │   ├── db.ts       # Database connection
│   │   │   ├── env.ts      # Environment variables
│   │   │   └── logger.ts   # Logging configuration
│   │   ├── database/
│   │   │   ├── models/     # Mongoose models
│   │   │   └── migrations/ # Database migrations
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── admin/      # Admin operations
│   │   │   ├── products/   # Product management
│   │   │   ├── sales/      # Sales management
│   │   │   ├── billing/    # Billing operations
│   │   │   ├── warehouses/ # Warehouse management
│   │   │   ├── stats/      # Statistics and analytics
│   │   │   └── ...         # Other modules
│   │   └── shared/         # Shared utilities
│   │       ├── middlewares/
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   ├── scripts/            # Utility scripts
│   ├── uploads/            # File uploads directory
│   └── package.json
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route configuration
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Root component
│   ├── public/             # Static assets
│   └── package.json
│
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── README.md
```

## 🔌 API Overview

The backend provides a RESTful API with the following main endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `GET /api/sales/:id` - Get sale details
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Warehouses
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `GET /api/warehouseProducts` - Get warehouse inventory

### Statistics
- `GET /api/stats/*` - Various statistics endpoints

### Import/Export
- `POST /api/imports` - Import data
- `GET /api/exports` - Export data

*For complete API documentation, refer to the API routes in `backend/src/app.ts`*

## 👨‍💻 Development

### Running in Development Mode

```bash
# Backend (with hot reload)
cd backend
npm run dev

# Frontend (with hot reload)
cd frontend
npm run dev
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Output will be in frontend/dist/
```

### Code Style

The project uses:
- **ESLint** for code linting
- **TypeScript** for type checking
- **Prettier** (if configured) for code formatting

Run linting:
```bash
cd frontend
npm run lint
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts:
- Frontend dev server with hot reload
- Backend API with hot reload
- MongoDB database

### Production

#### Quick Start

```bash
docker-compose up -d --build
```

This builds and starts production containers:
- Frontend served via Nginx
- Backend API
- MongoDB database

#### Automated Deployment Script

For production deployments, use the provided deployment script which handles:
- ✅ Git pull with version tracking
- ✅ Docker image rebuild
- ✅ Database migrations
- ✅ Health checks for all services
- ✅ Automatic rollback on failure
- ✅ Logging and error handling

**Usage:**

```bash
# Make sure the script is executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

**What the script does:**

1. **Validates prerequisites** - Checks for Docker, Docker Compose, Git, and required files
2. **Validates environment** - Verifies required environment variables are set
3. **Saves current version** - Stores current commit for potential rollback
4. **Pulls latest code** - Fetches and merges latest changes from repository
5. **Backs up current state** - Creates backup of current Docker images
6. **Stops containers** - Gracefully stops running containers
7. **Rebuilds containers** - Builds new Docker images from latest code
8. **Starts containers** - Starts all services with new images
9. **Runs migrations** - Executes pending database migrations
10. **Health checks** - Verifies all services are healthy and accessible
11. **Cleanup** - Removes old unused Docker images
12. **Shows status** - Displays container status and recent logs

**Environment Variables Required:**

The script will check for these required environment variables in your `.env` file:
- `JWT_SECRET` - Secret key for JWT tokens
- `MONGO_INITDB_ROOT_PASSWORD` - MongoDB root password
- `VITE_API_URL` - Frontend API URL (recommended)
- `BACKEND_PORT` - Backend port (default: 4000)
- `FRONTEND_PORT` - Frontend port (default: 80)

**Manual Deployment Steps:**

If you prefer to deploy manually:

```bash
# 1. Pull latest code
git pull origin main  # or your branch

# 2. Rebuild and restart containers
docker-compose -f docker-compose.yml up -d --build

# 3. Run database migrations
docker exec -it onestore_api npm run migrate:up

# 4. Verify containers are running
docker-compose -f docker-compose.yml ps

# 5. Check logs if needed
docker-compose -f docker-compose.yml logs -f
```

## 🧪 Testing

*Testing setup to be added*

## 📝 Database Models

The system includes the following main models:

- **User** - System users (Admin, Manager, Clerk)
- **Tenant** - Multi-tenant organizations
- **Product** - Product catalog
- **Category** - Product categories
- **UnitOfMeasure** - Measurement units
- **ProductFormula** - Product formulas
- **Warehouse** - Warehouse locations
- **WarehouseProduct** - Inventory per warehouse
- **StockMovement** - Inventory movements
- **StockAdjustment** - Inventory adjustments
- **Transfer** - Inter-warehouse transfers
- **Sale** - Sales transactions
- **SaleItem** - Sale line items
- **PurchaseOrder** - Purchase orders
- **Customer** - Customer database
- **Supplier** - Supplier database
- **Invoice** - Invoices
- **CreditNote** - Credit notes
- **DebitNote** - Debit notes
- **Proforma** - Proforma invoices
- **AuditLog** - System audit trail
- **Session** - User sessions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization
- Audit logging for all operations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Ensure code passes linting
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by enterprise inventory management systems
- Community-driven development

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Made with ❤️ for efficient inventory and sales management**
