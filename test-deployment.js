import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Testing deployment configuration...");

try {
  // Test 1: Check if build works
  console.log("📦 Testing build...");
  execSync("npm run build", {
    stdio: "inherit",
    cwd: __dirname,
  });

  // Test 2: Check if backend starts
  console.log("🚀 Testing backend startup...");
  const backendProcess = execSync("npm start", {
    stdio: "pipe",
    cwd: path.join(__dirname, "backend"),
    timeout: 10000, // 10 seconds timeout
  });

  console.log("✅ All tests passed!");
  console.log("🚀 Ready for Render deployment!");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
