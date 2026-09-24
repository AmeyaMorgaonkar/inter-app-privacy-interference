import { createClient } from "npm:@supabase/supabase-js@2";

const EXODUS_BASE_URL = "https://reports.exodus-privacy.eu.org/api";
const USER_AGENT = "InterAppPrivacyInterference/1.0 (Research Pipeline)";

interface ExodusTrackerRaw {
  id: number;
  name: string;
  category?: string;
  website?: string;
  code_signature?: string;
  creation_date?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("EXODUS_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase configuration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Token ${apiKey}`;
  }

  try {
    const trackersRes = await fetch(`${EXODUS_BASE_URL}/trackers`, { headers });
    if (!trackersRes.ok) {
      throw new Error(`Trackers fetch failed: ${trackersRes.status} ${trackersRes.statusText}`);
    }
    const trackersData = await trackersRes.json();
    const rawTrackersDict: Record<string, ExodusTrackerRaw> =
      trackersData.trackers || trackersData;

    const trackersList = Object.values(rawTrackersDict).map((t) => ({
      id: Number(t.id),
      name: t.name || `Tracker ${t.id}`,
      category: t.category || null,
      website: t.website || null,
      code_signature: t.code_signature || null,
      creation_date: t.creation_date || null,
    }));

    if (trackersList.length > 0) {
      const { error: trackerErr } = await supabase
        .from("exodus_trackers")
        .upsert(trackersList, { onConflict: "id" });

      if (trackerErr) throw trackerErr;
    }

    const appsRes = await fetch(`${EXODUS_BASE_URL}/applications`, { headers });
    if (!appsRes.ok) {
      throw new Error(`Applications fetch failed: ${appsRes.status} ${appsRes.statusText}`);
    }

    const appsText = await appsRes.text();
    const handlesSet = new Set<string>();

    const handleRegex = /"handle"\s*:\s*"([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = handleRegex.exec(appsText)) !== null) {
      if (match[1]) handlesSet.add(match[1]);
    }

    if (handlesSet.size === 0) {
      const keyRegex = /"([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)"\s*:\s*\{/g;
      while ((match = keyRegex.exec(appsText)) !== null) {
        if (match[1]) handlesSet.add(match[1]);
      }
    }

    const handles = Array.from(handlesSet);
    const totalApps = handles.length;

    const BATCH_SIZE = 1000;
    for (let i = 0; i < handles.length; i += BATCH_SIZE) {
      const chunkHandles = handles.slice(i, i + BATCH_SIZE);
      const chunkRows = chunkHandles.map((handle) => ({
        handle,
        updated_at: new Date().toISOString(),
      }));

      const { error: appErr } = await supabase
        .from("exodus_apps")
        .upsert(chunkRows, { onConflict: "handle" });

      if (appErr) throw appErr;
    }

    const { error: stateErr } = await supabase
      .from("exodus_crawl_state")
      .upsert({
        id: 1,
        status: "bootstrapped",
        last_processed_handle: null,
        last_processed_offset: 0,
        total_apps_count: totalApps,
        last_run_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      });

    if (stateErr) throw stateErr;

    return new Response(
      JSON.stringify({
        success: true,
        trackersSynced: trackersList.length,
        appsSynced: totalApps,
        status: "bootstrapped",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    await supabase.from("exodus_crawl_state").upsert({
      id: 1,
      status: "failed",
      error_message: err.message || String(err),
      updated_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: false, error: err.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
