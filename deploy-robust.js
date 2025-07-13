import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting robust deployment process...");

try {
  // Step 1: Build the frontend
  console.log("📦 Building frontend...");
  execSync("npm run build", {
    stdio: "inherit",
    cwd: __dirname,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
  });

  // Step 2: Install backend dependencies
  console.log("📦 Installing backend dependencies...");
  execSync("npm install --production", {
    stdio: "inherit",
    cwd: path.join(__dirname, "backend"),
  });

  // Step 3: Start the backend server with proper error handling
  console.log("🚀 Starting server...");
  console.log("🔧 Environment:", process.env.NODE_ENV || "development");
  console.log("🔧 Port:", process.env.PORT || "5000");

  // Start the server and keep it running
  const serverProcess = execSync("npm start", {
    stdio: "inherit",
    cwd: path.join(__dirname, "backend"),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: process.env.PORT || "5000",
    },
  });
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  console.error("🔍 Error details:", error);
  process.exit(1);
}
