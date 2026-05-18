# Changelog

## [0.1.1] - 2026-05-18

### Fixed
- **IDE type errors** — created `tsconfig.test.json` that extends the root tsconfig, includes all `__tests__/**/*.ts` files, and sets `types: ["jest", "node"]`. This resolves all IDE diagnostics:
  - `Cannot find module '../../credentials/AcumbamailApi.credentials'` (and similar for GenericFunctions, all Description files) — caused by IDE resolving root `tsconfig.json` which excluded `**/*.test.ts` from `rootDir`
  - `Cannot find name 'describe'/'it'/'expect'/'jest'` — caused by missing `@types/jest` in tsconfig types
  - `Parameter 'p'/'f' implicitly has an 'any' type` (ts7044) — resolved as a side effect of proper tsconfig with jest globals correctly typed
- **jest.config.js** — updated `ts-jest` to reference `tsconfig.test.json` instead of an inline minimal tsconfig object, ensuring jest itself uses the same config the IDE sees

### No changes needed
- `gulpfile.js` / `jest.config.js` ts80001 warnings (CJS module conversion) — these are CJS by design, ignored per review instructions
- All 46 operations in `Acumbamail.node.ts` are correctly implemented and wired
- `AcumbamailTrigger.node.ts` already has `webhookMethods` with `checkExists`/`create`/`delete`
- `GenericFunctions.ts` already handles 401/403/429/5xx errors with descriptive messages
- All Description files have correct `displayOptions` — verified by 43 passing unit tests

## [0.1.0] - 2026-05-18

### Added
- Initial release of `n8n-nodes-acumbamail`
- **Action node** (`Acumbamail`) with 46 operations across 6 resources:
  - **List** (11 ops): getAll, create, delete, getStats, getFields, getFieldTypes, getSegments, getMergeFields, addMergeTag, getSubsStats, getForms
  - **Subscriber** (9 ops): getAll, add, batchAdd, delete, deleteAll, getDetails, search, unsubscribe, getInactive
  - **Campaign** (13 ops): getAll, create, getBasicInfo, getTotalInfo, getClicks, getOpeners, getOpenersByBrowser, getOpenersByOs, getOpenersByCountry, getSoftBounces, getByIsp, getLinks, getStatsByDate
  - **Template** (4 ops): getAll, create, duplicate, sendCampaign
  - **SMTP** (5 ops): sendEmail, sendCertified, sendBatch, getStatus, getCredits
  - **Webhook** (4 ops): getSmtpConfig, setSmtpConfig, getListConfig, setListConfig
- **Trigger node** (`AcumbamailTrigger`) for inbound webhook events (List and SMTP event types)
- **Credential type** (`AcumbamailApi`) with auth token and self-test via getLists endpoint
- Unit tests: 43 tests across 8 test suites — all passing
- Integration tests skeleton (require `ACUMBAMAIL_TOKEN` env var)
- Build pipeline: TypeScript 5.5 + gulp SVG copy to dist/
