import { getCronSecret } from "@/core/config";
import { runDueIntervalAutomations } from "@/core/automation/service";
import { AuthenticationError, ConfigurationError } from "@/lib/errors/app-error";
import { failure, ok } from "@/server/http/responses";

export async function GET(req: Request) {
  try {
    const secret = getCronSecret();
    const authorization = req.headers.get("authorization");

    if (!secret) {
      if (process.env.NODE_ENV === "production") {
        throw new ConfigurationError({ message: "CRON_SECRET is required in production." });
      }
    } else if (authorization !== `Bearer ${secret}`) {
      throw new AuthenticationError({ message: "Invalid cron credentials." });
    }

    const results = await runDueIntervalAutomations();
    return ok({ ran: results.length });
  } catch (error) {
    return failure(error);
  }
}
