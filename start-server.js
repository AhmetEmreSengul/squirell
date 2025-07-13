import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting Squirell server...");
console.log("🔧 Environment:", process.env.NODE_ENV || "development");
console.log("🔧 Port:", process.env.PORT || "5000");
console.log("🔧 Working directory:", path.join(__dirname, "backend"));

// Start the backend server
const server = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: process.env.PORT || "5000",
  },
});

// Handle server process
server.on("error", (error) => {
  console.error("❌ Server error:", error);
  process.exit(1);
});

server.on("exit", (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("🛑 Shutting down server...");
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("🛑 Shutting down server...");
  server.kill("SIGTERM");
});
