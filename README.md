# n8n-nodes-acumbamail

<p align="center"><em>Full Acumbamail integration for n8n — 46 operations, webhook trigger, zero boilerplate.</em></p>

<p align="center">
<a href="https://github.com/cr0hn/n8n-nodes-acumbamail/actions/workflows/ci.yml"><img src="https://github.com/cr0hn/n8n-nodes-acumbamail/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
<a href="https://www.npmjs.com/package/n8n-nodes-acumbamail"><img src="https://img.shields.io/npm/v/n8n-nodes-acumbamail.svg" alt="npm version"></a>
<a href="https://www.npmjs.com/package/n8n-nodes-acumbamail"><img src="https://img.shields.io/npm/dm/n8n-nodes-acumbamail.svg" alt="npm downloads"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/cr0hn/n8n-nodes-acumbamail.svg" alt="License"></a>
</p>

---

**n8n-nodes-acumbamail** connects [n8n](https://n8n.io) workflows to the [Acumbamail](https://acumbamail.com) email marketing platform. Manage **lists**, **subscribers**, **campaigns**, **templates**, and **transactional SMTP emails** — plus a **webhook trigger** that fires your workflows on any Acumbamail event.

```json
// Example output: Acumbamail → Get All Lists
[
  {
    "id": 1138335,
    "name": "Newsletter Q1 2026",
    "subscribers_count": 4820,
    "unsubscribed_count": 132,
    "bounced_count": 11
  }
]
```

## Installation

In your n8n instance go to **Settings → Community Nodes** and search for:

```
n8n-nodes-acumbamail
```

Or install manually on a self-hosted instance:

```bash
npm install n8n-nodes-acumbamail
```

## Getting Started

**1. Get your API token** — log into [Acumbamail](https://acumbamail.com) → **Profile → API** and copy your auth token.

**2. Add the credential in n8n** — create a new **Acumbamail API** credential and paste the token.

**3. Build your first workflow:**

- Add an **Acumbamail** node
- Select **Resource → Subscriber** and **Operation → Add**
- Fill in **List ID**, **Email** and any custom merge fields
- Connect it to a trigger (form, webhook, HTTP request — anything)

```console
Subscriber → Add
  List ID:   1138335
  Email:     new-user@example.com
  Fields:    name = "Alice", company = "Acme"
```

> [!TIP]
> Campaign content must include `*|UNSUBSCRIBE_URL|*` — Acumbamail rejects campaigns without it.

## Features

- **46 operations across 6 resources** — lists, subscribers, campaigns, templates, SMTP and webhooks, all in one node.
- **Webhook trigger** — starts your workflow instantly when someone subscribes, unsubscribes, bounces, opens or clicks in Acumbamail.
- **Transactional SMTP** — send single, batch and certified emails without leaving n8n (requires active SMTP plan).
- **Paginated subscriber export** — fetch large lists in blocks with `Get All` + `block_index`.
- **Campaign analytics** — openers by browser, OS, country, ISP, soft bounces and click stats, all as structured JSON.
- **Full credential self-test** — n8n verifies the token before saving it.

## Resources and operations

<details>
<summary><b>List</b> — 11 operations</summary>

| Operation | Description |
|---|---|
| Get All | Fetch all lists with subscriber and bounce counts |
| Create | Create a new list with sender details |
| Delete | Permanently delete a list |
| Get Stats | Full stats: subscribers, unsubscribes, bounces, campaigns |
| Get Fields | Custom fields defined on the list |
| Get Field Types | Field name → type mapping |
| Get Segments | Segments defined on the list |
| Get Merge Fields | Merge tags available for personalisation |
| Add Merge Tag | Add a new custom merge tag field |
| Get Subs Stats | Paginated per-subscriber statistics |
| Get Forms | Subscription forms for the list |

</details>

<details>
<summary><b>Subscriber</b> — 9 operations</summary>

| Operation | Description |
|---|---|
| Get All | Paginated subscriber list |
| Add | Add a subscriber with custom merge fields |
| Delete | Permanently delete a subscriber |
| Unsubscribe | Unsubscribe without deleting |
| Batch Add | Add multiple subscribers in one call |
| Delete All | Remove all subscribers from a list |
| Get Details | Full details for a single subscriber |
| Search | Search across all lists |
| Get Inactive | Inactive subscribers in a date range |

</details>

<details>
<summary><b>Campaign</b> — 13 operations</summary>

| Operation | Description |
|---|---|
| Get All | List all campaigns |
| Create | Create and optionally schedule a campaign |
| Get Basic Info | Name, subject, sender, status |
| Get Total Info | Delivered, opens, clicks, bounces, unsubscribes |
| Get Clicks | Per-URL click rates |
| Get Openers | List of subscribers who opened |
| Get Openers By Browser | Opens grouped by browser |
| Get Openers By OS | Opens grouped by OS |
| Get Openers By Country | Opens grouped by country |
| Get Soft Bounces | Soft bounce list with reason codes |
| Get By ISP | Stats grouped by mail provider |
| Get Links | All tracked URLs in the campaign |
| Get Stats By Date | Daily stats for a list in a date range |

</details>

<details>
<summary><b>Template</b> — 4 operations</summary>

| Operation | Description |
|---|---|
| Get All | List all templates |
| Create | Create a new template from HTML |
| Duplicate | Clone an existing template under a new name |
| Send Campaign | Create and send a campaign from a template |

</details>

<details>
<summary><b>SMTP</b> — 5 operations</summary>

| Operation | Description |
|---|---|
| Send Email | Send a single transactional email |
| Send Batch | Send multiple emails in one API call |
| Send Certified Email | Send with optional CC/BCC |
| Get Status | Check delivery status by email key |
| Get Credits | Remaining SMTP credits |

> [!IMPORTANT]
> SMTP operations require an active SMTP plan on your Acumbamail account.

</details>

<details>
<summary><b>Webhook</b> — 4 operations</summary>

| Operation | Description |
|---|---|
| Get SMTP Config | Current SMTP webhook configuration |
| Set SMTP Config | Configure SMTP webhook URL and events |
| Get List Config | Current list webhook configuration |
| Set List Config | Configure list webhook URL and events |

</details>

## Trigger node

The **Acumbamail Trigger** node starts your workflow when Acumbamail sends an event. After activating the workflow, copy the webhook URL shown in n8n and paste it in your Acumbamail account under **Settings → Webhooks**.

| Event | List trigger | SMTP trigger |
|---|---|---|
| New subscription | ✅ | — |
| Unsubscription | ✅ | — |
| Hard bounce | ✅ | ✅ |
| Soft bounce | ✅ | ✅ |
| Spam complaint | ✅ | ✅ |
| Email open | ✅ | ✅ |
| Link click | ✅ | ✅ |
| Delivered | — | ✅ |

## Notes

- **Rate limit:** 10 requests/minute per endpoint. n8n will surface a clear error if the limit is hit.
- **Unsubscribe placeholder:** Campaign and template HTML must include `*|UNSUBSCRIBE_URL|*` or the API rejects them.
- **Batch delete subscribers:** Acumbamail's batch-delete endpoint is currently broken server-side (HTTP 500) and is intentionally excluded from this node.

## Development

```bash
git clone https://github.com/cr0hn/n8n-nodes-acumbamail.git
cd n8n-nodes-acumbamail
npm install
npm run build   # compiles TypeScript + copies SVGs to dist/
npm test        # 43 unit tests, no credentials needed
```

Integration tests against the real Acumbamail API:

```bash
ACUMBAMAIL_TOKEN=your-token \
ACUMBAMAIL_SENDER_EMAIL=you@example.com \
npm run test:integration
```

## Contributing

Bug reports and pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE) © 2026 Dani (cr0hn@cr0hn.com)
