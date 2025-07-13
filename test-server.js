import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Testing server startup...");

// Test if we can start the server
const testServer = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "pipe",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: process.env.PORT || "5000",
  },
});

let output = "";
let errorOutput = "";

testServer.stdout.on("data", (data) => {
  output += data.toString();
  console.log("📤 Server output:", data.toString());
});

testServer.stderr.on("data", (data) => {
  errorOutput += data.toString();
  console.error("❌ Server error:", data.toString());
});

testServer.on("close", (code) => {
  console.log(`\n🧪 Test completed with code: ${code}`);
  console.log("📤 Total output:", output);
  console.log("❌ Total errors:", errorOutput);

  if (code === 0) {
    console.log("✅ Server test passed!");
  } else {
    console.log("❌ Server test failed!");
  }

  process.exit(code);
});

// Kill the test after 10 seconds
setTimeout(() => {
  console.log("⏰ Test timeout reached, killing server...");
  testServer.kill("SIGTERM");
}, 10000);
