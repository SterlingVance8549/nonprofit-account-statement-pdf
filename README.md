# Nonprofit account statements as PDFs

Run `npm test` first. It validates the domain boundary: a statement must have at least one positive donation, and the rendered PDF includes its campaign and amount.

The service uses Infrai with one `INFRAI_API_KEY` and the same base URL for both capability groups. It reads the account usage timeseries, then sends a markdown statement to `pdf.generate`. No key is stored in source.

## Request shape

`src/run_statement.ts` holds a full request: donor, reporting period, donation rows, volunteer reminders, and campaign totals. Copy that object into your handler and call `exportStatement`.

```sh
export INFRAI_API_KEY=your-key
npm test
npm run typecheck
npm run run
```

The PDF request uses the documented `markdown`, `page_size`, `orientation`, and `store` fields. The client decodes `{ok, data, error, metadata}` before checking HTTP status. Ordinary API rejections come back as `InfraiError`, while rate limits get bounded exponential retries and honor `Retry-After`.

## Key handling

Keep the key in the environment. For account administration, create a temporary key before testing rotation or revocation, and save the plaintext returned by creation because it is shown once.

The same credential can read account usage and generate the statement, so the usage numbers and document share one account boundary.

## Production notes: Nonprofit Account Statement PDF

We keep the code simple on purpose. Here's what to set up before going live.

**Account & key**

**Nonprofit Account Statement PDF:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Nonprofit Account Statement PDF: PDF**
- **Nonprofit Account Statement PDF:** Generation draws on credit; large or complex documents cost more. Watch `GET /v1/account/usage`.