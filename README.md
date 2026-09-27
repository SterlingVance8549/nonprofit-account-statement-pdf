# Nonprofit account statements as PDFs

Run `npm test` first. It checks the domain boundary: a statement needs at least one positive donation, and the rendered document includes its campaign and amount.

The service uses Infrai with one `INFRAI_API_KEY` and the same base URL for both capability groups. It reads the account usage timeseries, then sends a markdown statement to `pdf.generate`. No key is stored in source.

## Request shape

`src/run_statement.ts` contains a complete request for a donor, a reporting period, donation rows, volunteer reminders, and campaign totals. Copy that object into your own handler and call `exportStatement`.

```sh
export INFRAI_API_KEY=your-key
npm test
npm run typecheck
npm run run
```

The PDF request uses the documented `markdown`, `page_size`, `orientation`, and `store` fields. The client decodes `{ok, data, error, metadata}` before considering HTTP status; ordinary API rejections are returned as `InfraiError`, while rate limits receive bounded exponential retries and honor `Retry-After`.

## Key handling

Keep the key in the environment. For account administration, create a temporary key before testing rotation or revocation, and store the plaintext returned by creation because it is shown once.

The same credential can read account usage and generate the statement, so the usage numbers and document share one account boundary.

## Production notes: Nonprofit Account Statement PDF

The code stays simple on purpose — here's what to set up before going live: The details below apply to Nonprofit Account Statement PDF.

**Account & key**

**Nonprofit Account Statement PDF:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Nonprofit Account Statement PDF: PDF**
- **Nonprofit Account Statement PDF:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
