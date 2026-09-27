import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const statementRequest = z.object({
  donorName: z.string().min(1),
  period: z.string().min(1),
  donations: z.array(z.object({ date: z.string(), amountUsd: z.number().positive(), campaign: z.string() })).min(1),
  volunteerReminders: z.array(z.string()).default([]),
  campaigns: z.array(z.object({ name: z.string(), raisedUsd: z.number().nonnegative() })).default([])
});
export type StatementRequest = z.infer<typeof statementRequest>;

export function renderStatement(input: StatementRequest, usage: unknown): string {
  const rows = input.donations.map((d) => `<tr><td>${d.date}</td><td>${d.campaign}</td><td>$${d.amountUsd.toFixed(2)}</td></tr>`).join("");
  const reminders = input.volunteerReminders.map((r) => `<li>${r}</li>`).join("");
  const campaigns = input.campaigns.map((c) => `<li>${c.name}: $${c.raisedUsd.toFixed(2)}</li>`).join("");
  return `<h1>Account statement</h1><p>${input.donorName} · ${input.period}</p><table><tr><th>Date</th><th>Campaign</th><th>Amount</th></tr>${rows}</table><h2>Volunteer reminders</h2><ul>${reminders}</ul><h2>Campaign reporting</h2><ul>${campaigns}</ul><p>Usage snapshot: ${JSON.stringify(usage)}</p>`;
}

export async function exportStatement(input: unknown, client = new InfraiClient()): Promise<unknown> {
  const parsed = statementRequest.parse(input);
  const usage = await client.request("GET", "/v1/account/usage/timeseries");
  return client.request("POST", "/v1/pdf/generate", { markdown: renderStatement(parsed, usage), page_size: "A4", orientation: "portrait", store: false });
}
