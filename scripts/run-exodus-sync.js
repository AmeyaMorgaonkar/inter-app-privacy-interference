const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...vals] = trimmed.split("=");
    env[key.trim()] = vals.join("=").trim();
  }
  return env;
}

async function run() {
  const env = loadEnv();
  const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const authKey = serviceRoleKey || anonKey;

  if (!supabaseUrl) {
    console.error("Error: SUPABASE_URL not found in environment or .env");
    process.exit(1);
  }

  const action = process.argv[2] || "status";

  const headers = {
    "Content-Type": "application/json",
  };
  if (authKey) {
    headers["Authorization"] = `Bearer ${authKey}`;
    headers["apikey"] = authKey;
  }

  if (action === "bootstrap") {
    console.log("Triggering exodus-bootstrap...");
    const res = await fetch(`${supabaseUrl}/functions/v1/exodus-bootstrap`, {
      method: "POST",
      headers,
    });
    const data = await res.json();
    console.log("Bootstrap response:", data);
  } else if (action === "crawl-once") {
    console.log("Triggering exodus-crawl single batch...");
    const res = await fetch(`${supabaseUrl}/functions/v1/exodus-crawl`, {
      method: "POST",
      headers,
    });
    const data = await res.json();
    console.log("Crawl response:", data);
  } else if (action === "crawl-loop") {
    console.log("Starting continuous crawl loop (Ctrl+C to stop)...");
    let count = 0;
    while (true) {
      count++;
      console.log(`[Batch ${count}] Invoking exodus-crawl...`);
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/exodus-crawl`, {
          method: "POST",
          headers,
        });
        const data = await res.json();
        console.log(`[Batch ${count}] Result:`, data);
        if (data.status === "complete") {
          console.log("Crawl completed successfully!");
          break;
        }
      } catch (err) {
        console.error(`[Batch ${count}] Error:`, err.message);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  } else {
    console.log("Usage:");
    console.log("  node scripts/run-exodus-sync.js bootstrap");
    console.log("  node scripts/run-exodus-sync.js crawl-once");
    console.log("  node scripts/run-exodus-sync.js crawl-loop");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
