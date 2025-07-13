import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting deployment process...");

try {
  // Build the frontend
  console.log("📦 Building frontend...");
  execSync("npm run build", { stdio: "inherit", cwd: __dirname });

  // Install backend dependencies
  console.log("📦 Installing backend dependencies...");
  execSync("npm install", {
    stdio: "inherit",
    cwd: path.join(__dirname, "backend"),
  });

  // Start the backend server (which will serve both API and frontend)
  console.log("🚀 Starting combined server...");
  execSync("npm start", {
    stdio: "inherit",
    cwd: path.join(__dirname, "backend"),
  });
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  process.exit(1);
}
