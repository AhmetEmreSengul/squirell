<div align="center">

<h3 align="center">SQUIRELL</h3>

https://squirell.onrender.com

</div>

# Squirell Project Setup Guide

This guide will walk you through setting up the complete Squirell fractional investment platform.

## 🎯 Project Overview

Squirell is a modern fractional investment platform with:

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Express + MongoDB
- **Features**: User authentication, product management, admin panel, reviews system

## 📋 Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- MongoDB 6+ installed and running
- Git installed
- A code editor (VS Code recommended)

## 🚀 Complete Setup Process

### Step 1: Clone and Navigate

```bash
git clone <repository-url>
cd squirell
```

### Step 2: Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration (see below)
```

### Step 4: Database Setup

```bash
# Make sure MongoDB is running
# On Windows: Start MongoDB service
# On Mac/Linux: sudo systemctl start mongod

# Run the setup script to create sample data
npm run setup
```

### Step 5: Start Development Servers

```bash
# Terminal 1: Start backend (from backend directory)
npm run dev

# Terminal 2: Start frontend (from root directory)
cd ..
npm start
```

## 🔧 Environment Configuration

### Frontend (.env.local)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_APPLE_CLIENT_ID=your_apple_client_id
```

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/squirell
MONGODB_URI_PROD=your_production_mongodb_uri

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OAuth Configuration (Optional - can be added later)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# Cloudinary Configuration (Optional - can be added later)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Session Secret (generate a strong secret)
SESSION_SECRET=your_session_secret_key_make_it_long_and_random
```

## 🗄 Database Initialization

The setup script creates:

- **Admin user**: admin@squirell.com / admin123
- **Sample users**: john.doe@example.com / password123
- **Sample products**: 5 different investment opportunities
- **Sample reviews**: 4 user reviews

### Running Setup Script

```bash
cd backend
npm run setup
```

Expected output:

```
✅ Database setup completed successfully!
📊 Created 4 users (including admin)
🏠 Created 5 products
⭐ Created 4 reviews

🔑 Admin credentials:
   Email: admin@squirell.com
   Password: admin123

👥 Sample user credentials:
   Email: john.doe@example.com
   Password: password123
```

## 🌐 Accessing the Application

### Frontend

- **URL**: http://localhost:3000
- **Features**: Browse products, create account, submit reviews

### Backend API

- **URL**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Admin Panel

- **URL**: http://localhost:3000/admin
- **Login**: admin@squirell.com / admin123
- **Features**: User management, product moderation, review management

## 🔍 Testing the Setup

### 1. Test Frontend

- Open http://localhost:3000
- Browse the homepage
- Try creating an account
- Test the product listing page

### 2. Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test products endpoint
curl http://localhost:5000/api/products
```

### 3. Test Admin Panel

- Login with admin@squirell.com / admin123
- Check the dashboard statistics
- Browse users, products, and reviews tabs

### 4. Test User Features

- Register a new account
- Browse products
- Submit a review
- Update profile information

## 🛠 Development Workflow

### Frontend Development

```bash
# Start development server with hot reload
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Backend Development

```bash
cd backend

# Start development server with nodemon
npm run dev

# Run tests
npm test

# Check for linting issues
npm run lint
```

### Database Management

```bash
# Access MongoDB shell
mongosh

# Switch to database
use squirell

# View collections
show collections

# Query data
db.users.find()
db.products.find()
db.reviews.find()
```

## 🔧 Optional Features Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback`
6. Update environment variables

### Apple OAuth Setup

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create an App ID
3. Enable Sign In with Apple
4. Create a Service ID
5. Generate private key
6. Update environment variables

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and secret
3. Update environment variables
4. Test file upload functionality

## 🚀 Production Deployment

### Frontend Deployment (Vercel)

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend Deployment (Heroku)

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI_PROD=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_jwt_secret

# Deploy
git push heroku main
```

### Database Deployment (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Get connection string
3. Update environment variables
4. Run setup script on production database

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**

```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl status mongod
sudo systemctl start mongod
```

**Port Already in Use**

```bash
# Check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F
```

**Module Not Found Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**JWT Token Issues**

```bash
# Check JWT secret in .env
# Ensure it's a strong, random string
# Regenerate if needed
```

**Email Not Sending**

```bash
# Check Gmail app password
# Enable 2-factor authentication
# Generate app-specific password
# Update EMAIL_PASS in .env
```

### Debug Mode

```bash
# Frontend debug
DEBUG=* npm start

# Backend debug
DEBUG=* npm run dev
```

## 📚 Additional Resources

- [Frontend Documentation](./README.md)
- [Backend API Documentation](./backend/README.md)
- [Material-UI Documentation](https://mui.com/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in your terminal
3. Check the browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure MongoDB is running and accessible
6. Create an issue in the project repository

## 🎉 Success!

Once you've completed the setup:

- ✅ Frontend running on http://localhost:3000
- ✅ Backend API running on http://localhost:5000
- ✅ Database populated with sample data
- ✅ Admin panel accessible
- ✅ User registration and login working
- ✅ Product browsing and review system functional

You're ready to start developing and customizing the Squirell platform!

---

**Happy coding! 🚀**
