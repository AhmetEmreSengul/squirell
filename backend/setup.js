import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Review from "./models/Review.js";

dotenv.config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@squirell.com",
      password: "admin123",
      role: "admin",
      isEmailVerified: true,
      authProvider: "local",
    });
    await adminUser.save();
    console.log("✅ Created admin user (admin@squirell.com / admin123)");

    // Create sample users
    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
        authProvider: "local",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
        authProvider: "local",
      },
      {
        name: "Bob Wilson",
        email: "bob@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
        authProvider: "local",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("✅ Created sample users");

    // Create sample products
    const products = [
      {
        title: "Vintage Picasso Painting",
        description:
          "An original Picasso painting from the 1950s, featuring his signature cubist style. This piece has been authenticated and comes with full provenance documentation.",
        category: "art",
        totalValue: 2500000,
        sharePrice: 2500,
        totalShares: 1000,
        availableShares: 1000,
        purchasePrice: 2000000,
        currentValue: 2500000,
        images: [
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
        ],
        location: {
          country: "France",
          city: "Paris",
          address: "Private Collection",
        },
        specifications: {
          dimensions: {
            width: 120,
            height: 80,
            unit: "cm",
          },
          year: 1955,
          condition: "excellent",
          materials: ["Oil on canvas"],
          artist: "Pablo Picasso",
        },
        status: "active",
        isFeatured: true,
        owner: createdUsers[0]._id,
      },
      {
        title: "Luxury Beachfront Property",
        description:
          "Stunning beachfront property in Malibu, California. Features 5 bedrooms, 4 bathrooms, and panoramic ocean views. Perfect for fractional investment.",
        category: "real-estate",
        totalValue: 8500000,
        sharePrice: 8500,
        totalShares: 1000,
        availableShares: 1000,
        purchasePrice: 7500000,
        currentValue: 8500000,
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        ],
        location: {
          country: "USA",
          city: "Malibu",
          address: "123 Ocean Drive",
        },
        specifications: {
          dimensions: {
            width: 5000,
            height: 3000,
            unit: "sqft",
          },
          year: 2020,
          condition: "excellent",
          materials: ["Concrete", "Glass", "Steel"],
        },
        status: "active",
        isFeatured: true,
        owner: createdUsers[1]._id,
      },
      {
        title: "Rare Vintage Wine Collection",
        description:
          "Collection of 50 rare vintage wines from the 1960s and 1970s. Includes Château Lafite Rothschild, Château Margaux, and other prestigious labels.",
        category: "collectibles",
        totalValue: 500000,
        sharePrice: 500,
        totalShares: 1000,
        availableShares: 1000,
        purchasePrice: 400000,
        currentValue: 500000,
        images: [
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
        ],
        location: {
          country: "France",
          city: "Bordeaux",
          address: "Wine Cellar",
        },
        specifications: {
          year: 1965,
          condition: "excellent",
          materials: ["Glass", "Cork"],
          provenance: "Direct from château cellars",
        },
        status: "active",
        isFeatured: true,
        owner: createdUsers[2]._id,
      },
      {
        title: "Agricultural Land - Organic Farm",
        description:
          "200-acre organic farm in the heart of California's Central Valley. Currently producing organic vegetables and fruits. Excellent investment opportunity.",
        category: "land",
        totalValue: 3000000,
        sharePrice: 3000,
        totalShares: 1000,
        availableShares: 1000,
        purchasePrice: 2500000,
        currentValue: 3000000,
        images: [
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
        ],
        location: {
          country: "USA",
          city: "Fresno",
          address: "Rural Route 5",
        },
        specifications: {
          dimensions: {
            width: 200,
            height: 200,
            unit: "acres",
          },
          condition: "excellent",
          materials: ["Soil", "Organic matter"],
        },
        status: "active",
        owner: createdUsers[0]._id,
      },
      {
        title: "Classic Car Collection",
        description:
          "Collection of 10 classic cars from the 1950s and 1960s. Includes Ferrari 250 GTO, Porsche 356, and Mercedes-Benz 300SL.",
        category: "collectibles",
        totalValue: 15000000,
        sharePrice: 15000,
        totalShares: 1000,
        availableShares: 1000,
        purchasePrice: 12000000,
        currentValue: 15000000,
        images: [
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
        ],
        location: {
          country: "USA",
          city: "Los Angeles",
          address: "Private Garage",
        },
        specifications: {
          year: 1960,
          condition: "excellent",
          materials: ["Steel", "Leather", "Chrome"],
          provenance: "Original owners, full service history",
        },
        status: "active",
        owner: createdUsers[1]._id,
      },
      {
        title: "Modern Art Installation",
        description:
          "Contemporary art installation by renowned artist Yayoi Kusama. Features her signature polka dot patterns and mirror rooms.",
        category: "art",
        totalValue: 1200000,
        sharePrice: 1200,
        totalShares: 1000,
        availableShares: 1000,
        purchasePrice: 1000000,
        currentValue: 1200000,
        images: [
          "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800",
        ],
        location: {
          country: "Japan",
          city: "Tokyo",
          address: "Museum of Contemporary Art",
        },
        specifications: {
          dimensions: {
            width: 300,
            height: 300,
            depth: 300,
            unit: "cm",
          },
          year: 2020,
          condition: "excellent",
          materials: ["Mirrors", "LED lights", "Acrylic"],
          artist: "Yayoi Kusama",
        },
        status: "active",
        owner: createdUsers[2]._id,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log("✅ Created sample products");

    // Create sample reviews
    const reviews = [
      {
        title: "Excellent Investment Platform",
        content:
          "Squirell has revolutionized how I think about investing in high-value assets. The fractional ownership model makes it accessible to everyone.",
        rating: 5,
        category: "platform",
        author: createdUsers[0]._id,
        authorName: `${createdUsers[0].firstName} ${createdUsers[0].lastName}`,
        authorEmail: createdUsers[0].email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Great User Experience",
        content:
          "The platform is intuitive and easy to use. I love being able to invest in art and real estate without needing millions of dollars.",
        rating: 5,
        category: "platform",
        author: createdUsers[1]._id,
        authorName: `${createdUsers[1].firstName} ${createdUsers[1].lastName}`,
        authorEmail: createdUsers[1].email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Transparent and Trustworthy",
        content:
          "Squirell provides excellent transparency in their investment opportunities. All the documentation and verification processes give me confidence.",
        rating: 4,
        category: "platform",
        author: createdUsers[2]._id,
        authorName: `${createdUsers[2].firstName} ${createdUsers[2].lastName}`,
        authorEmail: createdUsers[2].email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Amazing Art Investment",
        content:
          "I invested in the Picasso painting and the process was seamless. The platform made it easy to understand the investment and track its performance.",
        rating: 5,
        category: "product",
        product: createdProducts[0]._id,
        author: createdUsers[0]._id,
        authorName: `${createdUsers[0].firstName} ${createdUsers[0].lastName}`,
        authorEmail: createdUsers[0].email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Real Estate Investment Success",
        content:
          "The Malibu property investment has been performing well. The platform provides regular updates and the property management is excellent.",
        rating: 4,
        category: "product",
        product: createdProducts[1]._id,
        author: createdUsers[1]._id,
        authorName: `${createdUsers[1].firstName} ${createdUsers[1].lastName}`,
        authorEmail: createdUsers[1].email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Wine Collection Investment",
        content:
          "Investing in the vintage wine collection has been a great experience. The storage and authentication processes are top-notch.",
        rating: 5,
        category: "product",
        product: createdProducts[2]._id,
        author: createdUsers[2]._id,
        authorName: `${createdUsers[2].firstName} ${createdUsers[2].lastName}`,
        authorEmail: createdUsers[2].email,
        status: "approved",
        isFeatured: true,
      },
    ];

    await Review.insertMany(reviews);
    console.log("✅ Created sample reviews");

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📋 Sample Data Created:");
    console.log("- 1 Admin user (admin@squirell.com / admin123)");
    console.log(
      "- 3 Regular users (john@example.com, jane@example.com, bob@example.com / password123)"
    );
    console.log("- 6 Sample products (art, real estate, collectibles, land)");
    console.log("- 6 Sample reviews (testimonials and product reviews)");
    console.log("\n🚀 You can now start the backend server with: npm run dev");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
};

setupDatabase();
