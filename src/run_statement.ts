import { exportStatement } from "./statement_service.js";

const input = {
  donorName: "Maya Chen", period: "2026-08", donations: [{ date: "2026-08-14", amountUsd: 125, campaign: "Community clinic" }],
  volunteerReminders: ["Submit September shift availability"], campaigns: [{ name: "Community clinic", raisedUsd: 18450 }]
};
const result = await exportStatement(input);
console.log(JSON.stringify(result));
