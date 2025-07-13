import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const makeUserAdmin = async (email) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    // Check if user is already admin
    if (user.role === "admin") {
      console.log(`ℹ️  User ${email} is already an admin`);
      return;
    }

    // Update user role to admin
    user.role = "admin";
    await user.save();

    console.log(`✅ Successfully promoted ${email} to admin role`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);
    console.log(`   Active: ${user.isActive}`);
  } catch (error) {
    console.error("❌ Error promoting user to admin:", error);
  }
};

const main = async () => {
  const email = process.argv[2];

  if (!email) {
    console.log("❌ Please provide an email address");
    console.log("Usage: node scripts/makeAdmin.js user@example.com");
    process.exit(1);
  }

  await connectDB();
  await makeUserAdmin(email);

  // Close database connection
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
  process.exit(0);
};

main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
