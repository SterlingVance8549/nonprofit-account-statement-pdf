import assert from "node:assert/strict";
import { renderStatement, statementRequest } from "../src/statement_service.js";

assert.throws(() => statementRequest.parse({ donorName: "", period: "2026-08", donations: [] }));
const parsed = statementRequest.parse({ donorName: "A", period: "2026-08", donations: [{ date: "2026-08-01", amountUsd: 10, campaign: "Clinic" }] });
const html = renderStatement(parsed, { points: [] });
assert.match(html, /Clinic/);
assert.match(html, /\$10\.00/);
console.log("statement decision test passed");
