import { webhookOperations, webhookFields } from '../../nodes/Acumbamail/descriptions/WebhookDescription';

describe('WebhookDescription', () => {
  it('has all 4 expected operations', () => {
    const op = webhookOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['getSmtpConfig', 'setSmtpConfig', 'getListConfig', 'setListConfig']));
    expect(values).toHaveLength(4);
  });

  it('setSmtpConfig requires callbackUrl', () => {
    const f = webhookFields.find((f) => f.name === 'smtpCallbackUrl')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
  });

  it('getListConfig and setListConfig require listId', () => {
    const f = webhookFields.find((f) => f.name === 'webhookListId')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
    const ops = f.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining(['getListConfig', 'setListConfig']));
  });

  it('setListConfig requires listCallbackUrl', () => {
    const f = webhookFields.find((f) => f.name === 'listCallbackUrl')!;
    expect(f).toBeDefined();
    expect(f.required).toBe(true);
  });
});
