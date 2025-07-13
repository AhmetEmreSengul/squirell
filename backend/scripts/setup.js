import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI || "mongodb://localhost:27017/squirell",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@squirell.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@squirell.com",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
      kycStatus: "verified",
      investmentProfile: {
        riskTolerance: "aggressive",
        investmentGoals: ["wealth-building", "diversification"],
        investmentExperience: "expert",
        annualIncome: "over-500k",
        netWorth: "over-5m",
      },
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

const createSampleUsers = async () => {
  try {
    const sampleUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
        investmentProfile: {
          riskTolerance: "moderate",
          investmentGoals: ["retirement", "wealth-building"],
          investmentExperience: "intermediate",
          annualIncome: "100k-250k",
          netWorth: "500k-1m",
        },
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
        investmentProfile: {
          riskTolerance: "conservative",
          investmentGoals: ["income-generation", "tax-benefits"],
          investmentExperience: "beginner",
          annualIncome: "50k-100k",
          netWorth: "100k-500k",
        },
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@example.com",
        password: "password123",
        role: "moderator",
        isEmailVerified: true,
        investmentProfile: {
          riskTolerance: "aggressive",
          investmentGoals: ["wealth-building", "diversification"],
          investmentExperience: "advanced",
          annualIncome: "250k-500k",
          netWorth: "1m-5m",
        },
      },
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = new User({
          ...userData,
          password: hashedPassword,
        });
        await user.save();
        createdUsers.push(user);
        console.log(`Created user: ${user.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${userData.email}`);
      }
    }

    return createdUsers;
  } catch (error) {
    console.error("Error creating sample users:", error);
    throw error;
  }
};

const createSampleProducts = async (users) => {
  try {
    const sampleProducts = [
      {
        title: "Luxury Beachfront Villa",
        description:
          "Stunning 4-bedroom villa with panoramic ocean views, private pool, and direct beach access. Located in the exclusive Malibu area.",
        shortDescription: "Luxury beachfront villa with ocean views",
        assetType: "real-estate",
        category: "residential",
        totalValue: 2500000,
        sharePrice: 1000,
        totalShares: 2500,
        availableShares: 2500,
        minimumInvestment: 1000,
        maximumInvestment: 100000,
        location: {
          address: "123 Ocean Drive",
          city: "Malibu",
          state: "CA",
          country: "USA",
          zipCode: "90265",
        },
        specifications: {
          size: { value: 4500, unit: "sqft" },
          yearBuilt: 2020,
          condition: "excellent",
          features: [
            "Ocean View",
            "Private Pool",
            "Beach Access",
            "Gourmet Kitchen",
          ],
          amenities: ["Gym", "Spa", "Wine Cellar", "Smart Home System"],
        },
        performance: {
          annualReturn: 8.5,
          projectedReturn: 12.0,
          riskLevel: "medium",
          liquidityScore: 7,
        },
        tags: ["luxury", "beachfront", "villa", "malibu", "real-estate"],
        status: "active",
        isFeatured: true,
      },
      {
        title: "Contemporary Art Collection",
        description:
          "Curated collection of contemporary artworks by emerging and established artists. Includes paintings, sculptures, and digital art pieces.",
        shortDescription: "Contemporary art collection by emerging artists",
        assetType: "art",
        category: "paintings",
        totalValue: 500000,
        sharePrice: 100,
        totalShares: 5000,
        availableShares: 5000,
        minimumInvestment: 100,
        maximumInvestment: 50000,
        specifications: {
          size: { value: 15, unit: "pieces" },
          condition: "excellent",
          features: ["Contemporary", "Mixed Media", "Limited Edition"],
          amenities: [
            "Climate Controlled Storage",
            "Insurance",
            "Professional Appraisal",
          ],
        },
        performance: {
          annualReturn: 15.0,
          projectedReturn: 20.0,
          riskLevel: "high",
          liquidityScore: 5,
        },
        tags: ["contemporary", "art", "collection", "emerging-artists"],
        status: "active",
        isFeatured: true,
      },
      {
        title: "Commercial Office Building",
        description:
          "Modern office building in downtown business district with high occupancy rates and long-term tenant contracts.",
        shortDescription: "Modern office building in prime location",
        assetType: "real-estate",
        category: "commercial",
        totalValue: 5000000,
        sharePrice: 2000,
        totalShares: 2500,
        availableShares: 2500,
        minimumInvestment: 2000,
        maximumInvestment: 200000,
        location: {
          address: "456 Business Ave",
          city: "New York",
          state: "NY",
          country: "USA",
          zipCode: "10001",
        },
        specifications: {
          size: { value: 25000, unit: "sqft" },
          yearBuilt: 2018,
          condition: "excellent",
          features: ["Modern Design", "High Occupancy", "Long-term Leases"],
          amenities: ["Parking Garage", "Security System", "HVAC", "Elevators"],
        },
        performance: {
          annualReturn: 6.5,
          projectedReturn: 8.0,
          riskLevel: "low",
          liquidityScore: 8,
        },
        tags: ["commercial", "office", "downtown", "business"],
        status: "active",
      },
      {
        title: "Vintage Wine Collection",
        description:
          "Premium collection of vintage wines from renowned vineyards, including rare bottles from the 1980s and 1990s.",
        shortDescription: "Premium vintage wine collection",
        assetType: "collectibles",
        category: "wine",
        totalValue: 300000,
        sharePrice: 50,
        totalShares: 6000,
        availableShares: 6000,
        minimumInvestment: 50,
        maximumInvestment: 25000,
        specifications: {
          size: { value: 200, unit: "bottles" },
          condition: "excellent",
          features: ["Vintage", "Rare", "Premium Quality"],
          amenities: [
            "Climate Controlled Storage",
            "Professional Inventory",
            "Insurance",
          ],
        },
        performance: {
          annualReturn: 10.0,
          projectedReturn: 15.0,
          riskLevel: "medium",
          liquidityScore: 6,
        },
        tags: ["vintage", "wine", "collection", "premium"],
        status: "active",
      },
      {
        title: "Agricultural Land",
        description:
          "Fertile agricultural land suitable for various crops. Currently leased to local farmers with stable income.",
        shortDescription: "Fertile agricultural land with stable income",
        assetType: "real-estate",
        category: "land",
        totalValue: 800000,
        sharePrice: 400,
        totalShares: 2000,
        availableShares: 2000,
        minimumInvestment: 400,
        maximumInvestment: 40000,
        location: {
          address: "789 Farm Road",
          city: "Fresno",
          state: "CA",
          country: "USA",
          zipCode: "93710",
        },
        specifications: {
          size: { value: 100, unit: "acres" },
          condition: "good",
          features: ["Fertile Soil", "Irrigation System", "Road Access"],
          amenities: ["Storage Facilities", "Equipment Shed", "Water Rights"],
        },
        performance: {
          annualReturn: 5.5,
          projectedReturn: 7.0,
          riskLevel: "low",
          liquidityScore: 7,
        },
        tags: ["agricultural", "land", "farming", "stable-income"],
        status: "active",
      },
    ];

    const createdProducts = [];
    for (const productData of sampleProducts) {
      const product = new Product({
        ...productData,
        owner: users[0]._id, // Assign to first user
        images: [
          {
            url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
            alt: productData.title,
            isPrimary: true,
          },
        ],
      });
      await product.save();
      createdProducts.push(product);
      console.log(`Created product: ${product.title}`);
    }

    return createdProducts;
  } catch (error) {
    console.error("Error creating sample products:", error);
    throw error;
  }
};

