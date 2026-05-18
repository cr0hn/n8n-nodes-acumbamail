# Changelog

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
