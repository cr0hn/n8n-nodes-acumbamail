/**
 * Integration tests — require ACUMBAMAIL_TOKEN env var.
 * Run: ACUMBAMAIL_TOKEN=your-token npm run test:integration
 *
 * These tests create real resources and clean them up. They use a unique prefix
 * to avoid colliding with existing data.
 */
import { IExecuteFunctions } from 'n8n-workflow';

const TOKEN = process.env.ACUMBAMAIL_TOKEN;
const SKIP = !TOKEN;
const PREFIX = `n8n-test-${Date.now()}`;

if (SKIP) {
  console.log('⚠️  ACUMBAMAIL_TOKEN not set — skipping integration tests');
}

async function makeRequest(endpoint: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(`https://acumbamail.com/api/1/${endpoint}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_token: TOKEN, response_type: 'json', ...body }),
  });
  if (!res.ok) throw new Error(`${endpoint}: HTTP ${res.status}`);
  return res.json();
}

describe('Acumbamail Integration', () => {
  let listId: number;
  let campaignId: number;

  beforeAll(async () => {
    if (SKIP) return;
    const senderEmail = process.env.ACUMBAMAIL_SENDER_EMAIL ?? 'test@example.com';
    const res = await makeRequest('createList', {
      name: `${PREFIX}-list`,
      sender_email: senderEmail,
      description: 'n8n integration test list',
    }) as { id: number };
    listId = res.id ?? Number(Object.keys(res)[0]);
    expect(listId).toBeGreaterThan(0);
  });

  afterAll(async () => {
    if (SKIP || !listId) return;
    await makeRequest('deleteList', { list_id: listId }).catch(() => {});
  });

  (SKIP ? test.skip : test)('getLists returns array', async () => {
    const res = await makeRequest('getLists') as unknown[];
    expect(Array.isArray(res)).toBe(true);
  });

  (SKIP ? test.skip : test)('addSubscriber and getSubscriberDetails', async () => {
    const email = `${PREFIX}@example.com`;
    await makeRequest('addSubscriber', {
      list_id: listId,
      merge_fields: { email },
      double_optin: 0,
    });
    const details = await makeRequest('getSubscriberDetails', { list_id: listId, subscriber: email });
    expect(details).toBeDefined();
  });

  (SKIP ? test.skip : test)('searchSubscriber finds added subscriber', async () => {
    const email = `${PREFIX}@example.com`;
    const results = await makeRequest('searchSubscriber', { subscriber: email }) as unknown[];
    expect(results.length).toBeGreaterThan(0);
  });

  (SKIP ? test.skip : test)('getListStats returns stats object', async () => {
    const stats = await makeRequest('getListStats', { list_id: listId });
    expect(stats).toBeDefined();
  });

  (SKIP ? test.skip : test)('getListFields returns array', async () => {
    const fields = await makeRequest('getListFields', { list_id: listId });
    expect(fields).toBeDefined();
  });

  (SKIP ? test.skip : test)('getMergeFields returns result', async () => {
    const fields = await makeRequest('getMergeFields', { list_id: listId });
    expect(fields).toBeDefined();
  });

  (SKIP ? test.skip : test)('getCampaigns returns array', async () => {
    const campaigns = await makeRequest('getCampaigns', { complete_json: 1 }) as unknown[];
    expect(Array.isArray(campaigns)).toBe(true);
  });

  (SKIP ? test.skip : test)('getTemplates returns array', async () => {
    const templates = await makeRequest('getTemplates') as unknown[];
    expect(Array.isArray(templates)).toBe(true);
  });

  (SKIP ? test.skip : test)('getCreditsSMTP returns credits', async () => {
    const res = await makeRequest('getCreditsSMTP') as Record<string, unknown>;
    expect(res).toBeDefined();
  });

  (SKIP ? test.skip : test)('getSMTPWebhook returns config', async () => {
    const config = await makeRequest('getSMTPWebhook');
    expect(config).toBeDefined();
  });

  (SKIP ? test.skip : test)('getListWebhook returns config', async () => {
    const config = await makeRequest('getListWebhook', { list_id: listId });
    expect(config).toBeDefined();
  });
});
