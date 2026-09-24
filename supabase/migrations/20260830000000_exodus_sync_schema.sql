CREATE TABLE IF NOT EXISTS public.exodus_trackers (
    id integer PRIMARY KEY,
    name text NOT NULL,
    category text,
    website text,
    code_signature text,
    creation_date timestamptz,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exodus_apps (
    handle text PRIMARY KEY,
    name text,
    creator text,
    source text,
    report_updated_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exodus_app_trackers (
    app_handle text REFERENCES public.exodus_apps(handle) ON DELETE CASCADE,
    tracker_id integer REFERENCES public.exodus_trackers(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (app_handle, tracker_id)
);

CREATE TABLE IF NOT EXISTS public.exodus_crawl_state (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'bootstrapped', 'crawling', 'complete', 'failed')),
    last_processed_handle text,
    last_processed_offset integer NOT NULL DEFAULT 0,
    total_apps_count integer NOT NULL DEFAULT 0,
    last_run_at timestamptz,
    error_message text,
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exodus_app_trackers_app_handle ON public.exodus_app_trackers(app_handle);
CREATE INDEX IF NOT EXISTS idx_exodus_app_trackers_tracker_id ON public.exodus_app_trackers(tracker_id);

ALTER TABLE public.exodus_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exodus_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exodus_app_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exodus_crawl_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_exodus_trackers" ON public.exodus_trackers FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_exodus_apps" ON public.exodus_apps FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_exodus_app_trackers" ON public.exodus_app_trackers FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_select_exodus_trackers" ON public.exodus_trackers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_select_exodus_apps" ON public.exodus_apps FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_select_exodus_app_trackers" ON public.exodus_app_trackers FOR SELECT TO authenticated USING (true);