const createSampleReviews = async (users, products) => {
  try {
    const sampleReviews = [
      {
        title: "Excellent Investment Platform",
        content:
          "Squirell has made fractional investment accessible and transparent. The platform is user-friendly and the investment opportunities are well-vetted.",
        rating: 5,
        category: "platform",
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Great Real Estate Investment",
        content:
          "Invested in the beachfront villa and the process was smooth. The property is well-maintained and generates good returns.",
        rating: 4,
        category: "product",
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Professional Service",
        content:
          "The team at Squirell is professional and responsive. They provide excellent support throughout the investment process.",
        rating: 5,
        category: "service",
        status: "approved",
      },
      {
        title: "Diversified Portfolio",
        content:
          "Love the variety of investment options available. From real estate to art, there's something for every investor.",
        rating: 4,
        category: "investment",
        status: "approved",
      },
    ];

    const createdReviews = [];
    for (let i = 0; i < sampleReviews.length; i++) {
      const reviewData = sampleReviews[i];
      const review = new Review({
        ...reviewData,
        author: users[i % users.length]._id,
        authorName: `${users[i % users.length].firstName} ${
          users[i % users.length].lastName
        }`,
        authorEmail: users[i % users.length].email,
        product: i < products.length ? products[i]._id : null,
      });
      await review.save();
      createdReviews.push(review);
      console.log(`Created review: ${review.title}`);
    }

    return createdReviews;
  } catch (error) {
    console.error("Error creating sample reviews:", error);
    throw error;
  }
};

const setupDatabase = async () => {
  try {
    console.log("Starting database setup...");

    // Connect to database
    await connectDB();

    // Create admin user
    const adminUser = await createAdminUser();

    // Create sample users
    const users = await createSampleUsers();
    const allUsers = [adminUser, ...users];

    // Create sample products
    const products = await createSampleProducts(allUsers);

    // Create sample reviews
    const reviews = await createSampleReviews(allUsers, products);

    console.log("\n✅ Database setup completed successfully!");
    console.log(`📊 Created ${allUsers.length} users (including admin)`);
    console.log(`🏠 Created ${products.length} products`);
    console.log(`⭐ Created ${reviews.length} reviews`);
    console.log("\n🔑 Admin credentials:");
    console.log("   Email: admin@squirell.com");
    console.log("   Password: admin123");
    console.log("\n👥 Sample user credentials:");
    console.log("   Email: john.doe@example.com");
    console.log("   Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export default setupDatabase;
