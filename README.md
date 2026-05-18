# n8n-nodes-acumbamail

Community node for [n8n](https://n8n.io) that integrates with [Acumbamail](https://acumbamail.com), the Spanish email marketing platform.

## Features

- **46 operations** across 6 resources
- **Webhook trigger** for list and SMTP events
- Works with n8n self-hosted and n8n Cloud

## Resources and operations

| Resource | Operations |
|---|---|
| **List** | Get All, Create, Delete, Get Stats, Get Fields, Get Field Types, Get Segments, Get Merge Fields, Add Merge Tag, Get Subs Stats, Get Forms |
| **Subscriber** | Get All, Add, Delete, Unsubscribe, Batch Add, Delete All, Get Details, Search, Get Inactive |
| **Campaign** | Get All, Create, Get Basic Info, Get Total Info, Get Clicks, Get Openers, Get Openers By Browser, Get Openers By OS, Get Openers By Country, Get Soft Bounces, Get By ISP, Get Links, Get Stats By Date |
| **Template** | Get All, Create, Duplicate, Send Campaign |
| **SMTP** | Send Email, Send Batch, Send Certified Email, Get Status, Get Credits |
| **Webhook** | Get SMTP Config, Set SMTP Config, Get List Config, Set List Config |

## Installation

### n8n self-hosted

In your n8n instance, go to **Settings → Community Nodes** and install:

```
n8n-nodes-acumbamail
```

Or via CLI:

```bash
npm install n8n-nodes-acumbamail
```

## Credentials

1. Go to your [Acumbamail account](https://acumbamail.com) → **Profile → API**.
2. Copy your **Auth Token**.
3. In n8n, create a new **Acumbamail API** credential and paste the token.

## Trigger node

The **Acumbamail Trigger** node listens for webhook events sent by Acumbamail. After activating the workflow in n8n, copy the generated webhook URL and paste it into your Acumbamail account under **Settings → Webhooks**.

Supported event types:

| Event | List webhook | SMTP webhook |
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

- Acumbamail API rate limit: **10 requests/minute per endpoint**.
- The **SMTP** resource requires an active SMTP plan on your Acumbamail account.
- Campaign content must include the `*|UNSUBSCRIBE_URL|*` placeholder (required by Acumbamail).

## Development

```bash
git clone https://github.com/cr0hn/n8n-nodes-acumbamail.git
cd n8n-nodes-acumbamail
npm install
npm run build
npm test
```

Integration tests (require a real Acumbamail token):

```bash
ACUMBAMAIL_TOKEN=your-token ACUMBAMAIL_SENDER_EMAIL=you@example.com npm run test:integration
```

## License

MIT
