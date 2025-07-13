import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting simplified deployment process...");

try {
  // Step 1: TypeScript compilation only
  console.log("📦 Compiling TypeScript...");
  execSync("npx tsc -b", {
    stdio: "inherit",
    cwd: __dirname,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" },
  });

  // Step 2: Vite build with memory optimization
  console.log("📦 Building with Vite...");
  execSync("npx vite build --config vite.config.prod.ts", {
    stdio: "inherit",
    cwd: __dirname,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" },
  });

  // Step 3: Install backend dependencies
  console.log("📦 Installing backend dependencies...");
  execSync("npm install --production", {
    stdio: "inherit",
    cwd: path.join(__dirname, "backend"),
  });

  // Step 4: Start the backend server
  console.log("🚀 Starting combined server...");
  execSync("npm start", {
    stdio: "inherit",
    cwd: path.join(__dirname, "backend"),
  });
} catch (error) {
  console.error("❌ Deployment failed:", error.message);
  process.exit(1);
}
