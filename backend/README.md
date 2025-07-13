# Squirell Backend API

A comprehensive Node.js/Express backend for the Squirell fractional investment platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev

# Run database setup (creates sample data)
npm run setup
```

## 📋 Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## 🔧 Environment Setup

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/squirell
MONGODB_URI_PROD=your_production_mongodb_uri

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Session Secret
SESSION_SECRET=your_session_secret_key
```

## 🗄 Database Models

### User Model

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['user', 'moderator', 'admin'],
  isActive: Boolean,
  isEmailVerified: Boolean,
  kycStatus: ['pending', 'verified', 'rejected'],
  investmentProfile: {
    riskTolerance: String,
    investmentGoals: [String],
    investmentExperience: String,
    annualIncome: String,
    netWorth: String
  },
  googleId: String,
  appleId: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model

```javascript
{
  title: String,
  description: String,
  shortDescription: String,
  assetType: String,
  category: String,
  totalValue: Number,
  sharePrice: Number,
  totalShares: Number,
  availableShares: Number,
  minimumInvestment: Number,
  maximumInvestment: Number,
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  specifications: {
    size: { value: Number, unit: String },
    yearBuilt: Number,
    condition: String,
    features: [String],
    amenities: [String]
  },
  performance: {
    annualReturn: Number,
    projectedReturn: Number,
    riskLevel: String,
    liquidityScore: Number
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  tags: [String],
  status: ['draft', 'pending', 'active', 'sold', 'suspended'],
  isFeatured: Boolean,
  owner: ObjectId (ref: User),
  likes: [ObjectId (ref: User)],
  bookmarks: [ObjectId (ref: User)],
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model

```javascript
{
  title: String,
  content: String,
  rating: Number (1-5),
  category: String,
  status: ['pending', 'approved', 'rejected'],
  isFeatured: Boolean,
  author: ObjectId (ref: User),
  authorName: String,
  authorEmail: String,
  product: ObjectId (ref: Product),
  helpfulVotes: Number,
  helpfulVoters: [ObjectId (ref: User)],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 API Endpoints

### Authentication Routes

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth

```http
GET /api/auth/google
```

#### Apple OAuth

```http
GET /api/auth/apple
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

### Product Routes

#### Get Products (with pagination and filtering)

```http
GET /api/products?page=1&limit=10&category=real-estate&minPrice=1000&maxPrice=100000&sortBy=price&sortOrder=asc
```

#### Get Single Product

```http
GET /api/products/:id
```

#### Create Product

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Luxury Villa",
  "description": "Beautiful villa...",
  "assetType": "real-estate",
  "category": "residential",
  "totalValue": 2500000,
  "sharePrice": 1000,
  "totalShares": 2500,
  "minimumInvestment": 1000,
  "maximumInvestment": 100000,
  "images": [files]
}
```

#### Update Product

```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Villa Title",
  "description": "Updated description..."
}
```

#### Delete Product

```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

#### Invest in Product

```http
POST /api/products/:id/invest
Authorization: Bearer <token>
Content-Type: application/json

{
  "shares": 5,
  "amount": 5000
}
```

### Review Routes

#### Get Reviews

```http
GET /api/reviews?productId=123&status=approved&page=1&limit=10
```

#### Create Review

```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Great Investment",
  "content": "This was an excellent investment...",
  "rating": 5,
  "category": "product",
  "productId": "product_id_here"
}
```

#### Update Review

```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Review Title",
  "content": "Updated content..."
}
```

#### Delete Review

```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### User Routes

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "investmentProfile": {
    "riskTolerance": "moderate",
    "investmentGoals": ["retirement", "wealth-building"]
  }
}
```

#### Change Password

```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Get User Investments

```http
GET /api/users/investments
Authorization: Bearer <token>
```

### Admin Routes

#### Dashboard Statistics

```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Get All Users

```http
GET /api/admin/users?page=1&limit=20&role=user&status=active
Authorization: Bearer <token>
```

#### Update User Status

```http
PUT /api/admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false,
  "role": "moderator"
}
```

#### Delete User

```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

#### Get All Products

```http
GET /api/admin/products?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

#### Update Product Status

```http
PUT /api/admin/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active",
  "isFeatured": true
}
```

#### Get All Reviews

```http
GET /api/admin/reviews?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

#### Update Review Status

```http
PUT /api/admin/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "isFeatured": true
}
```

## 🔒 Authentication & Authorization

### JWT Token Structure

```javascript
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control

- **user**: Can create products, reviews, manage profile
- **moderator**: Can moderate reviews, manage products
- **admin**: Full access to all admin functions

### Protected Routes

All routes except authentication routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 📁 File Upload

### Image Upload with Cloudinary

```javascript
// Upload single image
const result = await cloudinary.uploader.upload(file.path, {
  folder: "squirell/products",
  transformation: [
    { width: 800, height: 600, crop: "fill" },
    { quality: "auto" },
  ],
});

// Upload multiple images
const uploadPromises = files.map((file) =>
  cloudinary.uploader.upload(file.path, {
    folder: "squirell/products",
    transformation: [
      { width: 800, height: 600, crop: "fill" },
      { quality: "auto" },
    ],
  })
);
const results = await Promise.all(uploadPromises);
```

## 📧 Email Notifications

### Email Templates

- Welcome email
- Password reset
- Email verification
- Investment confirmation
- Review approval/rejection

### Email Configuration

```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### API Testing with Postman

Import the provided Postman collection for testing all endpoints.

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI_PROD=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "squirell-backend",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

## 🔍 Error Handling

### Standard Error Response

```javascript
{
  "success": false,
  "error": "Error message",
  "stack": "Error stack trace (development only)"
}
```

### Validation Error Response

```javascript
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 📊 Performance Optimization

### Database Indexing

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 });
db.users.createIndex({ appleId: 1 });

// Product indexes
db.products.createIndex({ status: 1 });
db.products.createIndex({ assetType: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ totalValue: 1 });
db.products.createIndex({ isFeatured: 1 });

// Review indexes
db.reviews.createIndex({ product: 1 });
db.reviews.createIndex({ status: 1 });
db.reviews.createIndex({ rating: 1 });
```

### Caching Strategy

- Redis for session storage
- Product cache for frequently accessed items
- User profile cache

## 🔒 Security Features

### Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});
```

### Input Validation

```javascript
const { body, validationResult } = require("express-validator");

const validateProduct = [
  body("title").trim().isLength({ min: 3, max: 100 }),
  body("description").trim().isLength({ min: 10, max: 2000 }),
  body("totalValue").isNumeric().isFloat({ min: 1000 }),
  body("sharePrice").isNumeric().isFloat({ min: 1 }),
];
```

### File Upload Security

```javascript
const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
```

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection**

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

**JWT Token Issues**

```bash
# Check JWT secret in .env
echo $JWT_SECRET

# Verify token format
jwt.verify(token, process.env.JWT_SECRET)
```

**File Upload Issues**

```bash
# Check Cloudinary credentials
# Verify file size limits
# Check file type restrictions
```

**Email Issues**

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check Gmail app password
# Verify email credentials
```

## 📞 Support

For backend-specific issues:

- Check the logs: `npm run dev`
- Review environment variables
- Test database connection
- Verify API endpoints with Postman

---

**Backend API Documentation - Squirell Team**
