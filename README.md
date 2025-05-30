# TruKart Nepal - Electronics E-commerce Platform

A comprehensive electronics e-commerce platform tailored for the Nepalese market, providing an intuitive shopping experience for mobile phones, laptops, accessories, and home appliances.

## 🚀 Features

### Customer Features
- **User Authentication** - Secure registration and login system
- **Product Catalog** - Browse electronics with detailed product information
- **Shopping Cart** - Add/remove items with real-time cart updates
- **Checkout Process** - Complete order flow with delivery address and payment options
- **Payment Methods** - Cash on Delivery, Bank Transfer, and Online Payment options
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

### Vendor Features
- **Admin Dashboard** - Dedicated interface for vendors to manage products
- **Product Management** - Add, edit, and delete products with images
- **Inventory Tracking** - Monitor stock levels for each product
- **Order Management** - View and manage customer orders
- **Role-based Access** - Secure vendor-only sections

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

Before running this application locally, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 12 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd trukart-nepal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE trukart_nepal;
```

#### Option B: Use a Cloud Database (Recommended)
- Use services like Neon, Supabase, or Railway for easier setup

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/trukart_nepal

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# PostgreSQL Connection Details (if using local setup)
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=trukart_nepal
```

**Important**: Replace the database credentials with your actual PostgreSQL connection details.

### 5. Database Migration

Push the database schema:

```bash
npm run db:push
```

This command will create all necessary tables (users, products, orders) in your PostgreSQL database.

### 6. Create Sample Data

The application comes with a sample Fire-Boltt smartwatch product. To add more products, you can either:
- Use the admin dashboard (after creating a vendor account)
- Add products via SQL:

```sql
INSERT INTO products (name, description, price, category, "imageUrl", stock) 
VALUES (
  'Sample Product', 
  'Product description', 
  2999900,  -- Price in paisa (NPR 29,999)
  'Electronics', 
  'https://example.com/image.jpg', 
  10
);
```

### 7. Start the Application

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 👥 User Accounts

### Customer Account
- Register as a new customer through the application
- Default role: "customer"

### Vendor Account
A pre-configured vendor account is available:
- **Username**: `vendor`
- **Password**: `vendor123`
- **Role**: `vendor`

Login with these credentials to access the admin dashboard at `/admin`

## 📱 Application Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
└── README.md
```

## 🛒 How to Use

### For Customers:
1. Visit the homepage
2. Browse products or use the search functionality
3. Add items to your cart
4. Proceed to checkout
5. Fill in delivery address and select payment method
6. Complete your order

### For Vendors:
1. Login with vendor credentials
2. Access the "Admin Panel" from the navigation
3. Add new products with images and details
4. Manage existing inventory
5. Monitor stock levels

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Database Schema

The application uses the following main tables:
- **users** - Customer and vendor accounts
- **products** - Product catalog
- **orders** - Customer orders with order details

## 🚀 Deployment

### For Production Deployment:

1. **Database**: Set up a production PostgreSQL database
2. **Environment**: Update environment variables for production
3. **Build**: Run `npm run build`
4. **Deploy**: Deploy to platforms like Vercel, Railway, or DigitalOcean

### Environment Variables for Production:
```env
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_production_session_secret
NODE_ENV=production
```

## 🛡️ Security Features

- Password hashing using scrypt
- Session-based authentication
- CSRF protection
- Role-based access control
- Input validation with Zod schemas

## 🔮 Future Enhancements

- Payment gateway integration (Khalti, eSewa)
- Email notifications
- Order tracking system
- Product reviews and ratings
- Inventory alerts
- Analytics dashboard
- Mobile app development

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database exists

2. **Port Already in Use**
   - Kill processes using port 5000
   - Or change port in vite.config.ts

3. **Module Not Found Errors**
   - Run `npm install` to install dependencies
   - Clear node_modules and reinstall if needed

## 📞 Support

If you encounter any issues while setting up the application locally, please check:
1. All prerequisites are installed correctly
2. Environment variables are properly configured
3. Database connection is established
4. All dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This application is designed for the Nepalese market with NPR currency and local payment methods. Customize as needed for other regions.