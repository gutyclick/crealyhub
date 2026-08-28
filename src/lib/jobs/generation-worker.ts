import "server-only";
import { after } from "next/server";
import { env } from "@/lib/env";
import { failGenerationJob, processGenerationJob } from "@/lib/jobs/generation";
import { log } from "@/lib/observability/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ClaimedGenerationJob = { id: string; brand_id: string; post_id: string; attempt_count: number; max_attempts: number };

export async function runGenerationQueue() {
  const client = createSupabaseAdminClient();
  const worker = `generation-${crypto.randomUUID()}`;
  const { data, error } = await client.rpc("claim_generation_jobs", { worker_name: worker, job_limit: env.MAX_CONCURRENT_GENERATIONS });
  if (error) throw new Error(`Could not claim generation jobs: ${error.message}`);

  const jobs = (data ?? []) as ClaimedGenerationJob[];
  const results = await Promise.all(jobs.map(async (job) => {
    try {
      await processGenerationJob(client, job);
      return { id: job.id, status: "COMPLETED" as const };
    } catch (cause) {
      await failGenerationJob(client, job, cause);
      return { id: job.id, status: "FAILED" as const, error: cause instanceof Error ? cause.message : "Unknown error" };
    }
  }));
  return { worker, claimed: jobs.length, results };
}

export function processGenerationQueueAfterResponse() {
  after(async () => {
    try {
      const result = await runGenerationQueue();
      log("info", "Immediate generation worker finished", { worker: result.worker, claimed: result.claimed });
    } catch (cause) {
      log("error", "Immediate generation worker failed", { error: cause instanceof Error ? cause.message : "Unknown error" });
    }
  });
}
