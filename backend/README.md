# Ethereal Treasure Market - Backend API

A comprehensive backend system for managing products, inventory, and e-commerce operations for the Ethereal Treasure Market.

## 🚀 Features

### Product Management
- ✅ **CRUD Operations** - Create, Read, Update, Delete products
- ✅ **Product Images** - Multiple image support with primary image selection
- ✅ **Product Specifications** - Flexible key-value specifications
- ✅ **Categories & Tags** - Organize products with categories and tags
- ✅ **Search & Filtering** - Search by name, description, category
- ✅ **Pagination** - Efficient data loading with pagination

### Inventory Management
- ✅ **Stock Tracking** - Real-time inventory tracking
- ✅ **Low Stock Alerts** - Automatic low stock notifications
- ✅ **Inventory Adjustments** - Add/subtract stock with reasons
- ✅ **Reorder Levels** - Set minimum stock levels
- ✅ **Inventory Reports** - Comprehensive inventory reporting

### File Management
- ✅ **Image Uploads** - Single and multiple image uploads
- ✅ **File Validation** - Type and size validation
- ✅ **File Management** - List and delete uploaded files
- ✅ **Secure Storage** - Organized file storage system

### Authentication & Security
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-based Access** - Admin and manager roles
- ✅ **Password Security** - Bcrypt password hashing
- ✅ **Rate Limiting** - API rate limiting protection
- ✅ **CORS Protection** - Cross-origin request security

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy the `.env` file and update values as needed:
```bash
# The .env file is already configured with defaults
# Update JWT_SECRET and other sensitive values for production
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Seed Sample Data (Optional)
```bash
npm run seed
```

### 5. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@etherealtreasure.com",
  "password": "admin123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=Crystals&search=amethyst
```

#### Get Single Product
```http
GET /api/products/amethyst-cluster
```

#### Create Product
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "NEW-001",
  "name": "New Product",
  "description": "Product description",
  "price": 1999,
  "original_price": 2499,
  "category": "Crystals",
  "tags": "crystal,healing",
  "status": "active",
  "available_quantity": 10,
  "specifications": {
    "Weight": "100g",
    "Size": "5cm"
  },
  "images": [
    {
      "url": "/uploads/image.jpg",
      "alt_text": "Product image",
      "is_primary": true
    }
  ]
}
```

#### Update Product
```http
PUT /api/products/product-id
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "UPD-001",
  "name": "Updated Product",
  // ... other fields
}
```

#### Delete Product
```http
DELETE /api/products/product-id
Authorization: Bearer <token>
```

### Inventory Endpoints

#### Get All Inventory
```http
GET /api/inventory
Authorization: Bearer <token>
```

#### Get Low Stock Items
```http
GET /api/inventory?low_stock=true
Authorization: Bearer <token>
```

#### Update Inventory
```http
PUT /api/inventory/product-id
Authorization: Bearer <token>
Content-Type: application/json

{
  "available_quantity": 25,
  "reserved_quantity": 5,
  "reorder_level": 10
}
```

#### Adjust Inventory
```http
POST /api/inventory/product-id/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "adjustment": -5,
  "reason": "Sale completed"
}
```

### Upload Endpoints

#### Upload Single Image
```http
POST /api/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Upload Multiple Images
```http
POST /api/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: <files>
```

#### List Uploaded Files
```http
GET /api/upload/list
Authorization: Bearer <token>
```

#### Delete File
```http
DELETE /api/upload/filename.jpg
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### Products Table
- `id` - Unique product identifier
- `sku` - Stock Keeping Unit (unique)
- `name` - Product name
- `description` - Product description
- `price` - Current price
- `original_price` - Original/MSRP price
- `category` - Product category
- `tags` - Searchable tags
- `status` - active/inactive/draft

### Inventory Table
- `product_id` - Foreign key to products
- `available_quantity` - Available stock
- `reserved_quantity` - Reserved stock
- `reorder_level` - Minimum stock level

### Product Images Table
- `product_id` - Foreign key to products
- `image_url` - Image file path
- `alt_text` - Image alt text
- `is_primary` - Primary image flag
- `sort_order` - Display order

### Product Specifications Table
- `product_id` - Foreign key to products
- `spec_key` - Specification name
- `spec_value` - Specification value

## 🔐 Default Admin Credentials

**Email:** `admin@etherealtreasure.com`  
**Password:** `admin123`

⚠️ **Important:** Change the default password after first login!

## 🚀 Production Deployment

1. Update environment variables for production
2. Use a production database (PostgreSQL/MySQL)
3. Set up proper SSL certificates
4. Configure reverse proxy (Nginx)
5. Set up monitoring and logging
6. Enable database backups

## 📞 Support

For technical support or questions about the backend API, please refer to the API documentation or contact the development team.

## 🔄 Frontend Integration

This backend is designed to work with the Ethereal Treasure Market frontend. Update the frontend to use these API endpoints instead of static data:

1. Replace static product data with API calls
2. Implement admin dashboard for product management
3. Add inventory management interface
4. Integrate image upload functionality

The backend provides all the data and functionality needed for a complete e-commerce product management system.
