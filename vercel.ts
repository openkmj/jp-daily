import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  crons: [
    // 09:30 KST = 00:30 UTC — morning study reminder
    { path: "/api/cron/morning-push", schedule: "30 0 * * *" },
    // 22:30 KST = 13:30 UTC — evening review reminder
    { path: "/api/cron/evening-push", schedule: "30 13 * * *" },
  ],
};
