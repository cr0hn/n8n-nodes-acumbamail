import { subscriberOperations, subscriberFields } from '../../nodes/Acumbamail/descriptions/SubscriberDescription';

describe('SubscriberDescription', () => {
  it('exports subscriberOperations array', () => {
    expect(Array.isArray(subscriberOperations)).toBe(true);
  });

  it('has all 9 expected operations', () => {
    const op = subscriberOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining([
      'getAll', 'add', 'delete', 'unsubscribe', 'batchAdd',
      'deleteAll', 'getDetails', 'search', 'getInactive',
    ]));
    expect(values).toHaveLength(9);
  });

  it('listId is required for operations that need it', () => {
    const field = subscriberFields.find((f) => f.name === 'listId')!;
    expect(field.required).toBe(true);
    const ops = field.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining(['getAll', 'add', 'delete', 'unsubscribe', 'batchAdd', 'deleteAll', 'getDetails']));
    expect(ops).not.toContain('search');
  });

  it('email is required for add, delete, unsubscribe, getDetails', () => {
    const emailField = subscriberFields.find((f) => f.name === 'email')!;
    expect(emailField.required).toBe(true);
    const ops = emailField.displayOptions?.show?.operation as string[];
    expect(ops).toEqual(expect.arrayContaining(['add', 'delete', 'unsubscribe', 'getDetails']));
  });

  it('search query field exists and is required', () => {
    const q = subscriberFields.find((f) => f.name === 'searchQuery')!;
    expect(q).toBeDefined();
    expect(q.required).toBe(true);
  });

  it('dateFrom and dateTo are required for getInactive', () => {
    const df = subscriberFields.find((f) => f.name === 'dateFrom')!;
    const dt = subscriberFields.find((f) => f.name === 'dateTo')!;
    expect(df.required).toBe(true);
    expect(dt.required).toBe(true);
  });
});
