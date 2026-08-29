import "server-only";
import { after } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { failPublishingJob, processPublishingJob } from "@/lib/jobs/publishing";
import { log } from "@/lib/observability/logger";

type ClaimedPublishingJob = {
  id: string;
  post_id: string;
  instagram_account_id: string;
  attempt_count: number;
  max_attempts: number;
};

async function runPublishingQueue() {
  const db = createSupabaseAdminClient();
  const worker = `publisher-${crypto.randomUUID()}`;
  const { data, error } = await db.rpc("claim_publishing_jobs", {
    worker_name: worker,
    job_limit: 1,
  });
  if (error)
    throw new Error(`Could not claim publishing jobs: ${error.message}`);
  for (const job of (data ?? []) as ClaimedPublishingJob[]) {
    try {
      await processPublishingJob(db, job);
    } catch (cause) {
      await failPublishingJob(db, job, cause);
    }
  }
  return { worker, claimed: data?.length ?? 0 };
}

export function processPublishingQueueAfterResponse() {
  after(async () => {
    try {
      const result = await runPublishingQueue();
      log("info", "Immediate publishing worker finished", result);
    } catch (cause) {
      log("error", "Immediate publishing worker failed", {
        error: cause instanceof Error ? cause.message : "Unknown error",
      });
    }
  });
}
