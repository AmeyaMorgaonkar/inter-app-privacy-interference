import { createClient } from "npm:@supabase/supabase-js@2";

const EXODUS_BASE_URL = "https://reports.exodus-privacy.eu.org/api";
const USER_AGENT = "InterAppPrivacyInterference/1.0 (Research Pipeline)";
const REQUEST_DELAY_MS = 250;
const BATCH_SIZE = 50;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    const { data: stateData, error: stateFetchErr } = await supabase
      .from("exodus_crawl_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (stateFetchErr && stateFetchErr.code !== "PGRST116") {
      throw stateFetchErr;
    }

    if (!stateData || stateData.status === "idle") {
      return new Response(
        JSON.stringify({
          status: "idle",
          message: "Bootstrap has not been executed yet.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (stateData.status === "complete") {
      return new Response(
        JSON.stringify({
          status: "complete",
          message: "Full Exodus crawl is complete.",
          lastProcessedHandle: stateData.last_processed_handle,
          offset: stateData.last_processed_offset,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    await supabase.from("exodus_crawl_state").upsert({
      id: 1,
      status: "crawling",
      updated_at: new Date().toISOString(),
    });

    let query = supabase
      .from("exodus_apps")
      .select("handle")
      .order("handle", { ascending: true })
      .limit(BATCH_SIZE);

    if (stateData.last_processed_handle) {
      query = query.gt("handle", stateData.last_processed_handle);
    }

    const { data: appBatch, error: batchErr } = await query;
    if (batchErr) throw batchErr;

    if (!appBatch || appBatch.length === 0) {
      await supabase.from("exodus_crawl_state").upsert({
        id: 1,
        status: "complete",
        last_run_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          status: "complete",
          message: "No remaining applications to process.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    let processedInRun = 0;
    let trackersAssignedInRun = 0;
    let lastHandle = stateData.last_processed_handle;
    let currentOffset = stateData.last_processed_offset || 0;

    for (const app of appBatch) {
      await delay(REQUEST_DELAY_MS);
      const appHandle = app.handle;

      try {
        const detailRes = await fetch(
          `${EXODUS_BASE_URL}/search/${encodeURIComponent(appHandle)}/details`,
          { headers }
        );

        if (detailRes.ok) {
          const detailData = await detailRes.json();
          const reports = detailData.reports || detailData[appHandle]?.reports || [];

          const trackerIdsSet = new Set<number>();
          let latestReportDate: string | null = null;

          if (Array.isArray(reports)) {
            for (const report of reports) {
              if (report.creation_date && (!latestReportDate || report.creation_date > latestReportDate)) {
                latestReportDate = report.creation_date;
              }
              if (Array.isArray(report.trackers)) {
                for (const tr of report.trackers) {
                  const trId = typeof tr === "object" ? tr.id : Number(tr);
                  if (!isNaN(trId)) trackerIdsSet.add(trId);
                }
              }
            }
          }

          if (trackerIdsSet.size > 0) {
            const appTrackers = Array.from(trackerIdsSet).map((trackerId) => ({
              app_handle: appHandle,
              tracker_id: trackerId,
            }));

            await supabase
              .from("exodus_app_trackers")
              .upsert(appTrackers, { onConflict: "app_handle,tracker_id" });

            trackersAssignedInRun += appTrackers.length;
          }

          if (latestReportDate) {
            await supabase
              .from("exodus_apps")
              .update({ report_updated_at: latestReportDate })
              .eq("handle", appHandle);
          }
        }
      } catch (appErr) {
        console.warn(`Failed handle fetch for ${appHandle}:`, appErr);
      }

      lastHandle = appHandle;
      currentOffset += 1;
      processedInRun += 1;
    }

    const isFinished = appBatch.length < BATCH_SIZE;
    const finalStatus = isFinished ? "complete" : "crawling";

    await supabase.from("exodus_crawl_state").upsert({
      id: 1,
      status: finalStatus,
      last_processed_handle: lastHandle,
      last_processed_offset: currentOffset,
      last_run_at: new Date().toISOString(),
      error_message: null,
      updated_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        status: finalStatus,
        processedInBatch: processedInRun,
        trackersAssigned: trackersAssignedInRun,
        lastProcessedHandle: lastHandle,
        totalOffset: currentOffset,
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
