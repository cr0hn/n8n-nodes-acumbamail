import { listOperations, listFields } from '../../nodes/Acumbamail/descriptions/ListDescription';

describe('ListDescription', () => {
  it('exports listOperations array', () => {
    expect(Array.isArray(listOperations)).toBe(true);
  });

  it('operation property shows only for list resource', () => {
    const op = listOperations.find((p) => p.name === 'operation')!;
    expect(op.displayOptions?.show?.resource).toContain('list');
  });

  it('has all 11 expected operations', () => {
    const op = listOperations.find((p) => p.name === 'operation')!;
    const values = (op.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining([
      'getAll', 'create', 'delete', 'getStats', 'getFields', 'getFieldTypes',
      'getSegments', 'getMergeFields', 'addMergeTag', 'getSubsStats', 'getForms',
    ]));
    expect(values).toHaveLength(11);
  });

  it('listId field is required for non-create operations', () => {
    const field = listFields.find((f) => f.name === 'listId')!;
    expect(field.required).toBe(true);
    const ops = field.displayOptions?.show?.operation as string[];
    expect(ops).not.toContain('create');
    expect(ops).not.toContain('getAll');
  });

  it('create operation has name and senderEmail as required fields', () => {
    const nameField = listFields.find((f) => f.name === 'name')!;
    const emailField = listFields.find((f) => f.name === 'senderEmail')!;
    expect(nameField.required).toBe(true);
    expect(emailField.required).toBe(true);
  });

  it('addMergeTag has fieldName and fieldType as required', () => {
    const fn = listFields.find((f) => f.name === 'fieldName')!;
    const ft = listFields.find((f) => f.name === 'fieldType')!;
    expect(fn.required).toBe(true);
    expect(ft.required).toBe(true);
  });

  it('fieldType options include text, number, date, boolean', () => {
    const ft = listFields.find((f) => f.name === 'fieldType')!;
    const values = (ft.options as { value: string }[]).map((o) => o.value);
    expect(values).toEqual(expect.arrayContaining(['text', 'number', 'date', 'boolean']));
  });
});
