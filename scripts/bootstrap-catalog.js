const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const EXODUS_BASE_URL = "https://reports.exodus-privacy.eu.org/api";
const USER_AGENT = "InterAppPrivacyInterference/1.0 (Research Pipeline)";

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

async function main() {
  console.log("Starting Exodus Catalog Bootstrap...");
  const env = loadEnv();
  const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const keyToUse = serviceRoleKey || anonKey;

  if (!supabaseUrl || !keyToUse) {
    console.error("Error: Missing SUPABASE_URL or key in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, keyToUse);
  const exodusApiKey = process.env.EXODUS_API_KEY || env.EXODUS_API_KEY;

  const headers = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json",
  };
  if (exodusApiKey) {
    headers["Authorization"] = `Token ${exodusApiKey}`;
  }

  console.log("1. Fetching Exodus trackers...");
  const trackersRes = await fetch(`${EXODUS_BASE_URL}/trackers`, { headers });
  if (!trackersRes.ok) {
    throw new Error(`Trackers fetch failed: ${trackersRes.status} ${trackersRes.statusText}`);
  }
  const trackersData = await trackersRes.json();
  const rawTrackersDict = trackersData.trackers || trackersData;

  const trackersList = Object.values(rawTrackersDict).map((t) => ({
    id: Number(t.id),
    name: t.name || `Tracker ${t.id}`,
    category: t.category || null,
    website: t.website || null,
    code_signature: t.code_signature || null,
    creation_date: t.creation_date || null,
  }));

  console.log(`Upserting ${trackersList.length} trackers...`);
  const { error: trackerErr } = await supabase
    .from("exodus_trackers")
    .upsert(trackersList, { onConflict: "id" });
  if (trackerErr) {
    console.error("Tracker upsert error:", trackerErr);
    throw trackerErr;
  }
  console.log("Trackers successfully seeded!");

  console.log("2. Fetching Exodus master applications list...");
  const appsRes = await fetch(`${EXODUS_BASE_URL}/applications`, { headers });
  if (!appsRes.ok) {
    throw new Error(`Applications fetch failed: ${appsRes.status} ${appsRes.statusText}`);
  }
  const appsData = await appsRes.json();
  const rawAppsDict = appsData.applications || appsData;
  const handles = Object.keys(rawAppsDict);
  console.log(`Found ${handles.length} applications in catalog.`);

  const BATCH_SIZE = 1000;
  let seededCount = 0;
  for (let i = 0; i < handles.length; i += BATCH_SIZE) {
    const batchHandles = handles.slice(i, i + BATCH_SIZE);
    const chunk = batchHandles.map((handle) => {
      const item = rawAppsDict[handle];
      return {
        handle,
        name: typeof item === "object" && item !== null ? item.name || null : null,
        creator: typeof item === "object" && item !== null ? item.creator || null : null,
        source: typeof item === "object" && item !== null ? item.source || null : null,
        report_updated_at:
          typeof item === "object" && item !== null ? item.report_updated_at || null : null,
        updated_at: new Date().toISOString(),
      };
    });

    const { error: appErr } = await supabase
      .from("exodus_apps")
      .upsert(chunk, { onConflict: "handle" });

    if (appErr) {
      console.error(`Batch ${i} error:`, appErr);
      throw appErr;
    }
    seededCount += chunk.length;
    if (seededCount % 10000 === 0 || seededCount === handles.length) {
      console.log(`Progress: ${seededCount}/${handles.length} app handles inserted...`);
    }
  }

  console.log("3. Updating exodus_crawl_state...");
  const { error: stateErr } = await supabase
    .from("exodus_crawl_state")
    .upsert({
      id: 1,
      status: "bootstrapped",
      last_processed_handle: null,
      last_processed_offset: 0,
      total_apps_count: handles.length,
      last_run_at: new Date().toISOString(),
      error_message: null,
      updated_at: new Date().toISOString(),
    });

  if (stateErr) {
    console.error("State update error:", stateErr);
    throw stateErr;
  }

  console.log("Catalog Bootstrap Complete!");
  console.log(`Synced ${trackersList.length} trackers and ${handles.length} app handles.`);
}

main().catch((err) => {
  console.error("Bootstrap error:", err);
  process.exit(1);
});
