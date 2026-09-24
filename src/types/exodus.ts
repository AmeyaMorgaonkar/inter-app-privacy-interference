export interface ExodusTracker {
  id: number;
  name: string;
  category: string | null;
  website: string | null;
  code_signature: string | null;
  creation_date: string | null;
}

export interface ExodusApp {
  handle: string;
  name: string | null;
  creator: string | null;
  source: string | null;
  report_updated_at: string | null;
  updated_at: string;
}

export interface ExodusAppTracker {
  app_handle: string;
  tracker_id: number;
  created_at: string;
}

export type ExodusCrawlStatus = 'idle' | 'bootstrapped' | 'crawling' | 'complete' | 'failed';

export interface ExodusCrawlState {
  id: number;
  status: ExodusCrawlStatus;
  last_processed_handle: string | null;
  last_processed_offset: number;
  total_apps_count: number;
  last_run_at: string | null;
  error_message: string | null;
  updated_at: string;
}
